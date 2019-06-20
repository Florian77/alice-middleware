const pack = require('../package');

process.env.ALICE_MIDDLEWARE_SERVICE = `${pack.name}-${pack.version}`;

// TODO: Add Debug output options

process.env.ALICE_MIDDLEWARE_DB_DRIVER = "mongodb";
process.env.ALICE_MIDDLEWARE_MONGODB_URL = "mongodb://localhost";
process.env.ALICE_MIDDLEWARE_MONGODB_DB = `${pack.name}-${pack.version}`;

// Optional:
process.env.ALICE_MIDDLEWARE_MONGODB_COLL_AGGREGATE = "aggregate";
process.env.ALICE_MIDDLEWARE_MONGODB_COLL_EVENT = "event";
process.env.ALICE_MIDDLEWARE_MONGODB_COLL_COMMAND = "command";
