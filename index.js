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

const {handleEvent} = require('./lib/handle-event');

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
    handleEvent,
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




// ----------------------------------------------------------
//  verify Event is processable
// ----------------------------------------------------------
/*
const verifyEvent = async (eventData, typeConfig) => {
    if (!eventData || !eventData.id || !eventData.id.type) throw Error(`${moduleName}.verifyEvent(): eventData.id.type missing`);
    if (!eventData || !eventData.id || !eventData.id.key) throw Error(`${moduleName}.verifyEvent(): eventData.id.key missing`);
    if (!typeConfig || !typeConfig.subscribe) throw Error(`${moduleName}.verifyEvent(): typeConfig.subscribe missing`);

    const {type, key} = eventData.id;

    // check type subscriptions
    const subscribeTypes = R.map(R.prop('type'), typeConfig.subscribe);
    if (debug && debug.verifyEvent) ftDev.logJsonString(type, `${moduleName}.verifyEvent()::type:`);
    if (debug && debug.verifyEvent) ftDev.logJsonString(subscribeTypes, `${moduleName}.verifyEvent()::subscribeTypes:`);
    if (!R.includes(type, subscribeTypes)) {
        throw Error(`${moduleName}.verifyEvent(): Event [${type}] not subscribed [${subscribeTypes.join(',')}]`);
    }

    if (typeConfig.verifyEvent && !typeConfig.verifyEvent(eventData, typeConfig)) {
        throw Error(`${moduleName}.verifyEvent(): typeConfig.verifyEvent(eventData, typeConfig) faild`);
    }

    return true;
};
*/


// ----------------------------------------------------------
//  Load dependent Data
// ----------------------------------------------------------
/*const loadDependencies = async (dependencies) => {
    if (debug && debug.loadDependencies) ftDev.logJsonString(dependencies, `${moduleName}.loadDependencies()::dependencies:`);

    let dependentData = [];
    // DEMO
    if (dependencies) {
        dependentData = [dependencies];
    }
    // TODO: Load all Items or throw Error

    return dependentData;
};*/
