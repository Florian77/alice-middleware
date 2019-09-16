require('../mongo-localhost-test-env');
const ftDev = require('ftws-node-dev-tools');
const {clearDatabase} = require('../../type-test-helpers');
// ftDev.logJsonString(__dirname);
// ftDev.logJsonString(require('path').resolve(__dirname, '.env'));
// ftDev.logJsonString(process.cwd());
// ftDev.logJsonString(process.env);
const alice = require('../../index');
const {invokeKeyString, stringifyId, objectType, getObjectKey, getObjectId, objectKey2, objectKey, matchObjectType, findByType, findByKey} = alice.key;
// alice.setTypeConfig(require('../type/type-config'));
alice.setTypeExeFnPath(__dirname, '../type/', true);
const R = require('ramda');

const foo_CONTEXT = 'group1', foo_AGGREGATE = 'foo';
const foo_OBJECT_TYPE = objectType(foo_CONTEXT, foo_AGGREGATE);
const foo_objectKey = objectKey2(foo_OBJECT_TYPE);

const bar_CONTEXT = 'group1', bar_AGGREGATE = 'bar';
const bar_OBJECT_TYPE = objectType(bar_CONTEXT, bar_AGGREGATE);
const bar_objectKey = objectKey2(bar_OBJECT_TYPE);

const metaOkTrue = {
    ok: true,
    msg: []
};

let doClearDatabase = true;
// doClearDatabase = false;

describe('test-case-1', function () {

    this.timeout(10 * 1000);

    before(async () => {
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


    it('run', async function () {

        // ------------------------------
        //  IMPORT: foo 1...5
        // ------------------------------
        {
            const aggregates = R.map(
                id => {
                    return {
                        key: foo_objectKey({id}),
                        payload: {
                            id
                        },
                        meta: metaOkTrue,
                    };
                },
                R.range(1, 3)
            );
            ftDev.logJsonString(aggregates, 'aggregates:');
            await alice.storeAggregates(`${foo_CONTEXT}/${foo_AGGREGATE}/import`, aggregates);
        }

        // ------------------------------
        //  Process
        // ------------------------------
        await alice.process();

        // await alice.storeAggregates(`${import_CONTEXT}/products/import`, aggregateOnboard_X000_00);

        // Delete Attribute Options
        // const aggregateAttributeOptions0 = [aggregateAttributeOptions[0]];
        // ftDev.logJsonString(aggregateAttributeOptions0, 'aggregateAttributeOptions0:');
        // await alice.storeAggregates(`${import_CONTEXT}/attribute-options/import`, []);

        // await alice.storeAggregates(`${import_CONTEXT}/attribute-options/import`, aggregateAttributeOptions);

        // ------------------------------
        //  Process again
        // ------------------------------
        // await alice.process();

    });


});