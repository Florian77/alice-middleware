const R = require('ramda');
const ftDev = require('ftws-node-dev-tools');
const {isEventTypeCreate} = require("./event-type");
const {storeAggregates} = require("./store-aggregates");
const {loadAggregateByKey} = require("./load-aggregate");
const {getTypeConfig} = require("./global-type-config");
// const moduleName = require('./module-name');

// ----------------------------------------------------------
//  Handle Event:
// ----------------------------------------------------------
const handleCommand = async (command) => {
    const objectType = {context: command.context, aggregate: command.aggregate},
        aggregateKey = command.payload.aggregateKey;

    const LN = `.handleCommand(${objectType.context}/${objectType.aggregate})::`;

    const typeConfig = getTypeConfig(objectType);

    const exeFn = require(`../../type/${typeConfig.context}/${typeConfig.aggregate}/exe-fn`);
    // ftDev.logJsonString(exeFn, 'handleCommand()::exeFn:'); //const verifyEventResult =
    // TODO: Verify Type
    // ftDev.log(`${LN}exeFn.type:`, exeFn.type);
    ftDev.log(`${LN}aggregateKey:`, aggregateKey);

    let resultData = [];
    let invokeKey = false;
    if (isEventTypeCreate(command)) {
        invokeKey = exeFn.getInvokeKeyOnCreate(command);
    }
    else {
        invokeKey = command.payload.invokeKey;
    }

    // No Data
    if(invokeKey === false) {
        ftDev.log(`${LN}: ---  NO PARENT ID ---`);
    }
    else {
        ftDev.logJsonString(invokeKey, `${LN}invokeKey:`);

        const aggregateIds = exeFn.getAggregateIds(invokeKey);
        ftDev.logJsonString(aggregateIds, `${LN}exeFn.getAggregateIds(${invokeKey}):`);

        const aggregates = await Promise.all(R.map( loadAggregateByKey, aggregateIds));
        // ftDev.logJsonString(aggregates, `${LN}aggregates:`);

        resultData = await exeFn.createAggregates(aggregates);
    }
    // ftDev.logJsonString(resultData, `${LN}resultData[without:Key.type]:`);

    // Add TypeConfig
    resultData.map(d => {
        d.key.type = {
            context: typeConfig.context,
            aggregate: typeConfig.aggregate
        };
    });
    // ftDev.logJsonString(resultData, `${LN}resultData:`);
    await storeAggregates(invokeKey, resultData);
};

module.exports = {
    handleCommand
};