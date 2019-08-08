const {loadAggregate, test__makeInvokeKeyOnCreate, test__makeAggregateIds, test__createAggregates} = require('../../../../type-test-helpers');
const exeFn = require('../../../type/group1/bar/exe-fn');
const ftDev = require('ftws-node-dev-tools');
// https://www.chaijs.com/api/bdd/
const expect = require('chai').expect;
// https://www.npmjs.com/package/chai-things

require('../../../mongo-localhost-test-env');
const alice = require('../../../../index');
alice.setTypeConfig(require('../../../type/type-config'));

describe('TYPE:group1/bar', function () {

    // --------------------------------------------------------------------------
    //      Test Data
    // --------------------------------------------------------------------------
    const foo_1_object = loadAggregate(require('./data/aggregate/foo-1'));
    const foo_1_key = loadAggregate(require('./data/aggregate/foo-1-object-key'));
    const invokeKey_foo_1 = 'group1/bar/id=1';

    // --------------------------------------------------------------------------
    //
    //      TEST: makeInvokeKeyOnCreate
    //
    // --------------------------------------------------------------------------
    describe('makeInvokeKeyOnCreate', function () {


        it('foo_1_key', function () {
            const result = test__makeInvokeKeyOnCreate(
                exeFn,
                foo_1_key
            );
            expect(result).to.equal(invokeKey_foo_1);
        });

    });
    // --------------------------------------------------------------------------
    //
    //      TEST: makeAggregateIds
    //
    // --------------------------------------------------------------------------
    describe('makeAggregateIds', function () {

        it('invokeKey_foo_1', function () {
            const result = test__makeAggregateIds(
                exeFn,
                invokeKey_foo_1
            );
            expect(result).to.have.deep.members(require('./data/result/makeAggregateIds-1'));
        });

    });
    // --------------------------------------------------------------------------
    //
    //      TEST: createAggregates
    //
    // --------------------------------------------------------------------------
    describe('createAggregates', function () {


        it('aggregates:[]', async function () {
            const result = await test__createAggregates(
                exeFn,
                [],
                invokeKey_foo_1
            );
            expect(result).to.be.an('array').that.is.empty;
        });

        it('aggregates:[foo_1_object]', async function () {
            const result = await test__createAggregates(
                exeFn,
                [
                    foo_1_object,
                ],
                invokeKey_foo_1
            );
            expect(result).to.deep.equal(require('./data/result/createAggregates-1'));
        });

    });
});

