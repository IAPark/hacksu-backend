module.exports = {

	// Endpoint for full user registration
	signup: function(req, res){

		var valid = true

		var ksu_id = req.param('ksu_id', false)

		if(ksu_id == false || String(ksu_id).length != 9 || isNaN(ksu_id)){ // Super duper basic KSU ID validation
			valid = false
			res.badRequest({ 'success': false, 'message': 'Invalid KSU ID' })
		}

		var first_name = req.param('first_name', false)
		var last_name = req.param('first_name', false)

		if(first_name == false || last_name == false){ // Make sure we're given first and last name (since the model doesn't directly validate this)
			valid = false
			res.badRequest({ 'success': false, 'message': 'Invalid name' })
		}

		var ksu_email = req.param('ksu_email', false)

		if(ksu_email == false){ // Make sure we're given a KSU email (since the model doesn't directly validate this)
			valid = false
			res.badRequest({ 'success': false, 'message': 'Invalid KSU email' })
		}

		var email = req.param('email', null) // Email is optional, so we don't have to do any param checking

		var password = req.param('password', false)

		if(password == false || password.length <= 6 || password.length >= 50){ // Make sure we're given a password (since the model doesn't directly validate this) and do some super basic length checks
			valid = false
			res.badRequest({ 'success': false, 'message': 'Invalid password' })
		}

		// TODO: Validate password strength with zxcvbn

		// TODO: Figure out if we want people to write their bios when they first sign up (gut says no because it would take a while)

		if(valid){

			var today = new Date()

			User.findOrCreate(
				{ ksu_id: String(ksu_id) },
				{
					ksu_id: String(ksu_id),
					account_type: 0, // We will update to 1 in the callback
					joined_hacksu: today,
					last_attended: null,
					meetings_attended_count: 0,
					meetings_attended: [],
					hackathons_attended_count: 0,
					hackathons_attended: []
				}
			).exec(function(err, user){

				user.account_type = 1
				user.first_name = first_name
				user.last_name = last_name
				user.ksu_email = ksu_email
				user.email = email
				user.new_password = password
				user.last_seen = today

				user.save(function(err){
					res.json({
						'success': (err == null)
					})
				})

			})

		}

	}

};

