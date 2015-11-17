var _ = require("lodash");
var fs = require("fs-extra");
var git = require("gift");
var async = require("async");
var child_process = require("child_process");
var backend = require("git-http-backend");

var Repository = function(options){
    var self = this;

    this.options = options;

    this.commands = [
        "git-receive-pack",
        "git-upload-pack"
    ]

    this.handler = function(req, res, middleware){
        req.pipe(backend(req.url, function(err, service){
            if(err){
                res.statusCode = 500;
                res.end([err.message, "\n"].join(""));
                return;
            }

            res.setHeader("content-type", service.type);

            async.waterfall(middleware, function(err){
                if(err){
                    res.statusCode = err.statusCode || 400;
                    _.each(err.headers, function(value, header){
                        res.setHeader(header, value);
                    });
                    res.end(err.message);
                }
                else if(_.contains(self.commands, service.cmd)){
                    var repo_dir = [self.options.path, res.repository_name].join("/");
                    var ps = child_process.spawn(service.cmd, service.args.concat(repo_dir));
                    ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
                }
            });
        })).pipe(res);
    },

    this.middleware = {
        name: "init_repository",
        weight: 1000,
        fn: function(req, res, next){
            var repo_dir = [self.options.path, res.repository_name].join("/");

            fs.stat(repo_dir, function(err, stat){
                if(err){
                    fs.mkdirp(repo_dir, function(err){
                        if(err)
                            return next(err);

                        git.init(repo_dir, true, function(err, repo){
                            if(err)
                                return next(err);
                            else
                                return next();
                        });
                    });
                }
                else
                    return next();
            });
        }
    }
}

module.exports = Repository;
