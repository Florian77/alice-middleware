// const ftDev = require('ftws-node-dev-tools');
// const moduleName = 'alice-middleware';
// const serviceName = process.env.ALICE_MIDDLEWARE_SERVICE;
// if (debug && debug.service) ftDev.logJsonString(serviceName, `${moduleName}.serviceName:`);

const {
    connect,
    disconnect,
    getCollectionAggregate,
    getCollectionEvent,
    getCollectionCommand
} = require('./lib/database');

const keyHelper = require('./lib/key-helper');

const {
    getTypeConfig,
    setTypeConfig,
    makeTypeConfigString
} = require('./lib/global-type-config');

const {storeAggregates} = require('./lib/store-aggregates');

const {handleCommand} = require('./lib/handle-command');
const {processCommands} = require('./lib/process-commands');

const {handleEvent} = require('./lib/handle-event');
const {processEvents} = require('./lib/process-events');

const {
    loadAggregateByKeyString,
    loadAggregateByKey
} = require('./lib/load-aggregate');

const {
    returnResultTypeData,
    isResultTypeData,
    returnResultTypeDelete,
    isResultTypeDelete,
    returnResultTypeError,
    isResultTypeError,
    returnEmptyResult,
} = require('./lib/result-type');

const {
    returnEventTypeCreate,
    isEventTypeCreate,
    returnEventTypeUpdate,
    isEventTypeUpdate,
    returnEventTypeDelete,
    isEventTypeDelete,
} = require('./lib/event-type');


// ----------------------------------------------------------
//  Module Export
// ----------------------------------------------------------
module.exports = {
    setTypeConfig,
    getTypeConfig,
    makeTypeConfigString,

    key: keyHelper,

    connect,
    disconnect,

    // verifyEvent,
    // loadDependencies,
    storeAggregates,
    processEvents,
    handleEvent,
    processCommands,
    handleCommand,

    loadAggregateByKeyString,
    loadAggregateByKey,

    returnEventTypeCreate,
    isEventTypeCreate,
    returnEventTypeUpdate,
    isEventTypeUpdate,
    returnEventTypeDelete,
    isEventTypeDelete,

    returnResultTypeData,
    isResultTypeData,
    returnResultTypeDelete,
    isResultTypeDelete,
    returnResultTypeError,
    isResultTypeError,
    returnEmptyResult,

    getCollectionAggregate,
    getCollectionEvent,
    getCollectionCommand,
};



