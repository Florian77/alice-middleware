const ftDev = require('ftws-node-dev-tools');
const gTypeConfig = require('./global-type-config');
const {isEventTypeCreate} = require("./event-type");
const keyHelper = require('./key-helper');
const {getCollectionAggregate} = require("./database");
const {getCollectionCommand} = require("./database");
const {returnEventTypeCreate} = require("./event-type");

const handleEvent = async (event) => {
    const LN1 = `.handleEvent(${event.keyString})::`;
    // ftDev.logJsonString(event, `${LN1}EVENT:`);

    const [eventObjectKey] = keyHelper.transform(event);

    const subscriptions = gTypeConfig.getSubscriptions(event);
    // ftDev.logJsonString(subscriptions, `${LN1}subscriptions:`);

    if (subscriptions && subscriptions.length > 0) {

        for (let subscription of subscriptions) {
            // ftDev.logJsonString(gTypeConfig.makeTypeConfigString(subscription), `${LN1}subscription:`);
            const typeConfig = gTypeConfig.getTypeConfig(subscription);
            // ftDev.logJsonString(typeConfig, `${LN1}typeConfig:`);

            // ------------------------------
            //  Event Type: create
            // ------------------------------
            if (isEventTypeCreate(event)) {
                const actionId = {
                    _id: `${typeConfig.context}/${typeConfig.aggregate}/create/${event.keyString}`,
                };
                const command = {
                    context: typeConfig.context,
                    aggregate: typeConfig.aggregate,
                    commandType: 'create',
                    handled: false,
                    lastUpdateAt: new Date(),
                    handledAt: null,
                    payload: {
                        aggregateKey: eventObjectKey
                    },
                    // upsertCounter: 0,
                };
                // ftDev.logJsonString(command, `${LN1}::CREATE:command:`);

                const result = await getCollectionCommand().updateOne(
                    actionId,
                    {
                        $setOnInsert: {
                            createdAt: new Date(),
                        },
                        $inc: {upsertCounter: 1},
                        $set: command
                    },
                    {upsert: true}
                );
                // ftDev.logJsonString(result, `.result:`);
                ftDev.log(`${LN1}::.insertOne():  --- COMMAND CREATED: ${ftDev.mongo.resultName(result)} [${actionId._id}] --- `);
            }

            // ------------------------------
            //  Event Type: update + delete
            // ------------------------------
            // else { // if (alice.isEventTypeUpdate(event))
                // TODO: Load all related Aggregates
                // {context: "pim", aggregate: "akeneo-text", relations: "import-akeneo/products/sku=401904" }

                // Load Aggregates related to this event
                const query = {
                    context: typeConfig.context,
                    aggregate: typeConfig.aggregate,
                    relations: event.keyString
                };
                // MongoDB Index: Alice_ContextAggregateRelations

                // ftDev.logJsonString(query, `.query:`);
                const result = await getCollectionAggregate().find(query).toArray();
                // ftDev.logJsonString(result, `.result:`);

                await Promise.all(
                    result.map(async resultAggregate => {

                        const actionId = {
                            _id: resultAggregate.invokeKey,
                        };
                        const command = {
                            context: typeConfig.context,
                            aggregate: typeConfig.aggregate,
                            commandType: 'invoke',
                            handled: false,
                            lastUpdateAt: new Date(),
                            handledAt: null,
                            payload: {
                                invokeKey: resultAggregate.invokeKey
                            },
                            // upsertCounter: 0,
                        };
                        // ftDev.logJsonString(command, `${LN1}::RE-INVOKE:command:`);

                        const updateResult = await getCollectionCommand().updateOne(
                            actionId,
                            {
                                $setOnInsert: {
                                    createdAt: new Date(),
                                },
                                $inc: {upsertCounter: 1},
                                $set: command
                            },
                            {upsert: true}
                        );
                        // ftDev.logJsonString(updateResult, `.result:`);
                        ftDev.log(`${LN1}::.insertOne():  --- COMMAND RE-INVOKE: ${ftDev.mongo.resultName(updateResult)} [${actionId._id}] --- `);

                    })
                );
            // }


        }
    }
    else {
        ftDev.log(`${LN1}  --- HAS NO SUBSCRIPTIONS --- `);
    }

};



module.exports = {
    handleEvent
};