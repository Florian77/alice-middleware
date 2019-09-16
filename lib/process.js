const ftDev = require('ftws-node-dev-tools');
const {processEvents} = require("./process-events");
const {processCommands} = require("./process-commands");
const {is} = require("ramda");

// const LN = '.process()::';

const now = () => Date.now() / 1000 | 0;
const nowDif = start => now() - start;

const process = async ({
                           maxProcessCycles = false,
                           maxProcessEvents = false,
                           maxProcessCommands = false,
                           maxRunTime = false,
                       } = {}) => {

    maxProcessCycles = is(Number, maxProcessCycles) && maxProcessCycles > 0 ? maxProcessCycles : 10;
    maxRunTime = is(Number, maxRunTime) && maxRunTime > 0 ? maxRunTime : false;

    // ftDev.logJsonString(maxRunTime, 'maxRunTime');
    const startTime = now();
    let processCommandsResult = false, processEventsResult = false, counter = 0, resultCount = {events: 0, commands: 0};
    do {
        ftDev.log(' -------------------------------------------------> PROCESS CYCLE:' + counter);
        // Process Events
        if (maxRunTime === false || maxRunTime > nowDif(startTime)) {
            const {moreToProcess, processedCounter} = await processEvents(maxProcessEvents);
            processEventsResult = moreToProcess;
            resultCount.events += processedCounter;
        }
        // ftDev.logJsonString(nowDif(startTime), 'running');

        // Process Commands
        if (maxRunTime === false || maxRunTime > nowDif(startTime)) {
            const {moreToProcess, processedCounter} = await processCommands(maxProcessCommands);
            processCommandsResult = moreToProcess;
            resultCount.commands += processedCounter;
        }
        // ftDev.logJsonString(nowDif(startTime), 'running');

        if (maxRunTime !== false && maxRunTime <= nowDif(startTime)) {
            ftDev.logJsonString(maxRunTime, "Timeout::maxRunTime:");
        }

    } while (
        (processEventsResult === true || processCommandsResult === true)
        && (counter += 1) < Number(maxProcessCycles)
        && (maxRunTime === false || maxRunTime > nowDif(startTime))
        );

    return resultCount;
};


module.exports = {
    process
};