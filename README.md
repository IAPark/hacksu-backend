# hacksu

I had some free time so I started putting together some concepts that I thought would be interesting to explore. My main thinking is that we could improve HacKSU engagement by better tracking who is coming to the meetings, why, and what they'd like to see. The barrier to entry on something like HacKSU can be pretty high, especially for non-technical people, so I think having as many tools in place to ease the process will really help. I'm also a nerd and like building tools, so I could just be crazy.

I really like Node.js and Sails, and think it's a great framework to work with, but if people want to switch to another language/framework, I'm more than happy to do that as well. The logic can be transposed to another language in an hour or so.

The app is just API and websocket endpoints because I am god-awful at anything frontend. As far as I know, Sails' websockets stuff makes it super easy to do realtime stuff with React/Angular/whatever, but I could be totally crazy.

If you guys think this is unnecessary, no worries, just let me know. I literally only built this because I had a bit of free time and figured it would be a step in the right direction, but I totally won't be offended if you all tell me it's dumb.

## Basic Flow

The thinking was that most students would come to a HacKSU meeting, scan their Flashcard, and that would be how we get them into the DB. I confirmed that Flashcards have super easy to access student IDs in their track data, so a simple client app can just sit on whoevers' system with a cheap USB magstripe reader POSTing to the API. My magstripe reader has no Unix drivers, so I just bought a cheap-o $15 off Amazon that theoretically simulates a USB keyboard (which would mean our client app could be web-hosted and there would never be any software to install... rad!)

The simple client app would just listen for magstripe swipes, parse out the student ID, and POST to `/sekret/scan_flashcard` with `ksu_id` (the student's user ID) and `key` (whatever "secret" value is set in config.sekret). Worth noting that `key` is only checked in production.

If the student already has an account, it will increment their meeting count and log the meeting date to the DB (which will be useful for engagement tracking and such).

If the student doesn't have an account, it will create a "partial" account. These "partial" accounts totally work for tracking "user ID 123 has been to 4 meetings on these days" but there's no way to turn those student IDs into actual student info.

The way we do this is be encouraging everyone to go home to the HacKSU website and sign up for a "full" account. This would allow us to get student names, emails, etc. and link it to the meetings and hackathons they come to. It also gives us an avenue to do voting on session topics, some sort of "show off what I've been working on" space, a place for people to put resumes/social media so that we can connect them with recruiters, etc.

The signup endpoint is a POST to `/users/signup` with the following params:
`ksu_id`: **Required** The student's Kent state ID (which is how we link flashcards to full user accounts)
`first_name`: **Required** The student's first name (duh)
`last_name`: **Required** The student's last name (duh)
`ksu_email`: **Required** This will be super useful in the future if we ever start working directly with Kent State and they give us access to some private endpoint to connect with Flashline... I know they use the [username]@kent.edu as a primary key in a bunch of places, so it can't hurt for us to have. Also a good way to make sure we have at least 1 email on file for every student.
`email`: **Optional** The student's personal email. This is what we'll default to sending notification/recruiter/whatever emails to, since some people don't use their KSU emails.
`password`: **Required** In _theory_ we could hit a Flashline auth endpoint directly and allow students to just auth with their Flashline credentials, but I'd definitely want to talk to the Flashline team before implementing that. Also seems like a security nightmare... no way to verify that creds aren't being stored in plaintext in transit.

Both endpoints are setup such that the will gracefully update/create where needed... this means that if somebody goes to the site and creates and account before they scan their Flashcard at a meeting, it's no big deal, and when they do come to a meeting, that will get logged in their existing account. Same vice versa.

# User model

I tried to document it as much as possible in the actual code, but I figure explaining my rationale for each attribute is probably a good idea...

`account_type`: This isn't a huge deal, but will be a huge help if we decide to really dig into this and do different account-types/permissions/etc. It's also an easy way to quickly find out how many people we have who have "partial" accounts vs. "full" accounts, quickly add admin checks, etc.

`first_name` and `last_name`: Pretty self-explanatory. Worth pointing out that we have a `.getName()` function that we should use instead of accessing the attributes directly in case we ever need to add in support for i18n and such. Not a big deal now, but why not save the refactoring headache and do it right from the start.

`ksu_email`: I explained my thinking on this one in the basic flow explanation above... seems silly not to have it on file.

`email`: Again better explained up above. Worth noting that `.getEmail()` function that we should use instead of accessing the attributes directly so we're not writing our own case-by-case logic on which email to use. See my note on refactoring (I hate refactoring).

`password`: This is **hashed with bcrypt** and **not a plaintext password**... at no point does it ever actually store to our database as a plaintext password. This isn't the 90s, plaintext passwords should never be tolerated, even on tiny projects like this. Make sure you use the `.verifyPassword("Plaintext Password")` and `.changePassword("New Password")` instead of writing to the attributes directly. As a general rule, this should never ever return to views. I'll have to look into if Sails/Waterline does protected attributes itself, or if we have to write our own filtering logic.

`bio`: This isn't anything yet, but it will be. I'm thinking give people a little place to talk about who they are, what they're interested in, etc. would be really rad, so if you're considering coming to a meeting, you can go to the HacKSU webapp, look around, and see there are people interested in the same stuff you are. This could also be a great place for people to pitch themselves to recruiters, especially if we add in social media links and such.

`joined_hacksu`: Pretty self-explanatory, the date/time that the user first scanned their Flaschard or signed up for the online site, whichever comes first. Both the endpoints above take care of this.

`last_attended`: The date/time that the user last scanned their Flashcard at a HacKSU meeting. Good for analytics.

`last_seen`: The date/time the user last logged into the HacKSU webapp. Good for analytics.

`meetings_attended_count`: A count of the number of meetings the user has attended, regardless of their account status.

`meetings_attended`: A serialized JSON array of dates (in YYYY-MM-DD format) that the user has attended... obviously at some point we can break this out into it's own model that can be queried directly, but for now it's important to just collect the data. We can always convert an array of dates into whatever future model we use, but we can't create a future model without having any data on file.

`hackathons_attended_count`: A count of the number of hackathons the user has attended, regardless of their account status.

`hackathons_attended`: Identical format/thinking to my thoughts on `meetings_attended` (serialized array until we expand it out to be more)

# Admin

I think having an admin panel where we can look at how many people are attending the lessons, update the lesson schedule, send out reminder emails, etc. is a really important part of this app. I am totally unqualified to build anything with a UI, so that will definitely be up to somebody else.

For basic prototyping, I quickly made a `/admin/get_users` endpoint, but that's obviously just a start. I think we need to better discuss functionality before diving into the admin side of things, since that takes a bit more planning.