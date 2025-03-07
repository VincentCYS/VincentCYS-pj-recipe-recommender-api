module.exports = (db) => {
    var model = {
     
        createUserTag: function() {
            var args = Array.from(arguments);   
            var uid = args[0];
            var tags = args[1];
            var query = '';
            tags.map(t => {
                query += `INSERT INTO userlike (userID, ingredientID) VALUES (${uid}, '${t}' ); `;
            });

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