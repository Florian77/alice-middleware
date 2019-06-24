const {map, split, is, equals} = require('ramda');
const {parse, stringify} = require('query-string/index');
const {getTypeConfig} = require("./global-type-config");
const {
    keySeparatorContext,
    keySeparatorId,
    keySeparatorIdValue
} = require('./key-separators');
const ftDev = require('ftws-node-dev-tools');

const isString = is(String);
const isArray = is(Array);

const parseAggregateId = id => parse(id);
const _transformDbToObjectKey = key => {
    return {
        type: {
            context: key.context,
            aggregate: key.aggregate
        },
        id: parseAggregateId(key.aggregateId)
    }
};

const stringifyObjectId = id => stringify(id);
const _transformObjectToDbKey = key => {
    return {
        context: key.type.context,
        aggregate: key.type.aggregate,
        aggregateId: stringifyObjectId(key.id)
    };
};

const getObjectKey = data => {
    const [objectKey] = transform(data);
    return objectKey;
};


const getObjectId = data => {
    const [{id}] = transform(data);
    return id;
};

const getObjectType = data => {
    const [{type}] = transform(data);
    return type;
};

const isObjectType = data => data.context && data.aggregate;

const matchObjectType = (data, data2) => {
    const type1 = isObjectType(data) ? data : getObjectType(data);
    const type2 = isObjectType(data2) ? data2 : getObjectType(data2);
    // ftDev.logJsonString(type1);
    // ftDev.logJsonString(type2);
    // ftDev.logJsonString(equals(type1, type2));
    return equals(type1.context, type2.context) && equals(type1.aggregate, type2.aggregate);
};


const findByType = (aggregates, findType) => {
    if (!isArray(aggregates)) {
        aggregates = [aggregates];
    }
    return aggregates.find(d => matchObjectType(d.key, findType) );
};


const objectType = (context, aggregate) => ({
        context,
        aggregate,
    }
);
const makeObjectType = objectType;

const makeObjectKey = (type, id) => ({
        type,
        id: isString(id) ? parseAggregateId(id) : id,
    }
);

const makeObjectKey2 = (context, aggregate, id) => ({
        type: makeObjectType(context, aggregate),
        id: isString(id) ? parseAggregateId(id) : id,
    }
);

const objectKey = (id, data = false, data2 = false) => {
    if(isString(id) === true) {
        id = parseAggregateId(id);
    }

    if(!data && !data2){
        return {
            id
        }
    }
    if (!data2) {
        return {
            type: data,
            id
        }
    }
    return {
        type: makeObjectType(data, data2),
        id
    }
};

const objectKeyFromInvokeKey = invokeKey => objectKey(invokeKey.invokeId, invokeKey.context, invokeKey.aggregate);

const objectSearch = (index, data = false, data2 = false) => {
    if(isString(index) === true) {
        index = parseAggregateId(index);
    }

    if(!data && !data2){
        return {
            index
        }
    }
    if (!data2) {
        return {
            type: data,
            index
        }
    }
    return {
        type: makeObjectType(data, data2),
        index
    }
};

const matchObjectKey = (data, data2) => {
    const key1 = getObjectKey(data);
    const key2 = getObjectKey(data2);
    // ftDev.logJsonString(key1);
    // ftDev.logJsonString(key2);
    // ftDev.logJsonString(equals(type1, type2));
    return equals(key1.type.context, key2.type.context) && equals(key1.type.aggregate, key2.type.aggregate) && equals(key1.id, key2.id);
};


const findByKey = (aggregates, findKey) => {
    if (!isArray(aggregates)) {
        aggregates = [aggregates];
    }
    return aggregates.find(d => matchObjectKey(d.key, findKey) );
};

const addObjectKeyToAggregate = aggregate => {
    if (!aggregate.key) {
        aggregate.key = getObjectKey(aggregate);
    }
    return aggregate;
};

const addObjectKeyToAggregateList = map(addObjectKeyToAggregate);


const stringifyIdPair = (key, value) => `${key}${keySeparatorIdValue}${value}`; // TODO: escape key / value

const stringifyId = (keyValues, idFormat = false) => {
    if (idFormat === false) {
        idFormat = Object.keys(keyValues);
    }
    return ( idFormat.map(k => stringifyIdPair(k, keyValues[k]) ) ) .join(keySeparatorId);
};

const keyToString = ({type, id}) => {
    const typeConfig = getTypeConfig(type);
    return typeConfig.context + keySeparatorContext + typeConfig.aggregate + keySeparatorContext + stringifyId(id, typeConfig.idFormat ? typeConfig.idFormat : false );
};
const keyToAggregateId = ({type, id}, typeConfig = false) => {
    typeConfig = typeConfig || getTypeConfig(type);
    return (typeConfig.idFormat.map(k => k + keySeparatorIdValue + id[k])).join(keySeparatorId);
};

const keyStingToObjectKey = keySting => {
    const [context, aggregate, aggregateId] = split(keySeparatorContext, keySting);
    return makeObjectKey(makeObjectType(context, aggregate), parseAggregateId(aggregateId));
};

const invokeKeyString = (context, aggregate, invokeId) => {
    // if(isString(invokeId) === false) {
    //     invokeId = stringifyObjectId(invokeId);
    // }

    return invokeKeyObjectToString({
        context,
        aggregate,
        invokeId
    });
};

const invokeKey = (context, aggregate, invokeId) => {
    return {
        context,
        aggregate,
        invokeId
    };
};

const invokeKeyStringToObject = invokeKey => {
    const [context, aggregate, invokeId] = split(keySeparatorContext, invokeKey);
    return {
        context,
        aggregate,
        invokeId,
        type: {
            context,
            aggregate
        },
        id: parseAggregateId(invokeId)
    };
};

const invokeKeyObjectToString = ({context, aggregate, invokeId}) => {
    return context + keySeparatorContext + aggregate + keySeparatorContext + invokeId;
};


const transform = (key) => {
    let object = {
            type: {
                context: '',
                aggregate: '',
            },
            id: {}
        },
        db = {
            context: '',
            aggregate: '',
            aggregateId: '',
        }
    ;

    //is object key
    if (key && key.type && key.type.context && key.type.aggregate && key.id) {
        object.type.context = key.type.context;
        object.type.aggregate = key.type.aggregate;
        object.id = key.id;

        db = _transformObjectToDbKey(object);
    }
    // is object key.key
    else if (key && key.key && key.key.type && key.key.type.context && key.key.type.aggregate && key.key.id) {
        object.type.context = key.key.type.context;
        object.type.aggregate = key.key.type.aggregate;
        object.id = key.key.id;

        db = _transformObjectToDbKey(object);
    }
    // is db key
    else if (key && key.context && key.aggregate && key.aggregateId) {
        db.context = key.context;
        db.aggregate = key.aggregate;
        db.aggregateId = key.aggregateId;

        object = _transformDbToObjectKey(db);
    }

    // TODO: verify keys
    // TODO: convert id values to string

    return [object, db];
};


module.exports = {
    objectKey,
    objectKeyFromInvokeKey,
    objectSearch,
    objectType,
    stringifyObjectId,
    stringifyIdPair,
    stringifyId,
    parseAggregateId,
    keyToString,
    keyToAggregateId,
    transform,
    makeObjectType,
    makeObjectKey,
    makeObjectKey2,
    addObjectKeyToAggregate,
    addObjectKeyToAggregateList,
    getObjectKey,
    getObjectId,
    getObjectType,
    isObjectType,
    matchObjectType,
    matchObjectKey,
    findByKey,
    findByType,
    keyStingToObjectKey,
    invokeKeyString,
    invokeKey,
    invokeKeyStringToObject,
    invokeKeyObjectToString,
};