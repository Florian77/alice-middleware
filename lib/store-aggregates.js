const {equals, isNil, isEmpty, map} = require('ramda');
const uuidv4 = require('uuid/v4');
const {isResultTypeDelete} = require("./result-type");
const {returnEventTypeCreate} = require("./event-type");
const {returnEventTypeUpdate} = require("./event-type");
const {isResultTypeData} = require("./result-type");
// const debug = require('./debug');
const ftDev = require('ftws-node-dev-tools');
const moduleName = require('./module-name');
const {returnEventTypeDelete} = require("./event-type");
const {keyToAggregateId} = require("./key-helper");
const {keyToString} = require("./key-helper");
const {invokeKeyStringToObject} = require("./key-helper");
const {getCollectionEvent} = require("./database");
const {getCollectionAggregate} = require("./database");
const {getCollectionCommand} = require("./database");
const {getTypeConfig} = require("./global-type-config");

// ----------------------------------------------------------
//  Handle Result: Save Data + send Event
// ----------------------------------------------------------
const storeAggregates = async (invokeKey, resultData) => {
    // if (debug && debug.storeAggregates) ftDev.logJsonString(resultData, `${moduleName}.storeAggregates()::resultData:`);
    const LN = `${moduleName}.storeAggregates()::`;

    // TODO: Start Transaction

    // Load all Aggregates for invokeKey
    const currentAggregates = await getCollectionAggregate().find({invokeKey: invokeKey}).toArray();
    ftDev.logJsonString(currentAggregates.length, `${LN}currentAggregates.length:`);

    let resultKeyStrings = [];

    // run all updates
    await Promise.all(
        resultData.map(async ({resultType, key, meta = {}, payload = {}, relations = []}, index) => {
            const LN1 = `${LN}data[${index}]:`;
            // const {type, id} = key;
            // const typeConfig = getTypeConfig(key);
            // ftDev.logJsonString(typeConfig, `${moduleName}.storeAggregates()::typeConfig:`);
            // ftDev.logJsonString(id, `${moduleName}.storeAggregates()::id:`);
            // ftDev.logJsonString(resultType, `${LN1}resultType:`);

            const keyString = keyToString(key);
            // ftDev.logJsonString(keyString, `${LN1}idString:`);
            resultKeyStrings.push(keyString);

            // Load Data
            const findItem = currentAggregates.find(d => d._id === keyString); //await getCollectionAggregate().findOne({_id: keyString});
            // ftDev.logJsonString(findItem, `${moduleName}.storeAggregates()::data[${index}]:getCollectionAggregate().findOne():`);

            const itemExists = !(isNil(findItem) || isEmpty(findItem) || findItem === false);
            // ftDev.logJsonString(itemExists, `${moduleName}.storeAggregates()::data[${index}]:itemExists:`);
            ftDev.log(`${LN1}.findOne():  --- ITEM ${!itemExists ? 'NOT EXISTS' : 'FOUND'} --- `);

            // TODO: Check if result is Error ???

            let storeEvent = false;
            let eventType = null;

            relations = map(keyToString, relations);
            // ftDev.logJsonString(relations, `${LN1}relations:`);

            // ------------------------------
            //  Type: DATA
            // ------------------------------
            const itemData = {
                _id: keyString,
                ...key.type,
                aggregateId: keyToAggregateId(key),
                index: key.id,
                meta,
                payload,
                relations,
                hasRelations: (relations.length > 0),
                invokeKey: invokeKey
            };
            // if (isResultTypeData(resultType)) {
            if (itemExists) {// Item already exists
                if (!equals(findItem.meta, meta) || !equals(findItem.payload, payload) || !equals(findItem.relations, relations)) { // Deep compair: Item changed
                    ftDev.log(`${LN1}  --- ITEM NEED UPDATE --- `);
                    const result = await getCollectionAggregate().replaceOne({ // Update Data
                            _id: keyString
                        },
                        itemData
                    );
                    // const checkedResult = ftDev.mongo.checkResult(result);
                    // ftDev.mongo.logReplaceOne(result, `${moduleName}.storeAggregates()::data[${index}]:getCollectionAggregate().replaceOne():`, true);
                    ftDev.log(`${LN1}.replaceOne():  --- REPLACE ITEM: ${ftDev.mongo.resultName(result)} --- `);

                    eventType = returnEventTypeUpdate;
                    storeEvent = true;
                } else { // No changes
                    ftDev.log(`${LN1}  --- ITEM NOT CHANGED --- `);
                }
            } else {// Item not exists
                try {
                    const result = await getCollectionAggregate().insertOne(itemData);
                    // const checkedResult = ftDev.mongo.checkResult(result);
                    // ftDev.mongo.logInsertOne(result, `${moduleName}.storeAggregates()::data[${index}]:getCollectionAggregate().insertOne():`, true);
                    ftDev.log(`${LN1}.insertOne():  --- INSERT ITEM: ${ftDev.mongo.resultName(result)} --- `);
                }
                catch (e) {
                    // TODO: Add Error Handling
                    console.log(e);
                }
                eventType = returnEventTypeCreate;
                storeEvent = true;
            }
            // }

            // ------------------------------
            //  Type: NOT Supported
            // ------------------------------
            // else {
            //     throw Error(`${LN1}resultType [${resultType}] not supported`);
            // }

            // ------------------------------
            //  Save Event
            // ------------------------------
            // ftDev.logJsonString(storeEvent, `${moduleName}.storeAggregates()::data[${index}]:storeEvent:`);
            if (storeEvent !== false) {
                await storeEventData(eventType, itemData, LN1);

            } else {
                ftDev.log(`${LN1}  --- NO EVENT  --- `);
            }
        })
    );

    // delete not existing aggregates
    await Promise.all(
        currentAggregates.map(async (aggregate, index) => {
            const {_id: keyString} = aggregate;
            const LN1 = `${LN}currentAggregates[${keyString}]`;

            if (resultKeyStrings.includes(keyString)) {
                ftDev.log(`${LN1}  --- EXISTS  --- `);
            } else {
                ftDev.log(`${LN1}  --- DELETE  --- `);

                const result = await getCollectionAggregate().deleteOne({
                        _id: keyString
                    }
                );
                // const checkedResult = ftDev.mongo.checkResult(result);
                // ftDev.mongo.logDeleteOne(result, `${moduleName}.storeAggregates()::data[${index}]:getCollectionAggregate().deleteOne():`, true);
                ftDev.log(`${LN1}.deleteOne():  --- DELETE ITEM: ${ftDev.mongo.resultName(result)} --- `);

                await storeEventData(returnEventTypeDelete, aggregate, LN1);
            }
        })
    );

    // Check if update command exists
    if (resultData && resultData.length > 0) {
        const findInvokeCommandResult = await getCollectionCommand().findOne({_id: invokeKey});
        // ftDev.logJsonString(findInvokeCommandResult, `getCollectionCommand().findOne(_id:${invokeKey}):`);
        const invokeKeyObject = invokeKeyStringToObject(invokeKey);
        // ftDev.logJsonString(invokeKeyObject, '---> invokeKeyObject:');
        const invokeTypeConfig = getTypeConfig(invokeKeyObject);
        // ftDev.logJsonString(invokeTypeConfig, '---> invokeTypeConfig:');
        if (!findInvokeCommandResult && invokeTypeConfig && invokeTypeConfig.invokeCommand) {
            const insertInvokeCommand = {
                _id: invokeKey,
                context: invokeKeyObject.context,
                aggregate: invokeKeyObject.aggregate,
                commandType: 'invoke',
                handled: true,
                createdAt: new Date(),
                lastUpdateAt: new Date(),
                handledAt: new Date(),
                payload: {
                    invokeKey: invokeKey
                },
                upsertCounter: 0,
            };
            // ftDev.logJsonString(insertInvokeCommand, `${LN}::insertInvokeCommand:`);
            try {
                const insertResult = await getCollectionCommand().insertOne(insertInvokeCommand);
                // ftDev.logJsonString(insertResult, `.result:`);
                ftDev.log(`${LN}::.insertOne():insertInvokeCommand: --- ${ftDev.mongo.resultName(insertResult)} [${invokeKey}] --- `);
            }
            catch (e) {
                // TODO: Add error handling
                console.log(e);
            }

        }
    }
    // Delete Re Invoke Command
    else {
        const deleteInvokeCommandResult = await getCollectionCommand().deleteOne({_id: invokeKey});
        ftDev.mongo.logDeleteOne(deleteInvokeCommandResult, `${LN}.deleteInvokeCommand:deleteOne():`, true);
        ftDev.log(`${LN}.deleteInvokeCommand:deleteOne():  --- DELETE ITEM: ${ftDev.mongo.resultName(deleteInvokeCommandResult)} [${invokeKey}]--- `);
    }


    // TODO: Commit Transaction


};


const storeEventData = async (eventType, itemData, LN1 = '') => {

    const timestamp = (new Date()).valueOf(); // TODO: Make GMT / UTC ?
    const eventId = timestamp + '-' + uuidv4();
    const eventData = {
        // timestamp,
        createdAt: new Date(),
        handled: false,
        handledAt: null,
        keyString: itemData._id,
        ...itemData,
        ...eventType,
        _id: eventId,
    };
    // ftDev.logJsonString(eventData, `${moduleName}.storeAggregates()::data[${index}]:eventData:`);
    try {
        const result = await getCollectionEvent().insertOne(eventData);
        // const checkedResult = ftDev.mongo.checkResult(result);
        ftDev.log(`${LN1}.insertOne():  --- EVENT CREATED: ${ftDev.mongo.resultName(result)} [${eventType.eventType}/${eventId}] --- `);
    }
    catch (e) {
        // TODO: Add Error Handling
        console.log(e);
    }

};

module.exports = {
    storeAggregates
};