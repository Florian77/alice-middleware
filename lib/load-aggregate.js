const {is, map, has, concat, fromPairs, toPairs, pipe, unnest} = require('ramda');
const {addObjectKeyToAggregate} = require("./key-helper");
const {keyToString} = require("./key-helper");
const {getCollectionAggregate} = require("./database");
const ftDev = require('ftws-node-dev-tools');
const {keyStingToObjectKey} = require("./key-helper");


const isFindAggregateQuery = has('index');

const queryAggregateList = async aggregateQueryList => {
    if(!is(Array, aggregateQueryList)) {
        aggregateQueryList = [aggregateQueryList];
    }

    let aggregates = await Promise.all(map(queryAggregate, aggregateQueryList));
    // remove surrounding array that findAggregate returns
    aggregates = unnest(aggregates);
    // ftDev.logJsonString(aggregates, 'queryAggregateList().aggregates:')

    // TODO: Add error handling

    return aggregates;

};

const queryAggregate = aggregateQuery => {
    if(isFindAggregateQuery(aggregateQuery)) {
        return findAggregate(aggregateQuery.index, aggregateQuery.type);
    }
    else {
        return loadAggregateByKey(aggregateQuery);
    }
};

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

const addIndexPath = pipe(
    toPairs,
    map( v => ([concat('index.', v[0]), v[1] ]) ),
    fromPairs
);

const findAggregate = async (search, context, aggregate = false) => {
    if(aggregate === false && has('aggregate', context) && has('context', context)) {
        aggregate = context.aggregate;
        context = context.context;
    }

    // map over search params and add "index." in front of the key
    search = addIndexPath(search);
    const findQuery = {
        context,
        aggregate,
        ...search
    };
    // ftDev.logJsonString(findQuery, 'findAggregate().findQuery:');
    let aggregates = await getCollectionAggregate().find(findQuery).toArray();
    aggregates = aggregates.map( data => {
        data.exists = true;
        data = addObjectKeyToAggregate(data);
        return data;
    });

    // ftDev.logJsonString(aggregates, 'findAggregate().aggregates:');
    return aggregates;
};

module.exports = {
    queryAggregateList,
    queryAggregate,
    loadAggregateByKeyString,
    loadAggregateByKey,
    findAggregate,
};