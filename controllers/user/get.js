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

//   "GET /user/:id([0-9])": function(req, res) {
//     new Promise((resolve, reject) => {
//       req.db.models.user.fetchUserProfile(
//         req.params.id,
//       ).then(rows => {
//         console.log(rows);

//         if (rows.length) {
            
//           resolve(rows);
//         } else {
//           reject('profile.not.found')
//         }
//       }).catch(reject)
//     })
//   .then((rows) => res.status(200).json({
//       result  : true,
//       data    : {
          
//       }
//   }))
//   .catch(error => res.status(400).json({
//     result: false,
//     messages: error
// }));
// },
};
