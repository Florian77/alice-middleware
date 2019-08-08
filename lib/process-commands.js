const ftDev = require('ftws-node-dev-tools');
const {handleCommand} = require("./handle-command");
const {getCollectionCommand} = require("./database");
const {is} = require("ramda");

const LN = '.processCommands()::';

const processCommands = async (maxProcessCommands = false) => {

    maxProcessCommands = is(Number, maxProcessCommands) && maxProcessCommands > 0 ? maxProcessCommands : 10000;
    const maxProcessCommandsCount = maxProcessCommands;
    // TODO: add fetch State !!!
    // TODO: Add filter: handled: false + fetched: true + fetchedAt X hours ago
    // TODO: Add try-catch

    // get changed after first cycle
    let returnState = false;
    do {
        const commandResult = await getCollectionCommand().findOneAndUpdate(
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
        // ftDev.logJsonString(commandResult, `commandResult:`);
        if (commandResult.ok === 1 && commandResult.value !== null) {
            await handleCommand(commandResult.value);
        } else {
            ftDev.log(`${LN}commandResult.value = null  --- NO UNHANDLED COMMAND FOUND --- `);
            return returnState;
        }

        if (!returnState) {
            returnState = true;
        }
    } while ((maxProcessCommands -= 1) >= 0);

    if (maxProcessCommands <= 0) {
        ftDev.log(`${LN}maxProcessCommands = 0  --- maxProcessCommands (${maxProcessCommandsCount}) reached --- `);
    }

    return true;


    // TODO: refactor
    /*
    let commandResult;
    if (maxProcessCommands && Number(maxProcessCommands) > 0) {
        commandResult = await getCollectionCommand().find({handled: false}).limit(Number(maxProcessCommands)).toArray();
    } else {
        commandResult = await getCollectionCommand().find({handled: false}).toArray();
    }

    if (commandResult.length === 0) {
        ftDev.log(`${LN}commandResult.length = 0  --- NO UNHANDLED COMMAND FOUND --- `);
        return false;
    }

    for (let command of commandResult) {
        const LN1 = `${LN}command[${command._id}]:`;

        // const objectType = getObjectTypeFromCommand(command);
        // ftDev.logJsonString(objectType, `${LN1}objectType:`);

        // const aggregateKey = command.payload.aggregateKey;
        // ftDev.logJsonString(aggregateKey, `${LN1}aggregateKey:`);

        await handleCommand(command); //aggregateKey, objectType);

        // ------------------------------
        //  Store command is handled
        // ------------------------------
        const updateCommandResult = await getCollectionCommand().updateOne(
            {_id: command._id},
            {
                $set: {
                    handled: true,
                    handledAt: new Date()
                }

            }
        );
        // ftDev.mongo.logUpdateOne(updateCommandResult, `${LN1}getCollectionCommand.updateOne():`, true);

    }

    return true;*/
};


module.exports = {
    processCommands
};