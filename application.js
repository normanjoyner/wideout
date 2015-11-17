var _ = require("lodash");
var config = require([__dirname, "lib", "config"].join("/"));
var Server = require([__dirname, "lib", "server"].join("/"));
var Repository = require([__dirname, "lib", "repository"].join("/"));

var Wideout = function(options){
    if(_.isUndefined(options))
        options = {};

    this.repository = new Repository(_.defaults(options.repository || {}, config.repository));
    this.server = new Server(_.defaults(options.server || {}, config.server));
    this.server.options.repository = this.repository;
    this.server.add_middleware(this.repository.middleware);
    return this.server;
}

module.exports = Wideout;
