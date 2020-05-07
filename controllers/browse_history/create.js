
module.exports = {
  "POST /browse_history": function(req, res) {
    req.assert("uid", "uid.is.required").notEmpty();
    req.assert("rid", "rid.is.required").notEmpty();

    req
      .validate()
      .then(
        () =>
          new Promise((resolve, reject) => {
            req.db.models.browse_history
              .createHistory(req.body.uid, req.body.rid)
              .then(rows => {
               resolve()
              })
              .catch(reject);
          })
      )
      .then(
        () =>
          new Promise((resolve, reject) => {
            req.db.models.recipe_tag
              .fetchRecipeTagNumber(req.body.uid)
              .then(rows => {
                if (rows.length) {
                  resolve(rows);
                } else {
                  resolve()
                }
              })
              .catch(reject);
          })
      )

      .then(
        (data) =>
          new Promise((resolve, reject) => {
            if (data) {
              req.db.models.user_like
              .createUserLike(data)
              .then(rows => {
                if (rows) {
                  resolve();
                } else {
                  reject();
                }
              })
              .catch(reject);        
            } else {
              resolve()
            }
           
          })
      )

      .then(
        () =>
          new Promise((resolve, reject) => {
              req.db.models.user_like
              .deleteUserLike(req.body.uid)
              .then(rows => {
                resolve()
              })
              .catch(reject);        
          })
      )

      .then(() =>
        res.status(200).json({
          result: true
        })
      )
      .catch(error =>
        res.status(400).json({
          result: false,
          messages: error
        })
      );
  }
};
