const ftDev = require('ftws-node-dev-tools');

const baseConverterTest = require('../../lib/base-converter');

// https://www.npmjs.com/package/chai-things
const chai = require('chai')
    , expect = chai.expect;
// https://www.chaijs.com/api/bdd/
// , should = chai.should();

describe('lib/base-converter.js', function () {


    it('dec2hex', async function () {
        let r;

        r = baseConverterTest.dec2hex(15);
        expect(r).to.equal('f');

        r = baseConverterTest.dec2hex(255);
        expect(r).to.equal('ff');

    });


    it('hex2dec', async function () {
        let r;

        r = baseConverterTest.hex2dec('f');
        expect(r).to.equal('15');

        r = baseConverterTest.hex2dec('ff');
        expect(r).to.equal('255');

        r = baseConverterTest.hex2dec('00');
        expect(r).to.equal('0');

        r = baseConverterTest.hex2dec('01');
        expect(r).to.equal('1');

        r = baseConverterTest.hex2dec('a');
        expect(r).to.equal('10');

        r = baseConverterTest.hex2dec('10');
        expect(r).to.equal('16');

    });

});

