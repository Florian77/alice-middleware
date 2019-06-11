const keyHelper = require('../../lib/key-helper');
const ftd = require('ftws-node-dev-tools');
const R = require('ramda');


// https://www.npmjs.com/package/chai-things
const chai = require('chai')
    , expect = chai.expect;
// https://www.chaijs.com/api/bdd/
// , should = chai.should();


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


describe('lib/key-helper.js', function () {

    it('keyHelper.transform(objectKey)', async function () {
        const result = keyHelper.transform(objectKey);
        expect(result[1]).to.deep.equal(dbKey);
    });

    it('keyHelper.transform(dbKey)', async function () {
        const result = keyHelper.transform(dbKey);
        expect(result[0]).to.deep.equal(objectKey);
    });

    it('keyHelper.getObjectId(object)', async function () {
        const result = keyHelper.getObjectId(object);
        expect(result).to.deep.equal({
            "key1": "value1!=&",
            "key2": "value2"
        });
    });

    it('keyHelper.getObjectType(object)', async function () {
        const result = keyHelper.getObjectType(object);
        expect(result).to.deep.equal({
            "context": "context",
            "aggregate": "aggregate"
        });
    });
});
