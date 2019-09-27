const ftDev = require("ftws-node-dev-tools");
const {is} = require('ramda');
const {keySeparatorContext} = require('./key-separators');
const {resolve} = require('path');

let globalTypeConfig = {},
    subscriptions = {},
    typeExeFnPath = '../../../type/';


const makeTypeConfigString = type => {
    return type.context + keySeparatorContext + type.aggregate;
};

const setTypeConfig = config => {
    // TODO: verify new Type Config
    // ftDev.logJsonString(config, 'setTypeConfig():');
    globalTypeConfig = config;

    // create subscription index
    subscriptions = {};
    globalTypeConfig.map(type => {
        subscriptions[makeTypeConfigString(type)] = [];
    });

    globalTypeConfig.map(type => {
        if (type.subscribe) {
            type.subscribe.map(subscribe => {
                subscriptions[makeTypeConfigString(subscribe)].push({
                    context: type.context,
                    aggregate: type.aggregate
                });
            });
        }
    });
    // ftDev.logJsonString(subscriptions, 'subscriptions:');
};

const setTypeExeFnPath = (dirname, path, loadTypeConfigFromPath = false) => {
    typeExeFnPath = resolve(dirname, path); // path;
    if (loadTypeConfigFromPath) {
        setTypeConfig(require(resolve(typeExeFnPath, 'type-config')))
    }
};

const loadTypeExeFn = (data, data2 = false) => {
    if(data2 === false) {
        return require(resolve(typeExeFnPath, data.context, data.aggregate, 'exe-fn'));
    }
    else {
        return require(resolve(typeExeFnPath, data, data2, 'exe-fn'));
    }
};

const getSubscriptions = (type = false) => {
    if (type === false) {
        return subscriptions;
    }
    const typeString = is(String)(type) ? type : makeTypeConfigString(type);
    if (!subscriptions[typeString]) {
        throw Error(`.getSubscriptions() type: [${typeString}] not exists !`);
    }

    return subscriptions[typeString];
};


const getTypeConfig = (data, data2 = false) => {
    let context = false, aggregate = false;
    if (data && data.id && data.type && data.type.context && data.type.aggregate) { // Data is Key
        context = data.type.context;
        aggregate = data.type.aggregate;
    } else if (data && data.context && data.aggregate) { // Data is Aggregate
        context = data.context;
        aggregate = data.aggregate;
    } else if (data && data2) {
        context = data;
        aggregate = data2;
    }

    if (!context || !aggregate) {
        throw Error(`.getTypeConfig() [${data}] [${data2}] missing!`);
    }

    const typeConfig = globalTypeConfig.find(d => d.context === context && d.aggregate === aggregate);
    if (!typeConfig) {
        throw Error(`.getTypeConfig() typeConfig context: [${context}] aggregate: [${aggregate}] not exists !`);
    }

    return typeConfig;
};

const getFullTypeConfig = () => globalTypeConfig;

module.exports = {
    setTypeConfig,
    setTypeExeFnPath,
    loadTypeExeFn,
    getTypeConfig,
    makeTypeConfigString,
    getSubscriptions,
    getFullTypeConfig,
};