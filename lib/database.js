const debug = require('./debug');
const ftDev = require('ftws-node-dev-tools');
const moduleName = require('./module-name');

let connection = null;
let database = null;
const connect = async () => {
    if (debug && debug.driver) ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_URL, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_URL:`);
    if (debug && debug.driver) ftDev.logJsonString(process.env.ALICE_MIDDLEWARE_MONGODB_DB, `${moduleName}.connect()::env.ALICE_MIDDLEWARE_MONGODB_DB:`);
    connection = new (require('mongodb').MongoClient)(process.env[`ALICE_MIDDLEWARE_MONGODB_URL`], {useNewUrlParser: true});
    await connection.connect();
    database = await connection.db(process.env[`ALICE_MIDDLEWARE_MONGODB_DB`]);
    if (debug && debug.driver) ftDev.log(`${moduleName}.connect()::ONLINE`);
};
const disconnect = async () => {
    await connection.close();
    // if(debug && debug.driver) ftDev.logJsonString(result, `${moduleName}.disconnect()::result:`);
    if (debug && debug.driver) ftDev.log(`${moduleName}.disconnect()::OFFLINE`);
};

const getCollection = collectionName => database.collection(collectionName);
const getCollectionAggregate = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_AGGREGATE);
const getCollectionEvent = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_EVENT);
const getCollectionCommand = () => database.collection(process.env.ALICE_MIDDLEWARE_MONGODB_COLL_COMMAND);

module.exports = {
    connect,
    disconnect,
    getCollection,
    getCollectionAggregate,
    getCollectionEvent,
    getCollectionCommand,
};
