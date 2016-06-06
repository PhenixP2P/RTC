/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
var runner = require('./runner');

runner.runCommands([
    'node --version',
    'npm --version',
    'npm install',
    'npm run test-continous'
]);
