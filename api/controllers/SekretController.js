/**
 * SekretController
 *
 * @description :: Private API controller. Probably could have a better name. Oh well.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment')

module.exports = {

	// Endpoint to hit with a user ID when they scan at a HacKSU meeting
	// TODO: Make this POST-only (leaving it as a GET for debug because appending ?ksu_id= is so easy)
	scan_flashcard: function(req, res){

		var pass = true

		var ksu_id = req.param('ksu_id', false)

		if(ksu_id == false || String(ksu_id).length != 9 || isNaN(ksu_id)){ // Super duper basic KSU ID validation
			pass = false
			res.badRequest({ 'success': false, 'message': 'Invalid KSU ID' })
		}

		var key = req.param('ksu_id', false)

		if(key != sails.config.sekret.key && sails.config.environment != 'development'){
			pass = false
			res.badRequest({ 'success': false, 'message': 'Invalid key' })
		}

		var today = new Date()

		if(pass){

			User.findOrCreate(
				{ ksu_id: String(ksu_id) },
				{
					ksu_id: String(ksu_id),
					account_type: 0,
					joined_hacksu: today,
					last_attended: today,
					meetings_attended_count: 0, // We will increment in the callback
					meetings_attended: [], // We will add today's date in the callback
					hackathons_attended_count: 0,
					hackathons_attended: []
				}
			).exec(function(err, user){

				var today_str = moment(today).format('YYYY-MM-DD')

				var meetings_attended = user.meetings_attended

				if (!_.includes(meetings_attended, today_str)){ // Make sure this user hasn't already swiped their card today
					user.meetings_attended_count = user.meetings_attended_count + 1
					user.meetings_attended.push(today_str)
				}

				user.save(function(err){
					res.json({
						'success': (err == null),
						'ksu_id': user.ksu_id,
						'meetings_attended_count': user.meetings_attended_count
					})
				})

			})

		}


	}

};

