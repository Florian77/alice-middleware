const {mergeRight} = require('ramda');
const {invokeKeyStringToObject, addObjectKeyToAggregate} = require('./lib/key-helper');
const ftDev = require('ftws-node-dev-tools');

const resultSplitString = "\n--------------------------------------------------------\n";

// TODO: Add debug output options

const loadAggregate = (data, additionalData = {}) => {
    data = mergeRight(
        data,
        mergeRight(
            {
                "exists": true
            },
            additionalData
        )
    );
    return addObjectKeyToAggregate(data);
};

const test__makeInvokeKeyOnCreate = (exeFn, objectKey) => {
    ftDev.log(resultSplitString);
    ftDev.logJsonString(objectKey, `exeFn.makeInvokeKeyOnCreate()::objectKey:`);
    const result = exeFn.makeInvokeKeyOnCreate(objectKey);
    ftDev.logJsonString(result, `exeFn.makeInvokeKeyOnCreate()::result:`);
    return result;
};


const test__makeAggregateIds = (exeFn, invokeKey) => {
    ftDev.log(resultSplitString);
    ftDev.logJsonString(invokeKey, `exeFn.makeAggregateIds()::invokeKey:`);
    const result = exeFn.makeAggregateIds(invokeKeyStringToObject(invokeKey), invokeKey);
    ftDev.logJsonString(result, `exeFn.makeAggregateIds()::result:`);
    return result;
};

const test__createAggregates = async (exeFn, aggregates, invokeKey = '', showInputAggregates = false) => {
    ftDev.log(resultSplitString);
    if(showInputAggregates)
        ftDev.logJsonString(aggregates, `exeFn.createAggregates()::aggregates:`);
    const result = await exeFn.createAggregates(aggregates, invokeKeyStringToObject(invokeKey), invokeKey);
    ftDev.logJsonString(result, `exeFn.createAggregates()::result:`);
    return result;
};


const clearDatabase = async alice => {
    // console.log((new Date()).getMilliseconds());
// return false;
    try {
        // Connect to Database
        await alice.connect();

        const res1 = await alice.getCollectionAggregate().deleteMany({});
        ftDev.mongo.logDeleteMany(res1, 'alice.getCollectionAggregate().deleteMany({})', true);

        const res2 = await alice.getCollectionEvent().deleteMany({});
        ftDev.mongo.logDeleteMany(res2, 'alice.getCollectionEvent()deleteMany({})', true);

        const res3 = await alice.getCollectionCommand().deleteMany({});
        ftDev.mongo.logDeleteMany(res3, 'alice.getCollectionCommand()deleteMany({})', true);

    } catch (e) {
        ftDev.error(e);
        return false;
    }

    console.log('');
    // await sleep(10);
    // console.log('Y');
    // await alice.disconnect();

    return true;
};


module.exports = {
    loadAggregate,
    test__makeInvokeKeyOnCreate,
    test__makeAggregateIds,
    test__createAggregates,
    clearDatabase
};


/*
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}*/
