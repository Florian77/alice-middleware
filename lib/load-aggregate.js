const {keyToString} = require("./key-helper");
const {getCollectionAggregate} = require("./database");

const loadAggregateByKeyString = async (keyString) => {
    return await getCollectionAggregate().findOne({_id: keyString});

};
const loadAggregateByKey = async (key) => {
    return loadAggregateByKeyString(keyToString(key));

};

module.exports = {
    loadAggregateByKeyString,
    loadAggregateByKey
};