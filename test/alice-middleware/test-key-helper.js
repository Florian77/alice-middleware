const keyHelper = require('../../alice-middleware/lib/key-helper');
const ftd = require('ftws-node-dev-tools');
const R = require('ramda');

const objectKey = {
    type: {
        context: 'context',
        aggregate: 'aggregate'
    },
    id: {
        key1: 'value1!=&',
        key2: 'value2'
    }
};
const dbKey = {
    context: 'context',
    aggregate: 'aggregate',
    aggregateId: 'key1=value1%21%3D%26&key2=value2',
};

const r1 = keyHelper.transform(objectKey);
const r2 = keyHelper.transform(dbKey);

ftd.logJsonString(R.equals(r1,r2), 'R.equals(r1,r2):');

ftd.logJsonString(r1, 'keyHelper.transform(objectKey):r1:');
ftd.logJsonString(r2, 'keyHelper.transform(dbKey):r2:');

const payload = {
    data: 'Hallo!'
};
const object = {
    resultType: 'data',
    key: objectKey,
    payload,
};
const db = {
    _id: '123456789',
    ...dbKey,
    payload,
};

ftd.logJsonString(keyHelper.getObjectId(object), 'keyHelper.getObjectId(object):');
ftd.logJsonString(keyHelper.getObjectType(object), 'keyHelper.getObjectType(object):');
