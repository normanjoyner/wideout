#!/usr/bin/env node
var Wideout = require([__dirname, "application"].join("/"));

var wideout = new Wideout({
    repository: {
        path: process.env.REPO_PATH
    },
    server: {
        host: process.env.HOST,
        port: process.env.PORT
    }
});

wideout.start();
