require('../mongo-localhost-test-env');

const {clearDatabase} = require('../../type-test-helpers');
const alice = require('../../index');
alice.setTypeExeFnPath(__dirname, '../type/', true);
const {storeAggregates, processEvents, key} = alice;
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

describe('processEvents', function () {

    this.timeout(10 * 1000);

    beforeEach(async () => {
        ftDev.log('----------------------------------------');
        if (doClearDatabase) {
            if (!await clearDatabase(alice)) {
                throw Error('clearDatabase() faild ');
            }
        } else {
            await alice.connect();
            ftDev.log('doClearDatabase: OFF');
        }
    });

    after(async () => {
        await alice.disconnect();
    });

    it('processEvents(1) no unhandled events', async function () {
        // ftDev.log('');
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(1);
        ftDev.logJsonString(result, 'processEvents(1).result:');
        expect(result).to.be.false;
    });

    it('processEvents(1)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(1);
        ftDev.logJsonString(result, 'processEvents(1).result:');
        expect(result).to.be.true;
    });

    it('processEvents(3)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(3);
        ftDev.logJsonString(result, 'processEvents(1).result:');
        expect(result).to.be.true;
    });


});