



module.exports = {

"GET /rating": function(req, res) {

new Promise((resolve, reject) => {
  req.db.models.rating.getRatingByUserId(
    req.query.uid, req.query.rid
  ).then(rows => {
    if (rows.length) {
      resolve(rows)
    } else {
      reject('rating.not/found')
    }
  }).catch(reject)
})
.then((rows) => res.status(200).json({
    result  : true,
    data : {
      rows : rows.map(r =>({
        recipeID : r.recipeID,
        rating : r.rating
      })) ||[]
    }
}))
.catch(error => res.status(400).json({
  result: false,
  messages: error
}));
},


};
