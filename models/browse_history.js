module.exports = (db) => {
    var model = {
        // getHistoryById: function() {
        //     var args = Array.from(arguments);            
        //     // create query
        //     var query = `
        //     SELECT
        //         *, COUNT?(*) AS totalRate
        //     FROM rating
        //     WHERE userID = ? 
        //     AND recipeID = ?
        //     `;
        //     // return a promise object
        //     return new Promise((resolve, reject) => {
        //         // get records from db
        //         db.query(query, args, (err, rows) => {
        //             // return result
        //             err != null ? reject({
        //                 code    : 500,
        //                 messages: [err.message]
        //             }) : resolve(rows);
        //         });
        //     });
        // },
        // updateHistoryById: function() {
        //     var args = Array.from(arguments);            
        //     // create query
        //     var query = `

        //     UPDATE rating SET rating=?
        //     WHERE userID = ? 
        //     AND recipeID = ?
        //     `;
        //     // return a promise object
        //     return new Promise((resolve, reject) => {
        //         // get records from db
        //         db.query(query, args, (err, rows) => {
        //             // return result
        //             err != null ? reject({
        //                 code    : 500,
        //                 messages: [err.message]
        //             }) : resolve(rows);
        //         });
        //     });
        // },
        createHistory: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            INSERT INTO
            userbrowsehistory
            (userID, recipeID)
            VALUES (?, ?)
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