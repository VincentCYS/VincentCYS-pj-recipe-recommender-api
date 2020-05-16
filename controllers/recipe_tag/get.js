

module.exports = {

  "GET /ingredients": function(req, res) {

    new Promise((resolve, reject) => {
      var ids = req.query.ids ? req.query.ids.split(',') : '';
      req.db.models.ingredient
        .fetchIngredient(
          ids
        )
        .then(rows => {              
          if (rows.length) {
            resolve(rows);
          } else {
            reject();
          }
        })
        .catch(reject);
    })

      .then((rows) =>
        res.status(200).json({
          result: true,
          data : {
              rows : [...rows]
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
  
};
