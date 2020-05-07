


var Sentiment = require('sentiment');
var sentiment = new Sentiment();

module.exports = {

"GET /comment": function(req, res) {

new Promise((resolve, reject) => {
    var result = sentiment.analyze('I cut all of the seasonings in half, added 1/2 tblsp ground flax seed. I used garlic powder instead of garlic salt. I also didn\'t add the salt. it turned out pretty good. I wish I would of made the hamburger bottom really thin because while cooking it shrank and got twice as thick as it started. I used premium grass fed ground beef, there wasn\'t much grease it just grew. I have to say 2 days later it did taste alot better than when I made it.');
    console.log(result);
    
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
