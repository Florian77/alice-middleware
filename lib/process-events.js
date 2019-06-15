const ftDev = require('ftws-node-dev-tools');
const {handleEvent} = require("./handle-event");
const {getCollectionEvent} = require("./database");


const LN = '.processEvents()::';

const processEvents = async (maxProcessEvents = false) => {

    // TODO: refactor
    let eventResult;
    if (maxProcessEvents && Number(maxProcessEvents) > 0) {
        eventResult = await getCollectionEvent().find({handled: false}).limit(Number(maxProcessEvents)).toArray();
    } else {
        eventResult = await getCollectionEvent().find({handled: false}).toArray();
    }

    if (eventResult.length === 0) {
        ftDev.log(`${LN}eventResult.length = 0  --- NO UNHANDLED EVENTS FOUND --- `);
        return false;
    }

    for (let event of eventResult) {
        // const LN1 = `${LN}event[${event.keyString}]:`;
        // ftDev.logJsonString(event, 'EVENT:');
        // const [eventObjectKey] = alice.key.transform(event);
        // ftDev.logJsonString(eventObjectKey, `${LN1}eventObjectKey:`);


        await handleEvent(event);


        // Save Event is handled
        const updateEventResult = await getCollectionEvent().updateOne(
            {_id: event._id},
            {
                $set: {
                    handled: true,
                    handledAt: new Date()
                }

            }
        );
        // ftDev.mongo.logUpdateOne(updateEventResult, `${LN}getCollectionEvent.updateOne():`, true);
    }

    return true;
};


module.exports = {
    processEvents
};