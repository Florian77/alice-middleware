const ftDev = require('ftws-node-dev-tools');

const DataClusterTest = require('../../lib/data-cluster');

const {slice, pipe, toString, map, range, fromPairs} = require('ramda');


// https://www.npmjs.com/package/chai-things
const chai = require('chai')
    , expect = chai.expect;
// https://www.chaijs.com/api/bdd/
// , should = chai.should();


/*        const dataStore = fromPairs(
            map(
                pipe(
                    // decimalToHexString,
                    // s => String(s).padStart(depth, '0'),
                    n => ([n, {}])
                )
            )(range(0, Math.pow(16, depth)))
        );*/
// ftDev.logJsonString(dataStore);
// ftDev.logJsonString(range(0, Math.pow(16, depth)));
// ftDev.logJsonString(
//     map(
//         pipe(
//             decimalToHexString,
//             s => String(s).padStart(depth, '0')
//         )
//     )(range(0, Math.pow(16, depth)))
//
// );


describe('lib/data-cluster.js', function () {


    it('Empty Cluster(1)', async function () {
        const cluster = new DataClusterTest(1);
        const result = cluster.getCluster();
        ftDev.logJsonString(result);
        expect(result).to.deep.equal({
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": [],
            "7": [],
            "8": [],
            "9": [],
            "10": [],
            "11": [],
            "12": [],
            "13": [],
            "14": [],
            "15": []
        });
    });

    it('Cluster(1) with 10 items', async function () {
        const cluster = new DataClusterTest(1);
        range(0,10).forEach( n => {
            cluster.addData(n, n);
        });

        const result = cluster.getCluster();
        ftDev.logJsonString(result);

        expect(result).to.deep.equal(
            {
                "0": [],
                "1": [
                    6
                ],
                "2": [],
                "3": [],
                "4": [
                    9
                ],
                "5": [],
                "6": [],
                "7": [],
                "8": [
                    7
                ],
                "9": [],
                "10": [
                    4
                ],
                "11": [],
                "12": [
                    0,
                    1,
                    2,
                    8
                ],
                "13": [],
                "14": [
                    3,
                    5
                ],
                "15": []
            }
        );

    });

});

