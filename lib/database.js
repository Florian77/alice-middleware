const debug = require('./debug');
const ftDev = require('ftws-node-dev-tools');
const moduleName = require('./module-name');
const pack = require('../package');

let connection = null;
let database = null;

const isConnected = _ => !!connection && !!connection.topology && connection.topology.isConnected();

const connect = async () => {
    if (debug && debug.driver)
        ftDev.logJsonString(pack.version, `${moduleName}.version:`);

    if(!isConnected()) {
        // TODO: remove user+password from url log
        if (debug && debug.driver)
            ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_URL, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_URL:`);
        if (debug && debug.driver)
            ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_DB, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_DB:`);

        connection = new (require('mongodb').MongoClient)(process.env[`ALICE_MIDDLEWARE_MONGODB_URL`], {useNewUrlParser: true});
        await connection.connect();
        database = await connection.db(process.env[`ALICE_MIDDLEWARE_MONGODB_DB`]);
        if (debug && debug.driver) ftDev.log(`${moduleName}.connect()::ONLINE`);
    }
    else {
        if (debug && debug.driver) ftDev.log(`${moduleName}.connect()::ALREADY-ONLINE`);
    }
};

const disconnect = async () => {
    await connection.close();
    // connection = null;
    // database = null;
    // if(debug && debug.driver) ftDev.logJsonString(result, `${moduleName}.disconnect()::result:`);
    if (debug && debug.driver) ftDev.log(`${moduleName}.disconnect()::OFFLINE`);
};

const getCollection = collectionName => database.collection(collectionName);
const getCollectionAggregate = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_AGGREGATE);
const getCollectionEvent = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_EVENT);
const getCollectionCommand = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_COMMAND);

const checkIndexes = async () => {
    let indexList = [];
    // Aggregate
    {
        const indexName = await getCollectionAggregate().createIndexes({
                "context": 1,
                "aggregate": 1,
                "relations": 1
            },
            {
                name: "Alice_ContextAggregateRelations",
            });
        ftDev.logJsonString(indexName, `${moduleName}.checkIndexes():Index created:`);
        indexList.push(indexName);
    }
    {
        const indexName = await getCollectionAggregate().createIndex({
                "context": 1,
                "aggregate": 1,
                "index": 1
            },
            {
                name: "Alice_ContextAggregateIndex",
            });
        ftDev.logJsonString(indexName, `${moduleName}.checkIndexes():Index created:`);
        indexList.push(indexName);
    }
    {
        const indexName = await getCollectionAggregate().createIndex({
                "invokeKey": 1
            },
            {
                name: "Alice_InvokeKey",
            });
        ftDev.logJsonString(indexName, `${moduleName}.checkIndexes():Index created:`);
        indexList.push(indexName);
    }

    // Event
    {
        const indexName = await getCollectionEvent().createIndex({
                "handled": 1
            },
            {
                name: "Alice_Handled",
            });
        ftDev.logJsonString(indexName, `${moduleName}.checkIndexes():Index created:`);
        indexList.push(indexName);
    }

    // Command
    {
        const indexName = await getCollectionCommand().createIndex({
                "handled": 1
            },
            {
                name: "Alice_Handled",
            });
        ftDev.logJsonString(indexName, `${moduleName}.checkIndexes():Index created:`);
        indexList.push(indexName);
    }

    return  indexList;
};

module.exports = {
    connect,
    disconnect,
    isConnected,
    getCollection,
    getCollectionAggregate,
    getCollectionEvent,
    getCollectionCommand,
    checkIndexes,
};
