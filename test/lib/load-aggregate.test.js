require('../mongo-localhost-test-env');

const {clearDatabase} = require('../../type-test-helpers');
const alice = require('../../index');
alice.setTypeExeFnPath(__dirname, '../type/', true);
const {storeAggregates, queryAggregateList, key} = alice;
const {objectKey, objectType, objectSearch} = key;
const ftDev = require('ftws-node-dev-tools');
const R = require('ramda');


// https://www.npmjs.com/package/chai-things
const chai = require('chai')
    , expect = chai.expect;
// https://www.chaijs.com/api/bdd/
// , should = chai.should();

const this_CONTEXT = 'test', this_AGGREGATE = 'test';
const this_OBJECT_TYPE = objectType(this_CONTEXT, this_AGGREGATE);

const id_1 = {
    id: 1,
    key: 1
};
const aggregateKey_1 = objectKey(id_1, this_OBJECT_TYPE);
const searchKey_1 = objectSearch(id_1, this_OBJECT_TYPE);

const aggregate_1 = {
    key: aggregateKey_1,
    payload: {
        data: 'aggregate_1'
    }
};

let doClearDatabase = true;
// doClearDatabase = false;

describe('queryAggregateList', function () {

    this.timeout(10 * 1000);

    before(async () => {
        if (doClearDatabase) {
            if (await clearDatabase(alice)) {
                // done();
                // return true;
            }
            else {
                throw Error('clearDatabase() faild ');
            }
        }
        else {
            await alice.connect();
            ftDev.log('doClearDatabase: OFF');

        }
        ftDev.log('');

        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(result, 'storeAggregates().result:')
    });


    it('queryAggregateList(key)', async function () {
        ftDev.log('');
        ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await queryAggregateList([
            aggregateKey_1
        ]);
        ftDev.logJsonString(result, 'queryAggregateList([aggregateKey_1]).result:')
    });

    it('queryAggregateList(search)', async function () {
        ftDev.log('');
        ftDev.logJsonString(searchKey_1, 'searchKey_1');
        const result = await queryAggregateList([
            searchKey_1
        ]);
        ftDev.logJsonString(result, 'queryAggregateList([searchKey_1]).result:')
    });

});