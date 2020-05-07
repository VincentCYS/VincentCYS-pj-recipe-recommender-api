

module.exports = {

  "GET /recipe_tag": function(req, res) {

    new Promise((resolve, reject) => {
      var ids = req.query.ids ? req.query.ids.split(',') : '';
      req.db.models.recipe_tag
        .fetchRecipeTag(
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
