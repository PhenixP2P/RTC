/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var node = process.execPath;
var nodeDir = path.dirname(process.execPath);
var npm = path.join(nodeDir, 'npm.cmd');

if (!fs.existsSync(npm)) {
    var alternateNpm = path.join(nodeDir, 'npm');

    if (fs.existsSync(alternateNpm)) {
        npm = alternateNpm;
    }
}

console.log('Using node: ' + node);
console.log('Using npm: ' + npm);

function run(command, next) {
    var p = spawn(command[0], command.slice(1), {stdio: 'inherit'});

    p.on('error', function (err) {
        console.error('Error received: ', err);
        process.exit(77);
    });

    p.on('close', function (code) {
        if (code !== 0) {
            console.error(command[0] + ' failed with code ' + code);
            process.exit(code);
        }
        next();
    });
}

exports.runCommands = function runCommands(commands, done) {
    var command = commands[0];

    if (typeof command === 'string') {
        command = command.split(' ');
    }

    if (command.length > 0) {
        if (command[0] == 'npm') {
            command[0] = npm;
        } else if (command[0] == 'node') {
            command[0] = node;
        }
    }

    run(command, function () {
        if (commands.length > 1) {
            runCommands(commands.slice(1), done);
        } else {
            if (done) {
                done();
            }
        }
    });
}

exports.node = node;
exports.npm = npm;
