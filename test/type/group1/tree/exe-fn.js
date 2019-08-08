const alice = require('../../../../index');
const {invokeKeyString, stringifyId, objectType, getObjectKey, getObjectId, objectKey, objectKey2, matchObjectType2, findByType2, findByType} = alice.key;
const ftDev = require('ftws-node-dev-tools');

const this_CONTEXT = 'group1', this_AGGREGATE = 'tree';
const this_OBJECT_TYPE = objectType(this_CONTEXT, this_AGGREGATE);
const this_matchObjectType = matchObjectType2(this_OBJECT_TYPE);
const this_objectKey = objectKey2(this_OBJECT_TYPE);

const parent_CONTEXT = 'group1', parent_AGGREGATE = 'bar';
const parent_OBJECT_TYPE = objectType(parent_CONTEXT, parent_AGGREGATE);
const parent_matchObjectType = matchObjectType2(parent_OBJECT_TYPE);
const parent_objectKey = objectKey2(parent_OBJECT_TYPE);
const parent_findByType = findByType2(parent_OBJECT_TYPE);

const makeInvokeKeyOnCreate = aggregateKey => {
    // ftDev.logJsonString(aggregateKey, 'aggregateKey');
    if (!parent_matchObjectType(aggregateKey)) {
        return false;
    }

    if (!aggregateKey.id) {
        return false;
    }

    const invokeId = stringifyId(aggregateKey.id, ['id']);
    return invokeKeyString(this_CONTEXT, this_AGGREGATE, invokeId);
};


const makeAggregateIds = invokeKey => {
    // ftDev.logJsonString(invokeKey, 'invokeKey');
    if (!this_matchObjectType(invokeKey)) {
        return false;
    }

    return [
        parent_objectKey(invokeKey.invokeId),
    ];
};


const createAggregates = async (aggregates, invokeKey) => {
    // ftDev.logJsonString(invokeKey, `invokeKey:`);
    // ftDev.logJsonString(aggregates, `aggregates:`);
    if (!aggregates) {
        throw Error('Aggregates missing');
    }

    // get parent Aggregate
    const parentAgt = parent_findByType(aggregates);
    // ftDev.logJsonString(parentAgt, `parentAgt:`);
    if (!parentAgt || parentAgt.exists !== true) {
        return [];
    }

    // return aggregate Data in array
    return [
        {
            key: objectKey(parentAgt.key.id),
            payload: {
                data: 'bla...'
            },
            meta: {
                ok: true,
                msg: []
            },
            relations: [
                getObjectKey(parentAgt)
            ]
        }
    ];

};


module.exports = {
    type: this_OBJECT_TYPE,
    makeInvokeKeyOnCreate,
    makeAggregateIds,
    createAggregates,
};
