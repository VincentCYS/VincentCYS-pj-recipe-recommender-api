const fs    = require('fs');
const mysql = require('mysql');

module.exports = function(req, res, next) {
    // create a connection
    var conn = mysql.createConnection(req.db.conf);
    // save existing method
    res.pageStatus = res.status;
    // override response method
    res.status = function(code) {
        // connection exists
        if (typeof req.db != "undefined" && req.db.conn) {
            // succeed?
            if (code <= 399 && res.statusCode <= 399) {
                // save cache
                req.db.conn.commit(e => {});
            } else {
                // clear cache
                req.db.conn.rollback();
            }
            // release connection
            // req.db.conn.end();
        }
        // show response
        return res.pageStatus(code);
    };
    // get db connection
    conn.connect(err => {
        if (err) {
            res.status(500).json({
                result  : false,
                messages : ['db.connection.lost']
            });
        } else {
            // error handler
            conn.on('error', e => {
                console.log(e.code); // 'ER_BAD_DB_ERROR'
            });
            // start with transaction
            conn.beginTransaction(e => {
                if (err || e) {
                    // return error
                    res.status(500).json({
                        result  : false,
                        message : err || e
                    });
                } else {
                    // setup connection
                    req.db = req.db || {};
                    req.db.conn = conn;
                    req.db.models = {};
                    // get models
                    fs.readdir(`${__dirname}/../models`, (err, models) => {
                        // load models
                        (models || []).forEach(model => {
                            // get model name
                            var name = model.split('.').shift();
                            // append model to container
                            try {req.db.models[name] = require(`${__dirname}/../models/${name}`)(conn)} catch(e) {}
                        });
                        // finished
                        next();
                    });
                }
            });
        }
    });
};