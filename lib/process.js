const ftDev = require('ftws-node-dev-tools');
const {processEvents} = require("./process-events");
const {processCommands} = require("./process-commands");
const {is} = require("ramda");

// const LN = '.process()::';

const process = async (maxProcessCycles = false, maxProcessEvents = false, maxProcessCommands = false) => {
    maxProcessCycles = is(Number, maxProcessCycles) && maxProcessCycles > 0 ? maxProcessCycles : 10;

    let processCommandsResult, processEventsResult, counter = 0;
    do {
        ftDev.log(' -------------------------------------------------> PROCESS CYCLE:' + counter);
        // Process Events
        processEventsResult = await processEvents(maxProcessEvents);

        // Process Commands
        processCommandsResult = await processCommands(maxProcessCommands);
    } while ((processEventsResult === true || processCommandsResult === true) && (counter += 1) <= Number(maxProcessCycles));
};


module.exports = {
    process
};