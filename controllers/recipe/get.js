const fs = require("fs");
const similarity = require("compute-cosine-similarity");

const request = require("request");

const GOOGLE_API = "AIzaSyCPm4nVeSi_CmvxB5rKvyzcbDv3Yp4U7os";
const GoogleImages = require("google-images");
const StringSimilarity = require('string-similarity');

const client = new GoogleImages(
  "013552583579782283680:izt7yprf1fc",
  GOOGLE_API
);

// libs for image similiarty
const PNG = require("pngjs").PNG;

const JPEG = require("jpeg-js");
const pixelmatch = require("pixelmatch");

module.exports = {
  "GET /recipes": function(req, res) {
    // get articles

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeById(req.query.id, req.query.sortBy || 'createDate', req.query.order)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            reject("no.recipes.are.found");
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              rating          : r.rating,
              ingredient_list : r.ingredient_list,
              imageUrl        : r.imageUrl
            }))
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /similar_liked_recipe": function(req, res) {

    var rid = '';
    new Promise((resolve, reject) =>{
      req.db.models.rating.getRating(req.query.uid)
      .then(rows => {
        if (rows.length) {
          rid = rows[0].recipeID;
          resolve(rows);
        } else {
          reject("no.rating.are.found");
        }
      })
    })
    .then(() => new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchSimilarIngredientsRecipeById()
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    }))
    .then(
      rows =>
        new Promise((resolve, reject) => {
          var ref = {};
          var recommend = [];
          var sim = 0;
          rows.map(r => {
            if (r.recipeID == rid) {
              ref = r;
            }
          });

          rows.map(r => {
            if (
              r.recipeID != parseInt(rid) &&
              r.ingredient_list_id &&
              ref.ingredient_list_id
            ) {
              var refList = ref.ingredient_list_id.split(",");
              var testList = r.ingredient_list_id.split(",");


              var combineArr = [];
              testList.map(t => {
                !combineArr.includes(t) ? combineArr.push(t) : null;
              });

              refList.map(r => {
                !combineArr.includes(r) ? combineArr.push(r) : null;
              });

              var a = [];
              var b = [];
              combineArr.map(c => {
                // calculate the similarity with ingedient and portion
                a.push(
                  refList.includes(c) ? refList[refList.indexOf(c)] : 0
                );
                b.push(
                  testList.includes(c) ? testList[testList.indexOf(c)] : 0
                );
              });


              // var refPortion = ref.ingredient_list_portion.split(",");
              // var testPortion = r.ingredient_list_portion.split(",");
              // var portionArr = [];

              // // portion
              // testPortion.map(t => {
              //   !portionArr.includes(t) ? portionArr.push(t) : null;
              // });

              // refPortion.map(r => {
              //   !portionArr.includes(r) ? portionArr.push(r) : null;
              // });

              // var pa = [];
              // var pb = [];
              // portionArr.map(c => {
              //     // calculate the similarity with ingedient and portion
              //     pa.push(
              //       refPortion.includes(c) ? refPortion[refPortion.indexOf(c)] : 0
              //     );
              //     pb.push(
              //       testPortion.includes(c) ? testPortion[testPortion.indexOf(c)] : 0
              //     );
      
              // });

              // var portionSimilarity = similarity(pa, pb);
              var ingredientSimilarity = similarity(a, b);


              var s =  ingredientSimilarity * 0.9 + StringSimilarity.compareTwoStrings(r.recipeName, ref.recipeName) * 0.1;
              if (s > 0.5) {
                r.similarity = s;
                recommend.push(r);
              }
            }
          });

          recommend.sort(function(a, b) {
            var weighting = [1,0]
            var dateA = new Date(a.createDate).getTime();
            var dateB = new Date(b.createDate).getTime();

            if (a.similarity * weighting[0] + dateA * weighting[1] > b.similarity * weighting[0] + dateB * weighting[1]) {
              return -1;
            } else if (a.similarity * weighting[0] + dateA * weighting[1] < b.similarity * weighting[0] + dateB * weighting[1]) {
              return 1;
            }
            return 0;
          });

          recommend ? resolve(recommend.slice(0, 5)) : resolve([]);
          // req.db.models.
        })
    )
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              ingredient_list : r.ingredient_list_name,
              portion_list    : r.ingredient_list_portion,
              similarity      : r.similarity,
              imageUrl        : r.imageUrl,
              rating          : r.rating,
              n_rating        : r.n_rating,
            }))
          }
        })
      )
      .catch(error =>
        res.status(400).json({  
          result: false,
          messages: error
        })
      );
  },

  "GET /similar_num_of_steps_recipe": function(req, res) {
    // get articles

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchSimilarNumOfStepsRecipeById(req.query.rid)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            reject("no.recipes.are.found");
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              rating          : r.rating,
              ingredient_list : r.ingredient_list,
              imageUrl        : r.imageUrl,
              num_of_steps    : r.num_of_steps
            }))
          }
        })
      )
      .catch(error =>
        res.status(400).json({  
          result: false,
          messages: error
        })
      );
  },

  "GET /similar_calorie_recipe": function(req, res) {
    // get articles

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchSimilarCalorieRecipeById(req.query.rid)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            reject("no.recipes.are.found");
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              rating          : r.rating,
              ingredient_list : r.ingredient_list,
              imageUrl        : r.imageUrl,
              num_of_steps    : r.num_of_steps
            }))
          }
        })
      )
      .catch(error =>
        res.status(400).json({  
          result: false,
          messages: error
        })
      );
  },

  "GET /trending_recipes": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchMostTrending('d')
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id              : r.recipeID,
                name            : r.recipeName,
                ingredientSetID : r.ingredientSetID,
                detailStep      : r.detailStep,
                createDate      : r.createDate,
                createdBy       : r.createdBy,
                calorie         : r.calorielevel,
                ingredient_list : r.ingredient_list,
                rating          : r.rating,
                n_rating        : r.n_rating,
                imageUrl        : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },
  "GET /most_viewed_recipe": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchMostViewedRecipe()
        .then(rows => {
          if (rows.length) {
            // console.log(rows);

            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                rating: r.rating,
                n_rating: r.n_rating,
                imageUrl : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /recent_viewed_recipes": function(req, res) {
    req
      .checkQuery("uid", `uid.is.required`)
      .notEmpty()
      .len(1, 128)
      .matches(/[0-9]]/i);
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeWithBrowseByUserId(req.query.uid)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id              : r.recipeID,
                name            : r.recipeName,
                ingredientSetID : r.ingredientSetID,
                detailStep      : r.detailStep,
                createDate      : r.createDate,
                createdBy       : r.createdBy,
                calorie         : r.calorielevel,
                rating          : r.totalRate,
                ingredient_list : r.ingredient_list,
                imageUrl        : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /recent_searched_recipes": function(req, res) {
    req
      .checkQuery("uid", `uid.is.required`)
      .notEmpty()
      .len(1, 128)
      .matches(/[0-9]]/i);
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeWithSearchHistoryByUserId(req.query.uid)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                ingredient_list: r.ingredient_list
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /search_recipes": function(req, res) {
    req
      .checkQuery("search", `search.is.required`)
      .notEmpty()
      .len(1, 128)
      .matches(/[0-9]]/i);
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeByName(req.query.search)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
    .then((rows) => 
    new Promise((resolve, reject) => {
      req.db.models.search_history
        .createSearchHistory(req.query.uid, req.query.search)
        .then(data => {
          if (data.protocol41) {
            resolve(rows);
          } else {
            resolve(rows);
          }
        })
        .catch(reject);
    }))
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id              : r.recipeID,
                name            : r.recipeName,
                ingredientSetID : r.ingredientSetID,
                detailStep      : r.detailStep,
                createDate      : r.createDate,
                createdBy       : r.createdBy,
                calorie         : r.calorielevel,
                rating          : r.rating,
                ingredient_list : r.ingredient_list,
                imageUrl        : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /newest_recipes": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchNewestRecipe()
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
            rows.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                ingredient_list: r.ingredient_list,
                rating: r.rating,
                n_rating: r.n_rating,
                imageUrl : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /newest_low_cal_recipes": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchNewestRecipe()
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
    .then((data) => new Promise((resolve, reject) => {
      req.db.models.user
        .fetchUserProfile(req.query.uid)
        .then(rows => {
          lowCal = false;
          if (rows.length) {
            if (rows[0].onDiet == 'Y'){
              data.sort(function(a, b) {
                if (a.calorielevel < b.calorielevel) {
                  return -1;
                } else if (b.calorielevel < a.calorielevel) {
                  return 1;
                }
                return 0;
              });
              lowCal = true;
            }
            resolve({rows : data, lowCal : lowCal});
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    }))
      .then(data =>
        res.status(200).json({
          result: true,
          data: {
            total: data.rows.length,
            lowCal : data.lowCal,
            rows:
            data.rows.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                ingredient_list: r.ingredient_list,
                rating: r.rating,
                n_rating: r.n_rating,
                imageUrl : r.imageUrl
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },


  "GET /cf_recipe": function(req, res) {
    req
      .checkQuery("uid", `uid.is.required`)
      .notEmpty()
      .len(1, 128)
      .matches(/[0-9]]/i);

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchCFRecipeByRatingAndUserId(req.query.uid, req.query.rid)
        .then(rows => {
          if (rows.length) {
            var ids = rows.map(v => v.recipeID);

            req.db.models.recipe
              .fetchRecipeById(ids || [])
              .then(rows => {
                if (rows.length) {
                  resolve(rows);
                } else {
                  reject("no.recipes.are.found");
                }
              })
              .catch(reject);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(similarity =>
        res.status(200).json({
          result: true,
          data: {
            total: similarity.length,
            rows:
              similarity.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                ingredient_list: r.ingredient_list,
                rating: r.rating,
                n_rating: r.n_rating,
                imageUrl : r.imageUrl
              })).slice(0, 5) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  /*
    Calculate the similarity with ingredients and the portion
*/
  "GET /similar_recipe_ingredients": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchSimilarIngredientsRecipeById
        ()
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(
        rows =>
          new Promise((resolve, reject) => {
            var ref = {};
            var recommend = [];
            var sim = 0;
            var minDate = null;
            var maxDate = null;

            rows.map(r => {
              if (r.recipeID == req.query.rid) {
                ref = r;
              }
              var date = new Date(r.createDate).getTime()
              minDate = date < minDate ? date : minDate;
              maxDate = date > maxDate ? date : maxDate;
            });

            ref.date = (new Date(ref.createDate).getTime() - minDate) / (maxDate - minDate);

            rows.map(r => {
              if (
                r.recipeID != parseInt(req.query.rid) &&
                r.ingredient_list_id &&
                ref.ingredient_list_id
              ) {
                  var refList = ref.ingredient_list_id.split(",");
                  var refPortion = ref.ingredient_list_portion.split(",");
                  var testList = r.ingredient_list_id.split(",");
                  var testPortion = r.ingredient_list_portion.split(",");
    
                  var combineArr = [];
                  var portionArr = [];
                  testList.map(t => {
                    !combineArr.includes(t) ? combineArr.push(t) : null;
                  });
    
                  refList.map(r => {
                    !combineArr.includes(r) ? combineArr.push(r) : null;
                  });
    
                  // portion
                  testPortion.map(t => {
                    !portionArr.includes(t) ? portionArr.push(t) : null;
                  });
    
                  refPortion.map(r => {
                    !portionArr.includes(r) ? portionArr.push(r) : null;
                  });
    
                  var a = [];
                  var b = [];
                  combineArr.map(c => {
                    // calculate the similarity with ingedient and portion
                    a.push(
                      refList.includes(c) ? refList[refList.indexOf(c)] : 0
                    );
                    b.push(
                      testList.includes(c) ? testList[testList.indexOf(c)] : 0
                    );
                  });
    
                  var pa = [];
                  var pb = [];
                  portionArr.map(c => {
                      // calculate the similarity with ingedient and portion
                      pa.push(
                        refPortion.includes(c) ? refPortion[refPortion.indexOf(c)] : 0
                      );
                      pb.push(
                        testPortion.includes(c) ? testPortion[testPortion.indexOf(c)] : 0
                      );
          
                  });
    
                  var portionSimilarity = similarity(pa, pb);
                  var ingredientSimilarity = similarity(a, b);
    
    
                  var s =  ingredientSimilarity * 0.85 + portionSimilarity * 0.1 + StringSimilarity.compareTwoStrings(r.recipeName, ref.recipeName) * 0.05;
                 
                if (s > 0.5) {
                  var date = new Date(r.createDate).getTime();
                  var weighting = [0.1, 0.9]
                  r.date = (date - minDate) / (maxDate - minDate)
                  var dateDiff = (Math.abs(r.date - ref.date) / Math.max(r.date, ref.date));
                  r.weightedSimilarity = s * weighting[0] + dateDiff * weighting[1];
                  r.similarity = s
                  recommend.push(r);
                }
              }
            });

            recommend.sort(function(a, b) {
              if (a.weightedSimilarity > b.weightedSimilarity) {
                return -1;
              } else if (a.weightedSimilarity  < b.weightedSimilarity) {
                return 1;
              }
              return 0;
            });

            recommend ? resolve(recommend.slice(0, 5)) : resolve([]);
            // req.db.models.
          })
      )
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.length
              ? rows.map(r => ({
                  id                 : r.recipeID,
                  name               : r.recipeName,
                  ingredientSetID    : r.ingredientSetID,
                  detailStep         : r.detailStep,
                  createDate         : r.createDate,
                  createdBy          : r.createdBy,
                  calorie            : r.calorielevel,
                  ingredient_list    : r.ingredient_list_name,
                  portion_list       : r.ingredient_list_portion,
                  similarity         : r.similarity,
                  weightedSimilarity : r.weightedSimilarity,
                  imageUrl           : r.imageUrl,
                  rating             : r.rating,
                  n_rating           : r.n_rating,
                })) || []
              : []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /import_recipe_img": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeById([], 'recipeID')
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(
        rows =>
          new Promise((resolve, reject) => {
            rows.map(r => {
              client
                .search(r.recipeName, { size: "medium", type: "photo", page : 3})
                .then(images => {
                  var imgUrl = "";
                  images.map(img => {
                    if (
                      imgUrl == "" &&
                      img.width == 300 &&
                      img.height == 300 &&
                      img.type == "image/jpeg"
                    ) {
                      imgUrl = img.url;
                    }
                  });
                  console.log(images);

                  var download = function(uri, filename, callback) {
                    request.head(uri, function(err, res, body) {
                      request(uri)
                        .pipe(fs.createWriteStream(filename))
                        .on("close", callback);
                    });
                  };

                  download(
                    imgUrl,
                    `./images/recipe_id_${r.recipeID}.jpg`,
                    function() {
                      console.log("done");
                    }
                  );

                  req.db.models.recipe
                    .updateById(imgUrl, r.recipeID)
                    .then(rows => {
                      console.log(rows);
                    })
                    .catch(reject);
                })
                .catch(err => console.log(err));
            });

            resolve();
      }))
      .then(() =>
        res.status(200).json({
          result: true
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  "GET /recipe_image_similarity": function(req, res) {
    req
    .checkQuery("rid", `rid.is.required`)
    .notEmpty()
    .len(1, 128)
    .matches(/[0-9]]/i);

    var rid = req.query.rid;

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeById([], 'createDate')
        .then(rows => {
          if (rows.length) {
            var ref = {};
            rows.map((r, i) => {
                if (r.recipeID == rid) {
                  ref = r;
                  rows.splice(i, 1);
                }
            })
            resolve({rows : rows, ref : ref});
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(
        data =>
          new Promise((resolve, reject) => {
            if (data.rows.length) {

              data.rows.map(r => {
                var ref = data.ref;

                // image similiarty
                const jpegData1 = fs.readFileSync(`./images/recipe_id_${data.ref.recipeID}.jpg`);
                const img1 = JPEG.decode(jpegData1);
  
                const jpegData2 = fs.readFileSync(`./images/recipe_id_${r.recipeID}.jpg`);
                const img2 = JPEG.decode(jpegData2);

                
                const diff = new PNG({ width: img1.width, height: img1.height });
  
                const numDiffPixels = pixelmatch(
                  img1.data,
                  img2.data,
                  diff.data,
                  img1.width,
                  img1.height,
                  { threshold: 0.085 }
                );
                r.diffInPx = 1 - numDiffPixels / 300 / 300;
                
                // for verify similarity accuraacy
                var refList = ref.ingredient_list_id.split(",");
                var refPortion = ref.ingredient_list_portion.split(",");
                var testList = r.ingredient_list_id.split(",");
                var testPortion = r.ingredient_list_portion.split(",");

                var combineArr = [];
                testList.map(t => {
                  !combineArr.includes(t) ? combineArr.push(t) : null;
                });

                refList.map(r => {
                  !combineArr.includes(r) ? combineArr.push(r) : null;
                });

                var a1 = [];
                var a2 = [];
                combineArr.map(c => {
                  // calculate the similarity with ingedient and portion
                  a1.push(
                    refList.includes(c) ? refPortion[refList.indexOf(c)] : 0
                  );
                  a2.push(
                    testList.includes(c) ? testPortion[testList.indexOf(c)] : 0
                  );
                });

                r.similarityToRef = similarity(a1, a2);


                // tuning the similarity by adding similiar ingredients features in weighting
                r.diffInPx = 0.1 * r.similarityToRef + 0.9 * r.diffInPx
              });


                           
              data.rows.sort(function(a, b) {
                if (a.diffInPx > b.diffInPx) {
                  return -1;
                } else if (b.diffInPx > a.diffInPx) {
                  return 1;
                }
                return 0;
              });
              // click rid 46
              data.rows = data.rows.splice(0,5);

              // var counter = 0;
              // data.rows.map(r => {
              //   testId.includes(r.recipeID) ? counter++ : null;
              //   console.log(r.recipeID);
              // });


              // console.log('accuracy: ', counter / 5);
              

              resolve(data.rows);    
            } else {
              resolve([]);
            }
          })
      )
      .then((rows) =>
        res.status(200).json({
          result : true,
          data : {
              rows   : rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              ingredient_list : r.ingredient_list,
              rating          : r.rating,
              n_rating        : r.n_rating,
              similarity      : r.diffInPx,
              imageUrl        : r.imageUrl,
              similarityToRef : r.similarityToRef
            })) || []
          }

        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },


  "GET /user_profile_based_recommend": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeByUserLike(req.query.uid)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id              : r.recipeID,
                name            : r.recipeName,
                ingredientSetID : r.ingredientSetID,
                detailStep      : r.detailStep,
                createDate      : r.createDate,
                createdBy       : r.createdBy,
                calorie         : r.calorielevel,
                ingredient_list : r.ingredient_list,
                rating          : r.rating || 0,
                n_rating        : r.n_rating,
                imageUrl        : r.imageUrl,
                tag_similarity  : r.tag_similarity
              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  
  "GET /not_popular": function(req, res) {
    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchMostTrending()
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows:
              rows.map(r => ({
                id: r.recipeID,
                name: r.recipeName,
                ingredientSetID: r.ingredientSetID,
                detailStep: r.detailStep,
                createDate: r.createDate,
                createdBy: r.createdBy,
                calorie: r.calorielevel,
                ingredient_list: r.ingredient_list,
                rating: r.rating || 0,
                n_rating: r.n_rating,
                imageUrl : r.imageUrl,
                tag_similarity : r.tag_similarity

              })) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },

  // "GET /similarUserPredictionByTags": function(req, res) {
  //   new Promise((resolve, reject) => {
  //     req.db.models.user
  //       .fetchSimilarUserByTags(req.query.uid)
  //       .then(rows => {
  //         if (rows.length) {
  //           resolve(rows[0].userID);
  //         } else {
  //           reject();
  //         }
  //       })
  //       .catch(reject);
  //   })
  //   .then((id) => new Promise((resolve, reject) => {
  //     req.db.models.recipe
  //       .fetchMostFavRecipeByUserID(id)
  //       .then(rows => {
  //         if (rows.length) {
  //           resolve(rows);
  //         } else {
  //           resolve([]);
  //         }
  //       })
  //       .catch(reject);
  //   }))
  //     .then(rows =>
  //       res.status(200).json({
  //         result: true,
  //         data: {
  //           total: rows.length,
  //           rows:
  //             rows.map(r => ({
  //               id              : r.recipeID,
  //               name            : r.recipeName,
  //               ingredientSetID : r.ingredientSetID,
  //               detailStep      : r.detailStep,
  //               createDate      : r.createDate,
  //               createdBy       : r.createdBy,
  //               calorie         : r.calorielevel,
  //               ingredient_list : r.ingredient_list,
  //               rating          : r.rating || 0,
  //               n_rating        : r.n_rating,
  //               imageUrl        : r.imageUrl,
  //               tag_similarity  : r.tag_similarity,
  //               rate_of_fav     : r.rate_of_fav
  //             })) || []
  //         }
  //       })
  //     )
  //     .catch(error =>
  //       res.status(400).json({
  //         result: false,
  //         messages: error
  //       })
  //     );
  // },

  // find similiarity with userlike tags and gender
  "GET /cf_user_profile_recipe": function(req, res) {
    req
      .checkQuery("uid", `uid.is.required`)
      .notEmpty()
      .len(1, 128)
      .matches(/[0-9]]/i);

    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeIDBySimilarUserWithProfileAndGender(req.query.uid)
        .then(rows => {
          if (rows.length) {
              var max = 0;
              var min = null;
              rows.map(r => {
                max = r.count_similar > max ? r.count_similar : max
                min = r.count_similar < min || min == null ? r.count_similar : min
              })

              rows.map(r => {
                var g = 0, d = 0, a = 0;
                g = r.gender == r.ref_gender ? 1 : 0;
                d = r.onDiet == r.ref_on_diet ? 1 : 0;
                a = 1 - Math.abs(r.age - r.ref_age) / Math.max(r.age, r.ref_age);
                r.similarity = (r.count_similar - min)/(max -min) * 0.3 + g * 0.2 + d * 0.3 + a * 0.2;
              })

              rows.sort(function(a, b) {
                if (a.similarity > b.similarity) {
                  return -1;
                } else if (b.similarity > a.similarity) {
                  return 1;
                }
                return 0;
              });

            var ids = rows.map(v => v.userID);

            req.db.models.recipe
              .fetchMostFavRecipeByUserID(ids[0] || [])
              .then(rows => {
                if (rows.length) {
                  resolve(rows);
                } else {
                  reject("no.recipes.are.found");
                }
              })
              .catch(reject);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    })
      .then(similarity =>
        res.status(200).json({
          result: true,
          data: {
            total: similarity.length,
            rows:
              similarity.map(r => ({
                id              : r.recipeID,
                name            : r.recipeName,
                ingredientSetID : r.ingredientSetID,
                detailStep      : r.detailStep,
                createDate      : r.createDate,
                createdBy       : r.createdBy,
                calorie         : r.calorielevel,
                ingredient_list : r.ingredient_list,
                rating          : r.rating,
                n_rating        : r.n_rating,
                imageUrl        : r.imageUrl
              })).slice(0, 5) || []
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  },


  "GET /time_based_recipes": function(req, res) {
    var date = req.query.time || new Date();
    var hour = date.getHours();
    var mintues = date.getMinutes();

    const timeBasedTags = [
      //breakfast
      {
        from : 21,
        to : 9,
        tags : [
          'Breakfast',
          'Fruit',
          'dairy',
          'drink',
          'Bread',
          'vegetable',
        ]
      },
      //lunch
      {
        from : 9,
        to : 14,
        tags : [
          'vegetable dish',
          'meat',
          'pasta dish',
          'soup',
          'drink',
          'pasta',
          'seafood',
          'cheese',
          'poultry',
          'vegetable'
        ]
      },
      //tea
      {
        from : 14,
        to : 17,
        tags :[
          'dessert',
          'drink',
          'dairy',
          'fruit'
        ]
      },
      //dinner
      {
        from : 17,
        to : 21,
        tags : [
          'vegetable dish',
          'meat',
          'pasta dish',
          'soup',
          'drink',
          'pasta',
          'seafood',
          'cheese',
          'poultry',
          'vegetable'
        ]
      }
    ];


    var tags = null;
    timeBasedTags.map(t => {
      if (t.from > t.to && (24 >= hour && hour >= 21 || 0 <= hour && hour <= 9) ) {
        tags =  t.tags
      } else if (hour >= t.from && hour < t.to) {
        tags =  t.tags
      }
    });

    console.log('tags: ', tags);
    

    console.log('hour: ', hour, 'minutes: ', date.getMinutes());
    


    new Promise((resolve, reject) => {
      req.db.models.recipe
        .fetchRecipeByTag(tags, req.query.sortBy || 'createDate', req.query.order)
        .then(rows => {
          if (rows.length) {
            resolve(rows);
          } else {
            reject("no.recipes.are.found");
          }
        })
        .catch(reject);
    })
      .then(rows =>
        res.status(200).json({
          result: true,
          data: {
            total: rows.length,
            rows: rows.map(r => ({
              id              : r.recipeID,
              name            : r.recipeName,
              ingredientSetID : r.ingredientSetID,
              detailStep      : r.detailStep,
              createDate      : r.createDate,
              createdBy       : r.createdBy,
              calorie         : r.calorielevel,
              rating          : r.rating,
              ingredient_list : r.ingredient_list,
              imageUrl        : r.imageUrl,
              n_rating        : r.n_rating
            }))
          }
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  }
};
