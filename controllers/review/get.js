const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const similarity = require("compute-cosine-similarity");
const stringSimilarity = require("string-similarity");
const WordPOS = require("wordpos");


module.exports = {
  "GET /getReview": function(req, res) {
    var reviews = [];
    console.log(req.query);

    var key = req.query ? Object.keys(req.query) : ''

    fs.createReadStream("./dataset/RAW_interactions.csv")
      .pipe(csv())
      .on("data", row => {
        if (req.query && row[key]) {
          var data = row[key][0] == '[' ? row[key].slice(1, row[key].length - 2).split(", ") : row[key]
          if (Array.isArray(data) && row[key].includes(req.query[key])) {
            reviews.push(row)
          } else if (data == req.query[key]){
            reviews.push(row)
          }
        } else {
          reviews.push(row)
        }


      })
      .on("end", err => {
        if (!err) {          
          res.status(200).json({
            result: true,
            length : reviews.length,
            reviews: reviews
          });
        } else {
          res.status(500).json({
            result: false,
            error: err
          });
        }
      });
  },

  // uid 104295 705251
  "GET /getUserSimilarity": function(req, res) {
    var reviews = [];

    var userID = req.query.ids.split(',');
    var userA = [];
    var userB = [];


    fs.createReadStream("./dataset/RAW_interactions.csv")
      .pipe(csv())
      .on("data", row => {
        if (row.user_id == userID[0]) {
            userA.push(row)
        } else if (row.user_id == userID[1]){
            userB.push(row)
        }


      })
      .on("end", err => {

        var rateA = [];
        var rateB = [];
            
        userA.map(a => {
            userB.map(b => {
                if (a.recipe_id == b.recipe_id) {
                    rateA.push(parseInt(a.rating));
                    rateB.push(parseInt(b.rating));
                }
            })
        })

        var s = similarity(rateA, rateB);

        // console.log(rateA, rateB); 
        
        
        if (!err) {          
          res.status(200).json({
            result: true,
            length : similarity.length,
            similarity : s,
            a: rateA,
            b : rateB
          });
        } else {
          res.status(500).json({
            result: false,
            error: err
          });
        }
      });
  },
};
