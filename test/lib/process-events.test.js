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

const id_1 = {id: 1, key: 1};
const id_2 = {id: 2, key: 2};
const id_3 = {id: 3, key: 4};

const aggregateKey_1 = objectKey(id_1, this_OBJECT_TYPE);
const aggregateKey_2 = objectKey(id_2, this_OBJECT_TYPE);
const aggregateKey_3 = objectKey(id_3, this_OBJECT_TYPE);
const searchKey_1 = objectSearch(id_1, this_OBJECT_TYPE);

const aggregate_1 = {key: aggregateKey_1, payload: {data: 'aggregate_1'}};
const aggregate_2 = {key: aggregateKey_2, payload: {data: 'aggregate_2'}};
const aggregate_3 = {key: aggregateKey_3, payload: {data: 'aggregate_3'}};

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
        expect(result).to.be.deep.equals({
            "moreToProcess": false,
            "processedCounter": 0,
            "withError": false
        });
    });

    it('processEvents(1)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(1);
        ftDev.logJsonString(result, 'processEvents(1).result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 1,
            "withError": false
        });
    });

    it('processEvents(3)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(3);
        ftDev.logJsonString(result, 'processEvents(3).result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 1,
            "withError": false
        });
    });

    it('processEvents(2)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        await storeAggregates('test/test/id-2', [aggregate_2]);
        await storeAggregates('test/test/id-3', [aggregate_3]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processEvents(2);
        ftDev.logJsonString(result, 'processEvents(2).result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 2,
            "withError": false
        });
    });

    // TODO: Add Error handling inside "handleEvent()"

});