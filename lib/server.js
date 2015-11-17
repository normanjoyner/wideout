var http = require("http");
var _ = require("lodash");

var middleware = [
    {
        name: "parse_routes",
        weight: 100,
        fn: function(req, res, next){
            var url_parts = req.url.split("/");
            res.repository_name = url_parts[1];
            return next();
        }
    }
]

var Server = function(options){
    this.server = null;
    this.middleware = middleware;
    this.options = options;
}

Server.prototype.add_middleware = function(middleware){
    this.middleware.push(middleware);
}

Server.prototype.start = function(){
    var self = this;
    this.server = http.createServer(function(req, res){
        var middleware_fns = _.sortBy(self.middleware, function(middleware){
            return middleware.weight;
        });

        middleware_fns = _.map(middleware_fns, function(middleware){
            return function(fn){
                middleware.fn(req, res, fn);
            }
        });

        self.options.repository.handler(req, res, middleware_fns);
    });

    this.server.listen(this.options.port, this.options.host);
}

module.exports = Server;
