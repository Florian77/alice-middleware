const {addObjectKeyToAggregate} = require("./key-helper");
const {keyToString} = require("./key-helper");
const {getCollectionAggregate} = require("./database");
const ftDev = require('ftws-node-dev-tools');
const {keyStingToObjectKey} = require("./key-helper");

const loadAggregateByKeyString = async (keyString) => {
    let aggregate = await getCollectionAggregate().findOne({_id: keyString});

    if (!aggregate) {
        aggregate = {
            key: keyStingToObjectKey(keyString),
            payload: {},
            meta: {},
            relations: [],
            exists: false
        };
        // ftDev.logJsonString(aggregate, `loadAggregateByKeyString(${keyString})`);
    }
    else {
        aggregate.exists = true;
        aggregate = addObjectKeyToAggregate(aggregate);
    }
    return aggregate;
};

const loadAggregateByKey = async (key) => {
    return loadAggregateByKeyString(keyToString(key));

};

// TODO: findAggregate()

module.exports = {
    loadAggregateByKeyString,
    loadAggregateByKey
};