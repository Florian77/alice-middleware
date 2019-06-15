const {map, concat} = require('ramda');
const ftDev = require('ftws-node-dev-tools');
const {isEventTypeCreate} = require("./event-type");
const {storeAggregates} = require("./store-aggregates");
const {loadAggregateByKey} = require("./load-aggregate");
const {getTypeConfig, loadTypeExeFn} = require("./global-type-config");
// const moduleName = require('./module-name');
const {invokeKeyStringToObject} = require('./key-helper');

const checkMissingAggregate = result => (undefined !== (result && result.type && result.type === 'MissingAggregate' && result.keys && result.keys.length > 0) );

// ----------------------------------------------------------
//  Handle Event:
// ----------------------------------------------------------
const handleCommand = async (command) => {
    const objectType = {context: command.context, aggregate: command.aggregate};
    // const aggregateKey = command.payload.aggregateKey;

    const LN = `.handleCommand(${objectType.context}/${objectType.aggregate})::`;

    const typeConfig = getTypeConfig(objectType);

    // const exeFn = require(`../../type/${typeConfig.context}/${typeConfig.aggregate}/exe-fn`);
    const exeFn = loadTypeExeFn(typeConfig); //require(`../../type/${typeConfig.context}/${typeConfig.aggregate}/exe-fn`);
    // ftDev.logJsonString(exeFn, 'handleCommand()::exeFn:'); //const verifyEventResult =
    // TODO: Verify Type
    // ftDev.log(`${LN}exeFn.type:`, exeFn.type);
    // ftDev.log(`${LN}aggregateKey:`, aggregateKey);

    let resultData = [];
    let invokeKey = false;
    if (command.commandType === 'create') {
        const aggregateKey = command.payload.aggregateKey;
        invokeKey = exeFn.makeInvokeKeyOnCreate(aggregateKey);
    } else {
        invokeKey = command.payload.invokeKey;
    }

    // No Data
    if (invokeKey === false) {
        ftDev.log(`${LN}: ---  NO invokeKey ---`);
    } else {
        ftDev.logJsonString(invokeKey, `${LN}invokeKey:`);

        const aggregateIds = exeFn.makeAggregateIds(invokeKeyStringToObject(invokeKey), invokeKey);
        // ftDev.logJsonString(aggregateIds, `${LN}exeFn.makeAggregateIds(${invokeKey}):`);

        let aggregates = await Promise.all(map(loadAggregateByKey, aggregateIds));
        // ftDev.logJsonString(aggregates, `${LN}aggregates:`);

        let counter = 0;
        do {
            counter += 1;
            ftDev.logJsonString(counter, `${LN}counter:`);

            if (checkMissingAggregate(resultData)) {
                // ftDev.logJsonString(resultData, `${LN}checkMissingAggregate(resultData):`);
                const missingAggregates = await Promise.all(map(loadAggregateByKey, resultData.keys));
                // TODO: Add load Error!
                aggregates = concat(aggregates, missingAggregates );
            }
            resultData = await exeFn.createAggregates(aggregates);
        } while (counter < 10 && checkMissingAggregate(resultData) );

    }
    // ftDev.logJsonString(resultData, `${LN}resultData[without:Key.type]:`);

    // Add TypeConfig
    // ftDev.logJsonString(checkMissingAggregate(resultData), `${LN}checkMissingAggregate(resultData):`);
    if(checkMissingAggregate(resultData)){
        // TODO: Add Error handling
        resultData = [];
    }
    else {
        resultData.map(d => {
            d.key.type = {
                context: typeConfig.context,
                aggregate: typeConfig.aggregate
            };
        });
    }

    // ftDev.logJsonString(resultData, `${LN}resultData:`);
    await storeAggregates(invokeKey, resultData);
};

module.exports = {
    handleCommand
};

