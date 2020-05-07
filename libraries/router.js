const fs        = require('fs');
const router    = require('express').Router();
const auth      = require('http-auth');



var guard = {},
    endpoints = {};



var gate = function(req, res, next) {
    next()
    // // get auth handler
    // var authHandlers = (guard[req.route.path] || {})[req.method.toLowerCase()];
    // // not auth?
    // if (Object.keys(authHandlers).length <= 1 && typeof authHandlers['visitor'] != 'undefined') {
    //     // go related controller
    //     next();
    // } else {
    //     // setup auth
    //     auth.basic({ realm: 'common.auth.required' }, (username, password, callback) => {
    //         // set process container
    //         req.db.models.mall.auth(username, password)
    //         // succeeded
    //         .then(rows => {
    //             // get consumer info
    //             req.auth = (rows || []).shift();
    //             // stop
    //             callback(typeof req.auth != 'undefined');
    //         })
    //         // db error
    //         .catch(error => (!error || !console.log(error)) && callback(false));
    //     })
    //     .check(req, res, () => {
    //         if (!req.auth) {
    //             res.status(401).json({
    //                 result      : false,
    //                 messages    : ['Permission denied.']
    //             });
    //         } else {
    //             next();
    //         }
    //     });
    // }
};




// extract handlers from dir
const FILES = (function extractHandlers(path) {
    let files = [];
    // scan files
    (fs.readdirSync(path) || []).forEach(name => {
        // get file info
        var stats = fs.statSync(path + '/' + name);
        // need to scan
        if (stats.isDirectory()) {
            files = files.concat(extractHandlers(path + '/' + name));
        // script file
        } else if (stats.isFile() && /^[a-z0-9._-]+(\.js)?$/i.test(name)) {
            files.push(path + '/' + name);
        }
    });
    return files;
})(`${__dirname}/../controllers`);




// parse controllers
FILES.forEach(file => {
    // setup container
    var controller = null;
    // get controller
    try { controller = require(file) } catch(e ) { console.log(e);controller = null } finally { controller = controller || {} };
    // load routes
    for (var uri in controller) {
        // get args
        var args = uri.match(/(([a-z]+) +)?((.+)@)?(\/.*)/i) || [];
        // get method
        var method = (args[2] || 'GET').toLowerCase();
        // get auth agent
        var agent = args[4] || '';
        // get pathname
        var pathname = args[5] || '/';
        // get handler
        var handler = controller[uri];
        // setup container
        guard[pathname] = guard[pathname] || {};
        // save auth method
        guard[pathname][method] = guard[pathname][method] || {};
        // save handler
        guard[pathname][method][agent] = handler;
        // save endpoint
        endpoints[uri] = uri;
    }
});



(function setHandlers() {
    // set handlers
    for (var pathname in guard) {
        for (var method in guard[pathname]) {
            router[method.toLowerCase()](pathname, gate, function(req, res) {
                // get routes
                const ROUTES = guard[req.route.path][req.method.toLowerCase()];
                // get handler
                var handler = ROUTES[''];
                // handler not found
                if (!handler) {
                    res.status(404).json({
                        result: false,
                        messages: ['Page not found.']
                    });
                } else {
                    // kickoff
                    handler(req, res);
                }
            });
        }
    }
})();



module.exports = router;