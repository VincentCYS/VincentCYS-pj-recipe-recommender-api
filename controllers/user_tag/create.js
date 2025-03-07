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
  "POST /create_profile": function(req, res) {
    // req.body
    req.checkBody('uid', `uid.invalid`).notEmpty().len(1, 1280);
    req.validate()
    .then(() => new Promise((resolve, reject) => {
        var ids = req.body.tags ? req.body.tags : '';

      req.db.models.ingredient.fetchIngredientTag(
        ids)
        .then(rows => {
        if (rows.length) {
            console.log(rows);
            var ids = rows.map(r => r.ingredientID);
            resolve(ids)
        } else {
          resolve([]);
        }
      }).catch(reject)
    }))
    .then((ids) => new Promise((resolve, reject) => {
      if (ids.length > 0 ) {
        req.db.models.user_tag.createUserTag(
          req.body.uid, ids
         ).then(rows => {
           if (rows) {
               console.log(rows);
               
             resolve()
           } else {
             reject()
           }
         }).catch(reject)
      } else {
        reject("select.at.least.one.recipe.tag");
      }
     
    }))
  .then((id) => res.status(200).json({
      result  : true,
  }))
  .catch(error => res.status(401).json({
    result: false,
    messages: error
}));
},

};
