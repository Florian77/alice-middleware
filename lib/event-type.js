const R = require('ramda');

const isEventTypeCreate = ({eventType}) => eventType && R.toLower(eventType) === 'create';
const returnEventTypeCreate = {
    eventType: 'create'
};
const isEventTypeUpdate = ({eventType}) => eventType && R.toLower(eventType) === 'update';
const returnEventTypeUpdate = {
    eventType: 'update'
};
const isEventTypeDelete = ({eventType}) => eventType && R.toLower(eventType) === 'delete';
const returnEventTypeDelete = {
    eventType: 'delete'
};

// ----------------------------------------------------------
//  Module Export
// ----------------------------------------------------------
module.exports = {
    returnEventTypeCreate,
    isEventTypeCreate,
    returnEventTypeUpdate,
    isEventTypeUpdate,
    returnEventTypeDelete,
    isEventTypeDelete,
};