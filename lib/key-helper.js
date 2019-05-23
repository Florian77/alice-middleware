const queryString = require('query-string/index');
const {getTypeConfig} = require("./global-type-config");
const {
    keySeparatorContext,
    keySeparatorId,
    keySeparatorIdValue
} = require('./key-separators');


const getObjectKey = aggregate => {
    const [objectKey] = transform(aggregate);
    return objectKey;
};

const getObjectId = key => {
    const [{id}] = transform(key);
    return id;
};

const getObjectType = key => {
    const [{type}] = transform(key);
    return type;
};

const makeObjectType = (context, aggregate) => ({
        context,
        aggregate,
    }
);

const makeObjectKey = (type, id) => ({
        type,
        id,
    }
);

const keyToString = ({type, id}) => {
    const typeConfig = getTypeConfig(type);
    return typeConfig.context + keySeparatorContext + typeConfig.aggregate + keySeparatorContext + (typeConfig.idFormat.map(k => k + keySeparatorIdValue + id[k])).join(keySeparatorId);
};
const keyToAggregateId = ({type, id}, typeConfig = false) => {
    typeConfig = typeConfig || getTypeConfig(type);
    return (typeConfig.idFormat.map(k => k + keySeparatorIdValue + id[k])).join(keySeparatorId);
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

const _parseDbId = id => queryString.parse(id);
const _transformDbToObjectKey = key => {
    return {
        type: {
            context: key.context,
            aggregate: key.aggregate
        },
        id: _parseDbId(key.aggregateId)
    }
};

const _stringifyObjectId = id => queryString.stringify(id);
const _transformObjectToDbKey = key => {
    return {
        context: key.type.context,
        aggregate: key.type.aggregate,
        aggregateId: _stringifyObjectId(key.id)
    };
};

module.exports = {
    keyToString,
    keyToAggregateId,
    transform,
    makeObjectType,
    makeObjectKey,
    getObjectKey,
    getObjectId,
    getObjectType,
};