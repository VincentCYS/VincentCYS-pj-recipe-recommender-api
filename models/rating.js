module.exports = (db) => {
    var model = {
        getRatingById: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT
			*, 
            IFNULL (
                ( 
                    SELECT COUNT(*) AS totalRate 
                    FROM rating 
                    WHERE userID = ? AND recipeID = ?
                    GROUP BY recipeID
                )
            , 0) AS totalRate
            FROM rating AS a 
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
        getRatingByUserId: function() {
            var args = Array.from(arguments);     
            var uid = args[0];     
            var rid = args[1];
            // create query
            var query = `
            SELECT
			*, 
            IFNULL (
                ( 
                    SELECT COUNT(*) AS totalRate 
                    FROM rating 
                    WHERE userID = ${uid} AND recipeID = ${rid}
                    GROUP BY recipeID
                )
            , 0) AS totalRate
            FROM rating AS a
            WHERE a.userID = ${uid}
            AND a.recipeID = ${rid}
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
        getRating: function() {
            var args = Array.from(arguments);     
            var uid = args[0];     
            // create query
            var query = `
            SELECT
			*
            FROM rating AS a
            WHERE a.userID = ${uid}
            ORDER BY ratingID DESC, rating DESC 
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
        updateRatingById: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `

            UPDATE rating SET rating=?
            WHERE userID = ? 
            AND recipeID = ?
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
        createRating: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            INSERT INTO
            rating
            ( rating, userID, recipeID)
            VALUES (?, ?, ?)
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
    };
    return model;
};