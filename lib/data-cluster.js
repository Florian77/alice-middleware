const md5 = require('md5');
const {slice, pipe, toString, map, range, fromPairs, toPairs} = require('ramda');
const baseConverter = require('./base-converter');


function DataCluster(depth) {

    const generateClusterId = pipe(
        toString,
        md5,
        slice(0, depth),
        baseConverter.hex2dec
    );

    // init dataStore cluster shelf's
    const dataStore = fromPairs(
        map(
            n => ([n, []])
        )(range(0, Math.pow(16, depth)))
    );

    const addData = (id, data) => {
        dataStore[generateClusterId(id)].push(data);
    };

    const getCluster = () => dataStore;

    const getClusterPairs = () => toPairs(dataStore);

    return {
        addData,
        getCluster,
        getClusterPairs
    }
}

module.exports = DataCluster;

