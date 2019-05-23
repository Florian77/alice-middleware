const ftDev = require('ftws-node-dev-tools');
const {handleCommand} = require("./handle-command");
const {getCollectionCommand} = require("./database");

const LN = '.processCommands()::';

const processCommands = async () => {


    const commandResult = await getCollectionCommand().find({handled: false}).toArray();

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

    return true;
};



module.exports = {
    processCommands
};