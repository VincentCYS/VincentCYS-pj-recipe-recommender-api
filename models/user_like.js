module.exports = (db) => {
    var model = {
        getUserLike: function() {
            var args = Array.from(arguments);   
            var query = `
                SELECT *
                FROM userlike;
            `;
            

            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, '', (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        createUserLike: function() {
            var args = Array.from(arguments);   
            var query = `
                INSERT INTO userlike (userID, recipetagtypeID)
                VALUES
                ${args[0].map(a => 
                    `('${a.userID}', '${a.recipeTagTypeID}')`
                )}
            `;
            

            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, '', (err, rows) => {
                    // return result
                    err != null ? reject({
                        code    : 500,
                        messages: [err.message]
                    }) : resolve(rows);
                });
            });
        },
        deleteUserLike: function() {
            var args = Array.from(arguments);   
            var query = `
                DELETE FROM userlike
                WHERE userID = ?
                AND
                LENGTH(userLikeID) > 10
                ORDER BY userLikeID
                LIMIT 1
            `;
            

            return new Promise((resolve, reject) => {
                // get records from db
                db.query(query, '', (err, rows) => {
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