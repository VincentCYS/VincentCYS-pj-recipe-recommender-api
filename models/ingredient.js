module.exports = (db) => {
    var model = {

        fetchIngredient: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT * FROM ingredient
            ORDER BY RAND()
            LIMIT 30     
            `
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
        fetchIngredientTag: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT * FROM ingredient
            ${args[0].length ? 'WHERE ingredientName IN (?)' : ''}
            ORDER BY RAND()
            ;        
            `
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