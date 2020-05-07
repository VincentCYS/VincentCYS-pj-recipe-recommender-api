// const http = require("http");
const express          = require("express");
const bodyParser       = require("body-parser");
const expressValidator  = require('express-validator');
// const fs = require("fs");
// const path = require("path");
// const csv = require("csv-parser");
// const similarity = require('compute-cosine-similarity')
// var stringSimilarity = require('string-similarity');

const hostname = "127.0.0.1";
const port     = 3000;

const app = express();
// app.use(expressValidator());

// set site url
app.use(function(req, res, next) {
  // global encryption key
  req.encryptionKey = `4#,dv4@)28$go{),@Y4*`;
  // setup db conf
  req.db = {
      conf: {
          host                : 'localhost', //*process.env.PORT ? '127.0.0.1' :*/ 'db-os-prod.ctxbqkm6oe8k.ap-southeast-1.rds.amazonaws.com',
          port                : '3306',
          user                : 'root',
          password            : '',
          database            : 'fyp',
          charset             : 'utf8mb4_unicode_ci',
          timezone            : 'UTC+0',
          multipleStatements  : true
      }
  };
  // cross domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(expressValidator());


// load modules
app.use(require('./libraries/form_validator')); // form validator
app.use(require('./libraries/dbrepo')); // db driver

app.use('/', require('./libraries/router'));


// if (process.env.PORT) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
// } else {
  // app.listen(port, hostname, () => {
  //   console.log(`app running at http://${hostname}:${port}/`);
  // });
// }
module.exports = app;