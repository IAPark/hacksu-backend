module.exports = {

  // Get app users (pretty self-explanatory, eh?)
  get_users: function(req, res){

    User.find().exec(function(err, users){

      var results = _(users).omit([
        'password', // Don't send back the user's password, even if though it's encrypted
      ]).values().value()

      res.json({
        'sucess': (err == null),
        'results': results
      })

    })

  }

};

