module.exports = (db) => {
    var model = {
        login: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT
                *
            FROM user AS u 
            WHERE u.userName = ? 
            AND u.password = ?
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
        fetchUserProfile: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT
                *, (SELECT r.* 
                    FROM recipe AS r 
                    JOIN userbrowsehistory as b    
                    ON r.recipeID = b.recipeID
                )
            
            FROM user AS u 
            WHERE u.userID = ? 
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
        fetchUserByUsername: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT
                *
            FROM user
            WHERE username = ? 
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
        register: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            INSERT INTO user (username, password, gender, age, onDiet)
            VALUES (?, ?, ?, ?, ?)
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
       
        fetchSimilarUserByTags: function() {
            var args = Array.from(arguments);
            var uid = args[0];
            // create query
            var query = `
                SELECT   b.userID, COUNT(b.userID) AS count

                FROM userlike AS a
                INNER JOIN userlike AS b
                ON b.recipeTagTypeID = a.recipeTagTypeID
                WHERE a.userID = ${uid} AND
                b.userID != ${uid}
                GROUP BY b.userID
                ORDER BY count DESC
                LIMIT 1
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
        // updateById: function() {
        //     var args = Array.from(arguments);
        //     // create query
        //     var query = 'UPDATE `shops`'
        //         + ' SET ?'
        //         + ' WHERE `shop_id` = ?';
        //     // return a promise object
        //     return new Promise((resolve, reject) => {
        //         // get records from db
        //         db.query(query, args, (error, res) => {
        //             // return result
        //             (error != null || (res.affectedRows || 0) < 1) ? reject({
        //                 code    : 500,
        //                 messages: [(error || {}).message || `failed.`]
        //             }) : resolve(res.affectedRows);
        //         });
        //     });
        // }
    };
    return model;
};