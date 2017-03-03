/**
 * User.js
 *
 * @description :: The user/student model. It's sort of excessively verbose, but more is always better than less when it comes to models.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

module.exports = {

	attributes: {

	  	// Things we might want to store:
	  	// - Graduation date
	  	// - Photos for an about page (though we could probably just do {student_id}-{direction}.jpg or whatever)
	  	// - Social media info (Twitter/GitHub/LinkedIn/whatever) - though this should probably go in another model, this one has gotten messy

	  	account_type: { // Leaving this sort of nebulous allows us to implement a bunch of future logic without a whole lot of work right now
	  		type: 'integer',
	  		required: true,
	  		defaultsTo: 0

	  		// Current schema (TODO: formalize):
	  		// 0 - Student has scanned their ID card at a meeting, but never signed up for the online management app
	  		// 1 - Student has signed up for the online management app
	  		// 2 - Student is a member of HacKSU leadership
	  		// 3 - Student has graduated and is a past member of HacKSU
	  		// 99 - Student is an admin (basically god mode) 
	  	},

	  	first_name: { // First name (duh)
	  		type: 'string',
	  		minLength: 2,
	  		maxLength: 20
	  	},

	  	last_name: { // Last name (duh)
	  		type: 'string',
	  		minLength: 2,
	  		maxLength: 20
	  	},

	  	ksu_email: { // Kent email (just in case we ever need it)
	  		type: 'string',
	  		email: true,
	  		regex: /^\w+\@kent\.edu$/
	  	},

	  	email: { // Email for notifications, mailing lists, recruiter contacting, etc. Will fallback to ksu_email if no email is set.
	  		type: 'string',
	  		email: true

	  		// TODO: Fall back to KSU email if none set
	  	},

	  	ksu_id: { // Kent State student ID (for scanning Flashcard)
	  		type: 'string', // Technically this will only ever be an integer, but we don't need to index or do any ops on it, so string will be more efficient
	  		required: true,
	  		unique: true,
	  		minLength: 9,
	  		maxLength: 9
	  	},

	  	password: { // Login password for the management app (hashed, obviously)
	  		type: 'string',
	  		required: true,
			minLength: 6,
			maxLength: 50
	  	},

	  	bio: { // The student's self-written bio, with at least some formatting (maybe Markdown or something)
	  		type: 'longtext'
	  	},

	  	joined_hacksu: { // Date that student came to HacKSU for the first time
	  		type: 'date',
	  		required: true
	  	},

	  	last_attended: { // Date that student was most recently at HacKSU
	  		type: 'date'
	  	},

	  	last_seen: { // Date that the student most recently logged into the web app (useful for engagement tracking and such)
	  		type: 'datetime'
	  	},

	  	meetings_attended_count: { // Count of the Wednesday sessions this student has attended
	  		type: 'integer'
	  	},

	  	meetings_attended: { // A serialized array of dates that the student has attended HacKSU (in case we ever want to graph or whatever)
	  		type: 'array'
	  	},

	  	hackathons_attended_count: { // Count of hackathons the student has attended as a HacKSU member
	  		type: 'integer'
	  	},

	  	hackathons_attended: { // A serialized array of hackathon IDs that the student has attended... this is sort of a temporary way to store the info... if there is interest in expanding on this part of the app, it can be split into it's own schema
	  		type: 'array'
	  	},

	  	getEmail: function(){
	  		// Don't yell at me about shorthand if syntax; it's unfriendly to new programmers
	  		if(this.email == null){
	  			return this.ksu_email
	  		}
	  		else {
	  			return this.email
	  		}
	  	},

	  	getName: function(){
	  		return this.first_name + ' ' + this.last_name
	  	},

	  	verifyPassword: function(password) {
			return bcrypt.compareSync(password, this.password)
		},

		changePassword: function(newPassword, cb){

			this.new_password = newPassword

			this.save(function(err, u) {
				return cb(err, u)
			})

		}

	},

	beforeCreate: function(attrs, cb) {

		bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
			attrs.password = hash
			return cb()
		})

	},

	beforeUpdate: function(attrs, cb) {

		if(attrs.new_password){
			bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
				if(err){
					return cb(err)
				}

				bcrypt.hash(attrs.new_password, salt, function(err, crypted) {
					if(err){
						return cb(err)
					}

					delete attrs.new_password
					attrs.password = crypted

					return cb()
				})
			})
		}
		else {
			return cb()
		}

	}


};

