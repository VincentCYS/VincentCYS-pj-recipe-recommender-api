module.exports = (db) => {
    var model = {
        fetchRecipeById: function() {
            var args = Array.from(arguments);
            var rid = '';
            var sortBy = '';
   
            rid = args[0];
            sortBy = args[1] || 'recipeID';
            order = args[2] || 'd';
            // create query            
            var query = `
            SELECT           
            r.*, 
            (
                SELECT GROUP_CONCAT(CONCAT(portion,' ' ,s.quantifier, ' ', i.ingredientName))
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list,
            (
                SELECT GROUP_CONCAT(i.ingredientID)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_id,
            (
                SELECT GROUP_CONCAT(i.ingredientName)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_name,
            (
                SELECT GROUP_CONCAT(s.portion)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_portion,
            IFNULL (
            ( 
                SELECT AVG(rating) AS totalRate 
                FROM rating AS a
              WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS rating,
            IFNULL (
            ( 
                SELECT COUNT(*) n_rating  
                FROM rating AS a
                WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS n_rating,
            GROUP_CONCAT(s.description) AS detailStep,
			COUNT(*) AS num_of_steps

            FROM recipe AS r 
            INNER JOIN detailstep AS s
            ON r.recipeID = s.recipeID
            ${typeof rid != 'undefined' && rid.length ? `WHERE r.recipeID IN (${rid})` : '' }
			GROUP BY r.recipeID
            ORDER BY r.${sortBy} ${order == 'a' ? '' : 'DESC'}
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        fetchRecipeByTag: function() {
            var args = Array.from(arguments);
   
            var tag = args[0];
            var sortBy = args[1];
            order = args[2] || 'd';
            // create query            
            var query = `
            SELECT           
            r.*, 
            (
                SELECT GROUP_CONCAT(CONCAT(portion,' ' ,s.quantifier, ' ', i.ingredientName))
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list,
            (
                SELECT GROUP_CONCAT(i.ingredientID)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_id,
            (
                SELECT GROUP_CONCAT(i.ingredientName)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_name,
            (
                SELECT GROUP_CONCAT(s.portion)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_portion,
            IFNULL (
            ( 
                SELECT AVG(rating) AS totalRate 
                FROM rating AS a
              WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS rating,
            IFNULL (
            ( 
                SELECT COUNT(*) n_rating  
                FROM rating AS a
                WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS n_rating,
            GROUP_CONCAT(s.description) AS detailStep,
			COUNT(*) AS num_of_steps

            FROM recipe AS r 
            INNER JOIN recipetag AS t
                        ON t.recipeID = r.recipeID 

            INNER JOIN  detailstep AS s
                        ON s.recipeID = r.recipeID 

            WHERE t.recipeTagTypeID IN (
                SELECT recipeTagTypeID
                FROM recipetagtype
                WHERE recipeTagTypeName IN (?)
            )
            GROUP BY r.recipeID
            ORDER BY n_rating DESC
            LIMIT 5;
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        fetchRecipeByName: function() {
            var args = Array.from(arguments);
            var search = args[0];

            // create query            
            var query = `
            SELECT           
            r.*, 
            (
                SELECT GROUP_CONCAT(CONCAT(portion,' ' ,s.quantifier, ' ', i.ingredientName))
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list,
            (
                SELECT GROUP_CONCAT(i.ingredientID)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_id,
            (
                SELECT GROUP_CONCAT(i.ingredientName)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_name,
            (
                SELECT GROUP_CONCAT(s.portion)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_portion,
            IFNULL (
            ( 
                SELECT AVG(rating) AS totalRate 
                FROM rating AS a
              WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS rating,
            IFNULL (
            ( 
                SELECT COUNT(*) n_rating  
                FROM rating AS a
                WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS n_rating

            FROM recipe AS r 
            INNER JOIN detailstep AS s
            ON r.recipeID = s.recipeID
            WHERE LOWER(r.recipeName) LIKE '%${search.toLowerCase()}%'
            GROUP BY r.recipeID
            ORDER BY rating DESC
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        
        fetchSimilarIngredientsRecipeById: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT DISTINCT
                *, 
                (
                    SELECT GROUP_CONCAT(i.ingredientID)
                    FROM ingredientset AS s
                    INNER JOIN ingredient AS i
                    ON i.ingredientID = s.ingredientID
                    WHERE r.recipeID = s.recipeID
                ) AS ingredient_list_id,
                (
                    SELECT GROUP_CONCAT(i.ingredientName)
                    FROM ingredientset AS s
                    INNER JOIN ingredient AS i
                    ON i.ingredientID = s.ingredientID
                    WHERE r.recipeID = s.recipeID
                ) AS ingredient_list_name,
                (
                    SELECT GROUP_CONCAT(s.portion)
                    FROM ingredientset AS s
                    INNER JOIN ingredient AS i
                    ON i.ingredientID = s.ingredientID
                    WHERE r.recipeID = s.recipeID
                ) AS ingredient_list_portion,
                IFNULL (
                    ( 
                        SELECT AVG(rating) AS totalRate 
                        FROM rating AS a
                      WHERE a.recipeID = r.recipeID
        
                        GROUP BY a.recipeID
                    )
                    , 0) AS rating,
                    IFNULL (
                    ( 
                        SELECT COUNT(*) n_rating  
                        FROM rating AS a
                        WHERE a.recipeID = r.recipeID
        
                        GROUP BY a.recipeID
                    )
                    , 0) AS n_rating
                
            FROM recipe AS r 
            ORDER BY r.createDate DESC
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        fetchSimilarCalorieRecipeById: function() {
            var args = Array.from(arguments);    
            var rid = args[0];
            // create query
            var query = `
            SELECT           
            r.*, 
            (
                SELECT GROUP_CONCAT(CONCAT(portion,' ' ,s.quantifier, ' ', i.ingredientName))
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list,
            (
                SELECT GROUP_CONCAT(i.ingredientID)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_id,
            (
                SELECT GROUP_CONCAT(i.ingredientName)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_name,
            (
                SELECT GROUP_CONCAT(s.portion)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_portion,
            IFNULL (
            ( 
                SELECT AVG(rating) AS totalRate 
                FROM rating AS a
              WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS rating,
            IFNULL (
            ( 
                SELECT COUNT(*) n_rating  
                FROM rating AS a
                WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS n_rating,
            GROUP_CONCAT(s.description) AS detailStep,
			COUNT(*) AS num_of_steps

            FROM recipe AS r 
            
            INNER JOIN  detailstep AS s
                        ON s.recipeID = r.recipeID 

            WHERE ABS(r.calorielevel - (
                SELECT calorielevel
                FROM recipe
                WHERE recipeID = ${rid}
            ) )<= 100 AND
            r.recipeId != ${rid}
            GROUP BY r.recipeID
            ORDER BY r.calorielevel
            LIMIT 5;
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        fetchSimilarNumOfStepsRecipeById: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT           
            r.*, 
            (
                SELECT GROUP_CONCAT(CONCAT(portion,' ' ,s.quantifier, ' ', i.ingredientName))
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list,
            (
                SELECT GROUP_CONCAT(i.ingredientID)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_id,
            (
                SELECT GROUP_CONCAT(i.ingredientName)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_name,
            (
                SELECT GROUP_CONCAT(s.portion)
                FROM ingredientset AS s
                INNER JOIN ingredient AS i
                ON i.ingredientID = s.ingredientID
                WHERE r.recipeID = s.recipeID
            ) AS ingredient_list_portion,
            
            
           group_concat(s.description),
			COUNT(*) AS num_of_steps,
            IFNULL (
            ( 
                SELECT AVG(rating) AS totalRate 
                FROM rating AS a
              WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS rating,
            IFNULL (
            ( 
                SELECT COUNT(*) n_rating  
                FROM rating AS a
                WHERE a.recipeID = r.recipeID

                GROUP BY a.recipeID
            )
            , 0) AS n_rating

            FROM recipe AS r 
            INNER JOIN detailstep AS s
            ON r.recipeID = s.recipeID
			GROUP BY r.recipeID
            HAVING  ABS(num_of_steps - (
				SELECT COUNT(*)
                FROM detailstep
                WHERE recipeID = ?
                GROUP BY recipeID
            ) ) <= 1
            LIMIT 5;
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        
        fetchRecipeWithBrowseByUserId: function() {
            var args = Array.from(arguments);
            
            // create query
            var query = `
            SELECT DISTINCT 
                recipeID,
                recipeName,
                detailStepID,
                createDate,
                calorielevel,
                createdBy,
                servings,
                IFNULL (
                    ( 
                        SELECT AVG(rating) AS totalRate 
                        FROM rating AS a
                      WHERE a.recipeID = r.recipeID
        
                        GROUP BY a.recipeID
                    )
                    , 0) AS totalRating,,
                imageUrl
            FROM
            (SELECT 
                b.browseID,
                r.* , (
                SELECT AVG(rating) 
                FROM rating AS a 
                WHERE a.recipeID = b.recipeID 
                GROUP BY b.recipeID
            ) AS totalRating
            FROM recipe AS r
            INNER JOIN userbrowsehistory AS b
            ON r.recipeID = b.recipeID
            WHERE b.userID = ?
            ORDER BY b.browseID DESC) AS browse
            LIMIT 5
            

            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        fetchRecipeWithSearchHistoryByUserId: function() {
            var args = Array.from(arguments);
            
            // create query
            var query = `
            SELECT
                *
            FROM recipe AS r 
            INNER JOIN (
                SELECT keyword
                FROM usersearchhistory
                WHERE userID = ?
			    ORDER BY searchHistID DESC
                LIMIT 1
            ) AS s            
            ON LOWER(r.recipeName) LIKE CONCAT('%', LOWER(s.keyword) ,'%')
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },


        fetchNewestRecipe: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT
            r.*, IFNULL(COUNT(a.recipeID) , 0)as n_rating,
            IFNULL(AVG(rating), 0 ) AS rating
            FROM recipe AS r 
			 LEFT JOIN rating AS a
            ON r.recipeID = a.recipeID
            GROUP BY r.recipeID

            ORDER BY createDate DESC

            LIMIT 5
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        fetchMostViewedRecipe: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT 
                r.*,
                AVG(rating) AS rating,
                (SELECT COUNT(*) 
                    FROM rating AS a
                    WHERE r.recipeID = a.recipeID) AS n_rating
            FROM userbrowsehistory AS u
            INNER JOIN recipe AS r
            ON r.recipeID = u.recipeID
            JOIN  rating AS a
            ON a.recipeID = u.recipeID
            GROUP BY recipeID
            ORDER BY n_rating DESC
            LIMIT 5
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        fetchMostTrending: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT 
            r.*,
            COUNT(*)  +  (
            SELECT COUNT(*) 
            FROM rating AS a
            WHERE r.recipeID = a.recipeID
            ) AS popularity,
            
            (
            SELECT COUNT(*) 
            FROM rating AS a
            WHERE r.recipeID = a.recipeID
            ) AS n_rating,
                
            (
            SELECT AVG(rating) 
            FROM rating AS a
            WHERE r.recipeID = a.recipeID
            GROUP BY a.recipeID
            ) AS rating
                
            FROM userbrowsehistory AS u
            JOIN recipe AS r
            ON r.recipeID = u.recipeID
            GROUP BY r.recipeID
            ORDER BY popularity ${args[0] == 'd' ? 'DESC' : ''}
            LIMIT 5
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        fetchCFRecipeByRatingAndUserId: function() {
            var args = Array.from(arguments);            
            var userId = args[0];
            var recipeID = args[1];
            // create query
            var query = `
            SELECT  recipeID
            FROM rating
            WHERE
                userID IN(
                    SELECT userID
                    FROM rating 
                    WHERE
                        recipeID IN (SELECT recipeID FROM rating WHERE userID = ${userId})
                        AND rating >= 4
                    GROUP BY userID
                    HAVING
                        COUNT(*) <= (SELECT COUNT(*) FROM rating WHERE userID = ${userId})
                    ORDER BY COUNT(*)
                )
                AND rating >= 4
                AND recipeID NOT IN (
                    SELECT recipeID FROM rating WHERE userID = ${userId}
                )
                AND  userID != ${userId}
                AND recipeID != ${recipeID}

            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {

                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows || {});
                });
            });
        },

        fetchRecipeByUserLike: function() {
            var args = Array.from(arguments);            
            // create query
            var uid = args[0];
            var query = `
            SELECT 
            r.* ,
            (
                SELECT COUNT(*) 
                FROM rating AS a
                WHERE r.recipeID = a.recipeID
            ) AS n_rating,
                    
            (
                SELECT AVG(rating) 
                FROM rating AS a
                WHERE r.recipeID = a.recipeID
                GROUP BY a.recipeID
            ) AS rating,

            (
                SELECT COUNT(u.recipeTagTypeID) / (
                    SELECT COUNT(*) 
                    FROM userlike
                    WHERE userID = ${uid}
                    GROUP BY userID
                )
                FROM recipetag AS rt
                INNER JOIN userlike AS u
                ON rt.recipeTagTypeID = u.recipeTagTypeID
                WHERE u.userID = ${uid} 
                AND r.recipeID = rt.recipeID
                GROUP BY recipeID
            ) AS tag_similarity

            FROM recipe AS r
            WHERE r.recipeID IN
            (
                SELECT recipeID
                FROM recipetag AS rt
                INNER JOIN userlike AS u
                ON rt.recipeTagTypeID = u.recipeTagTypeID
                WHERE u.userID = ${uid}
            )
            ORDER BY tag_similarity DESC
            LIMIT 5;
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },


        fetchMostFavRecipeByUserID: function() {
            var args = Array.from(arguments);            
            // create query
            var uid = args[0];
            var query = `
            SELECT 
            r.*,
            COUNT(*)  +  IF( (
            SELECT AVG(rating )
            FROM rating AS a
            WHERE r.recipeID = a.recipeID 
            GROUP BY a.recipeID
            ) IS NULL, 0, (
            SELECT AVG(rating )
            FROM rating AS a
            WHERE r.recipeID = a.recipeID 
            GROUP BY a.recipeID
            ) ) AS rate_of_fav,
            
            (
            SELECT COUNT(*) 
            FROM rating AS a
            WHERE r.recipeID = a.recipeID AND
            a.userID = ${uid}
            ) AS n_rating,
                
            (
            SELECT AVG(rating) 
            FROM rating AS a
            WHERE r.recipeID = a.recipeID AND
            a.userID = ${uid}
            GROUP BY a.recipeID
            ) AS rating
                
            FROM userbrowsehistory AS u
            JOIN recipe AS r
            ON r.recipeID = u.recipeID
            WHERE u.userID = ${uid}
            GROUP BY r.recipeID
            ORDER BY rate_of_fav DESC
            LIMIT 5
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        fetchRecipeIDBySimilarUserWithProfileAndGender: function() {
            var args = Array.from(arguments);            
            // create query
            var uid = args[0];
            var query = `
            SELECT l.userID, 
                COUNT(*) AS count_similar, 
                gender, 
                (SELECT gender FROM user WHERE userID = ${uid}) AS ref_gender,
                onDiet,
                (SELECT onDiet FROM user WHERE userID = ${uid}) AS ref_on_diet,
                age,
                (SELECT age FROM user WHERE userID = ${uid}) AS ref_age

            FROM userlike AS l
            INNER JOIN user AS u
            ON u.userID = l.userID
            WHERE recipetagtypeID IN(
            SELECT recipetagtypeID FROM userlike WHERE userID = ${uid}
            ) AND 
            l.userID != ${uid}
            GROUP BY userID
            ORDER BY count_similar DESC
            `;
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },

        updateById: function() {
            var args = Array.from(arguments);
            // create query
            var query = 'UPDATE recipe'
                + ' SET imageUrl = ?'
                + ' WHERE recipeID = ?';
            // return a promise object
            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, args, (error, res) => {
                    // return result
                    (error != null || (res.affectedRows || 0) < 1) ? reject({
                        code    : 500,
                        messages: [(error || {}).message || `failed.`]
                    }) : resolve(res.affectedRows);
                });
            });
        }
    };
    return model;
};