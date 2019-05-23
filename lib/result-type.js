const R = require('ramda');

const returnResultTypeData = {
    resultType: 'data',
};
const isResultTypeData = (resultType) => resultType && R.toLower(resultType) === 'data';

const returnResultTypeDelete = {
    resultType: 'delete',
};
const isResultTypeDelete = (resultType) => resultType && R.toLower(resultType) === 'delete';

const returnResultTypeError = {
    resultType: 'error',
};
const isResultTypeError = (resultType) => resultType && R.toLower(resultType) === 'error';

const returnEmptyResult = [];

module.exports = {
    returnResultTypeData,
    isResultTypeData,
    returnResultTypeDelete,
    isResultTypeDelete,
    returnResultTypeError,
    isResultTypeError,

    returnEmptyResult,
};
