module.exports = (db) => {
    var model = {
     
        createRecipeTag: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            INSERT INTO recipetagtype  (recipeTagTypeName) VALUES('breakfast'),('sauce'),('condiment'),('vegetable'),('fruit'),('meat'),('cooking fat'),('spice or herb'),('sugar'),('nut'),('dessert'),('pasta dish'),('soup'),('grain'),('drink'),('dairy'),('fat and vitamins'),('pasta'),('bread'),('poultry'),('spicy'),('cheese'),('seafood'),('vegetable dish')
        
            `;
            args[0].replaceAll('\\', '')
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
        fetchRecipeTag: function() {
            var args = Array.from(arguments);            
            // create query
            var query = `
            SELECT * FROM recipetagtype
            ${args[0] ? 'WHERE recipetagtypeName IN (?)' : ''};        
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

        fetchRecipeTagNumber: function() {
            var args = Array.from(arguments);    
            // create query
            var query = `
            SELECT  h.userID, t.recipeTagTypeID, COUNT(*) AS num
            FROM recipetag AS t

            INNER JOIN userbrowsehistory AS h
            ON t.recipeID = h.recipeID
            INNER JOIN recipetagtype AS r
            ON r.recipeTagTypeID = t.recipeTagTypeID
            WHERE userID = ? AND 
            r.recipeTagTypeID NOT IN (
                SELECT recipeTagTypeID 
                FROM userlike
                WHERE userID = h.userID
            )
            GROUP BY r.recipeTagTypeID
            HAVING num >= 5
            LIMIT 10 
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