const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const similarity = require("compute-cosine-similarity");
const WordPOS = require("wordpos");
const { parse } = require("recipe-ingredient-parser");




module.exports = {
  "POST /login": function(req, res) {
        // req.body
        req.checkBody('username', `username.invalid`).notEmpty().len(1, 1280);
        req.checkBody('passwd', `passwd.required`).notEmpty().len(1, 256);
        req.validate()
        .then(() => new Promise((resolve, reject) => {
          req.db.models.user.login(
            req.body.username,
            req.body.passwd,
          ).then(rows => {
            if (rows.length) {
                
              resolve(rows[0]);
            } else {
              reject('wrong.username.or.passwd')
            }
          }).catch(reject)
        }))
      .then((r) => res.status(200).json({
          result  : true,
          data    : {
              id : r.userID,
              username : r.userName,
              userType  : r.userType || ''
          }
      }))
      .catch(error => res.status(401).json({
        result: false,
        messages: error
    }));
  },

  "POST /register": function(req, res) {
    // req.body
    req.checkBody('username', `username.invalid`).notEmpty().len(1, 1280);
    req.checkBody('passwd', `passwd.required`).notEmpty().len(1, 256);
    req.checkBody('gender', `gender.required`).notEmpty().len(1, 256);
    req.checkBody('age', `age.required`).notEmpty().len(1, 3);
    req.checkBody('onDiet', `onDiet.required`).notEmpty();
    req.validate()
    .then(() => new Promise((resolve, reject) => {
      req.db.models.user.fetchUserByUsername(
        req.body.username,


      ).then(rows => {
        if (rows.length) {
            
          reject('account.exists');
        } else {
          resolve();
        }
      }).catch(reject)
    }))
    .then(() => new Promise((resolve, reject) => {
      req.db.models.user.register(
        req.body.username,
        req.body.passwd,
        req.body.gender,
        req.body.age,
        req.body.onDiet
      ).then(rows => {
        if (rows.insertId) {
          resolve(rows.insertId)
        } else {
          reject()
        }
      }).catch(reject)
    }))
  .then((id) => res.status(200).json({
      result  : true,
      data    : {
          id : id
      }
  }))
  .catch(error => res.status(401).json({
    result: false,
    messages: error
}));
},

};
