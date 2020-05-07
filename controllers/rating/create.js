



module.exports = {
  "POST /rating": function(req, res) {

    req.assert('uid', 'uid.is.required').notEmpty();
    req.assert('rid', 'rid.is.required').notEmpty();
    req.assert('rating', 'rating.is.required').notEmpty();

  req.validate()
  .then(() => new Promise((resolve, reject) => {
    req.db.models.rating.getRatingByUserId(
      req.body.uid, req.body.rid
    ).then(rows => {
      if (rows.length) {
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(reject)
  }))

  .then((exist) => new Promise((resolve, reject) => {
    if (exist) {
      req.db.models.rating.updateRatingById(
        req.body.rating, req.body.uid, req.body.rid
      ).then(rows => {  
        if (rows.affectedRows) {
          resolve(true)
        } else {
          reject(false)
        }
      }).catch(reject);
    } else{
      req.db.models.rating.createRating(
        req.body.rating, req.body.uid, req.body.rid
      ).then(rows => {  
        if (rows.insertId) {
          resolve(true)
        } else {
          reject(false)
        }
      }).catch(reject)
    }

  }))


  .then(() => res.status(200).json({
      result  : true,
  }))
  .catch(error => res.status(400).json({
    result: false,
    messages: error
}));
},


};
