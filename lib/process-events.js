const ftDev = require('ftws-node-dev-tools');
const {handleEvent} = require("./handle-event");
const {getCollectionEvent} = require("./database");
const {is} = require("ramda");


const LN = '.processEvents()::';

const processEvents = async (maxProcessEvents = false) => {



    const maxProcessEventsCount = maxProcessEvents;
    // TODO: add fetch State !!!
    // TODO: Add filter: handled: false + fetched: true + fetchedAt X hours ago
    // TODO: Add try-catch

    while(true) {
        const eventResult = await getCollectionEvent().findOneAndUpdate(
            {
                handled: false,
                // fetched: false
            },
            {
                $set: {
                    // fetched: true,
                    // fetchedAt: new Date()
                    handled: true,
                    handledAt: new Date()
                }
            }
        );
        // ftDev.logJsonString(eventResult, `eventResult:`);
        if (eventResult.ok === 1 && eventResult.value !== null) {
            await handleEvent(eventResult.value);
        } else {
            ftDev.log(`${LN}eventResult.value = null  --- NO UNHANDLED EVENTS FOUND --- `);
            return false;
        }
        if (maxProcessEvents !== false && is(Number, maxProcessEvents)) {
            // ftDev.log(`${LN}maxProcessEvents = ${maxProcessEvents} `);
            maxProcessEvents = maxProcessEvents - 1;
            if (maxProcessEvents <= 0) {
                ftDev.log(`${LN}maxProcessEvents = 0  --- maxProcessEvents (${maxProcessEventsCount}) reached --- `);
                return true;
            }
        }
    }

    return true;

    /*
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

        return true;*/
};


module.exports = {
    processEvents
};