module.exports = (db) => {
    var model = {
     
        createSearchHistory: function() {
            var args = Array.from(arguments);   
            var uid = args[0];
            var keyword = args[1];
            var query = `INSERT INTO usersearchhistory (userID, keyword) VALUES (${uid}, '${keyword}' ); `;

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