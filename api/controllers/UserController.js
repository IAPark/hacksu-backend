/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// Endpoint for full user registration
	signup: function(req, res){

		var ksu_id = req.param('ksu_id', false)

		if(ksu_id == false || String(ksu_id).length != 9 || isNaN(ksu_id)){ // Super duper basic KSU ID validation
			res.badRequest({ 'success': false, 'message': 'Invalid KSU ID' })
		}

		var first_name = req.param('first_name', false)
		var last_name = req.param('first_name', false)

		if(first_name == false || last_name == false){ // Make sure we're given first and last name (since the model doesn't directly validate this)
			res.badRequest({ 'success': false, 'message': 'Invalid name' })
		}

		var ksu_email = req.param('ksu_email', false)

		if(ksu_email == false){ // Make sure we're given a KSU email (since the model doesn't directly validate this)
			res.badRequest({ 'success': false, 'message': 'Invalid KSU email' })
		}

		var email = req.param('email', null) // Email is optional, so we don't have to do any param checking

	}

};

