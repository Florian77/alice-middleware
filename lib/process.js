
const ftDev = require('ftws-node-dev-tools');
const {processEvents} = require("./process-events");
const {processCommands} = require("./process-commands");

// const LN = '.process()::';

const process = async (maxProcessCycles = 10) => {
    let processCommandsResult = true, processEventsResult = true, counter = 0;
    while ((processEventsResult === true || processCommandsResult === true) && (counter += 1) <= Number(maxProcessCycles)) {
        ftDev.log( ' -------------------------------------------------> PROCESS CYCLE:' + counter);
        // Process Events
        processEventsResult = await processEvents();

        // Process Commands
        processCommandsResult = await processCommands();
    }
};


module.exports = {
    process
};