const debug = require('./debug');
const ftDev = require('ftws-node-dev-tools');
const moduleName = require('./module-name');
const pack = require('../package');
const MongoClient = require('mongodb').MongoClient;

let client = null;
let database = null;

const isConnected = _ => !!client && !!client.topology && client.topology.isConnected();

const connect = async () => {
    if (debug && debug.driver)
        ftDev.logJsonString(pack.version, `${moduleName}.version:`);

    if(!isConnected()) {
        // TODO: remove user+password from url log
        if (debug && debug.driver)
            ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_URL, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_URL:`);
        if (debug && debug.driver)
            ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_DB, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_DB:`);

        // client = new MongoClient(process.env[`ALICE_MIDDLEWARE_MONGODB_URL`], {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            // const res = await client.connect();
            client = await MongoClient.connect(process.env[`ALICE_MIDDLEWARE_MONGODB_URL`], {useNewUrlParser: true, useUnifiedTopology: true});
            // console.log(client, "client");
            // console.log(isConnected(), "isConnected()");
            database = await client.db(process.env[`ALICE_MIDDLEWARE_MONGODB_DB`]);
            if (debug && debug.driver) ftDev.log(`${moduleName}.connect()::ONLINE`);
        }
        catch (e) {
            if (debug && debug.driver) console.error(e);
            return false;
        }

    }
    else {
        if (debug && debug.driver) ftDev.log(`${moduleName}.connect()::ALREADY-ONLINE`);
    }
    return true;
};

const disconnect = async () => {
    await client.close();
    // client = null;
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
        const indexName = await getCollectionAggregate().createIndex({
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
