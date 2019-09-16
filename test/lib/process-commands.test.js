require('../mongo-localhost-test-env');

const {clearDatabase} = require('../../type-test-helpers');
const alice = require('../../index');
alice.setTypeExeFnPath(__dirname, '../type/', true);
const {storeAggregates, processEvents, processCommands, key} = alice;
const {objectKey, objectType, objectSearch} = key;
const ftDev = require('ftws-node-dev-tools');
const R = require('ramda');


// https://www.npmjs.com/package/chai-things
const chai = require('chai')
    , expect = chai.expect;
// https://www.chaijs.com/api/bdd/
// , should = chai.should();

const this_CONTEXT = 'group1', this_AGGREGATE = 'foo';
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

describe('processCommands', function () {

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

    it('processCommands(1) no unhandled commands', async function () {
        // ftDev.log('');
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        const result = await processCommands(1);
        ftDev.logJsonString(result, 'processCommands(1).result:');
        expect(result).to.be.deep.equals({
            "moreToProcess": false,
            "processedCounter": 0,
            "withError": false
        });
    });

    it('aggregate_1->processCommands(1)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        await processEvents(1);
        const result = await processCommands(1);
        ftDev.logJsonString(result, '.result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 1,
            "withError": false
        });
    });

    it('aggregate[1-3]->processCommands(2)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        await storeAggregates('test/test/id-2', [aggregate_2]);
        await storeAggregates('test/test/id-3', [aggregate_3]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        await processEvents(3);
        const result = await processCommands(2);
        ftDev.logJsonString(result, '.result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 2,
            "withError": false
        });
    });

    it('aggregate_1->processCommands(3)', async function () {
        // ftDev.log('');
        await storeAggregates('test/test/id-1', [aggregate_1]);
        // ftDev.logJsonString(aggregateKey_1, 'aggregateKey_1');
        await processEvents(3);
        const result = await processCommands(3);
        ftDev.logJsonString(result, '.result:');
        // expect(result).to.be.true;
        expect(result).to.be.deep.equals({
            "moreToProcess": true,
            "processedCounter": 1,
            "withError": false
        });
    });


});