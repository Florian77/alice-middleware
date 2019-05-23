const R = require('ramda');
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
const {getCollectionEvent} = require("./database");
const {getCollectionAggregate} = require("./database");

// ----------------------------------------------------------
//  Handle Result: Save Data + send Event
// ----------------------------------------------------------
const storeAggregates = async (invokeKey, resultData) => {
    // if (debug && debug.storeAggregates) ftDev.logJsonString(resultData, `${moduleName}.storeAggregates()::resultData:`);
    const LN = `${moduleName}.storeAggregates()::`;

    const collectionAggregate = getCollectionAggregate();

    // TODO: Start Transaction

    // Load all Aggregates for invokeKey
    const currentAggregates = await collectionAggregate.find({invokeKey: invokeKey}).toArray();
    ftDev.logJsonString(currentAggregates.length, `${LN}currentAggregates.length:`);

    let resultKeyStrings = [];

    // run all updates
    await Promise.all(
        resultData.map(async ({resultType, key, payload = null, relations = []}, index) => {
            const LN1 = `${LN}data[${index}]:`;
            // const {type, id} = key;
            // const typeConfig = getTypeConfig(key);
            // ftDev.logJsonString(typeConfig, `${moduleName}.storeAggregates()::typeConfig:`);
            // ftDev.logJsonString(id, `${moduleName}.storeAggregates()::id:`);

            ftDev.logJsonString(resultType, `${LN1}resultType:`);

            const keyString = keyToString(key);
            ftDev.logJsonString(keyString, `${LN1}idString:`);

            resultKeyStrings.push(keyString);

            // Load Data
            const findItem = currentAggregates.find(d => d._id === keyString); //await collectionAggregate.findOne({_id: keyString});
            // ftDev.logJsonString(findItem, `${moduleName}.storeAggregates()::data[${index}]:collectionAggregate.findOne():`);

            const itemExists = !(R.isNil(findItem) || R.isEmpty(findItem) || findItem === false);
            // ftDev.logJsonString(itemExists, `${moduleName}.storeAggregates()::data[${index}]:itemExists:`);
            ftDev.log(`${LN1}.findOne():  --- ITEM ${!itemExists ? 'NOT EXISTS' : 'FOUND'} --- `);

            // TODO: Check if result is Error!!!

            let storeEvent = false;
            let eventType = null;

            // TODO: STORE RELATIONS !!!
            relations = R.map(keyToString, relations);
            ftDev.logJsonString(relations, `${LN1}relations:`);

            // ------------------------------
            //  Type: DATA
            // ------------------------------
            const itemData = {
                _id: keyString,
                ...key.type,
                aggregateId: keyToAggregateId(key),
                payload,
                relations,
                hasRelations: (relations.length > 0),
                invokeKey: invokeKey
            };
            // if (isResultTypeData(resultType)) {
                if (itemExists) {// Item already exists
                    if (!R.equals(findItem.payload, payload) || !R.equals(findItem.relations, relations)) { // Deep compair: Item changed
                        ftDev.log(`${LN1}  --- ITEM NEED UPDATE --- `);
                        const result = await collectionAggregate.replaceOne({ // Update Data
                                _id: keyString
                            },
                            itemData
                        );
                        // const checkedResult = ftDev.mongo.checkResult(result);
                        // ftDev.mongo.logReplaceOne(result, `${moduleName}.storeAggregates()::data[${index}]:collectionAggregate.replaceOne():`, true);
                        ftDev.log(`${LN1}.replaceOne():  --- REPLACE ITEM: ${ftDev.mongo.resultName(result)} --- `);

                        eventType = returnEventTypeUpdate;
                        storeEvent = true;
                    } else { // No changes
                        ftDev.log(`${LN1}  --- ITEM NOT CHANGED --- `);
                    }
                } else {// Item not exists
                    const result = await collectionAggregate.insertOne(itemData);
                    // const checkedResult = ftDev.mongo.checkResult(result);
                    // ftDev.mongo.logInsertOne(result, `${moduleName}.storeAggregates()::data[${index}]:collectionAggregate.insertOne():`, true);
                    ftDev.log(`${LN1}.insertOne():  --- INSERT ITEM: ${ftDev.mongo.resultName(result)} --- `);
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

                const result = await collectionAggregate.deleteOne({
                        _id: keyString
                    }
                );
                // const checkedResult = ftDev.mongo.checkResult(result);
                // ftDev.mongo.logDeleteOne(result, `${moduleName}.storeAggregates()::data[${index}]:collectionAggregate.deleteOne():`, true);
                ftDev.log(`${LN1}.deleteOne():  --- DELETE ITEM: ${ftDev.mongo.resultName(result)} --- `);

                await storeEventData(returnEventTypeDelete, aggregate, LN1);
            }
        })
    );

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
    const result = await getCollectionEvent().insertOne(eventData);
    // const checkedResult = ftDev.mongo.checkResult(result);

    ftDev.log(`${LN1}.insertOne():  --- EVENT CREATED: ${ftDev.mongo.resultName(result)} [${eventType.eventType}/${eventId}] --- `);
};

module.exports = {
    storeAggregates
};