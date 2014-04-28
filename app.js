//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();
//load environment variables
var dotenv = require('dotenv');
dotenv.load();

//fbgraph
var graph = require('fbgraph');

//twit
var twit = require('twit');

//twitter oauth
var passport = require('passport');
var util = require('util');
var passportTwitterStrategy = require('passport-twitter').Strategy;

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
//more setting up configuration for express
//Allows cookie access and interaction
app.use(express.cookieParser() );
app.use(express.session({ secret: 'nyan cat'}));
//Intialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

//routes
app.get('/', function(req,res) { 
	res.render("index");
});

//fbgraph authentication
app.get('/auth/facebook', function(req, res) {
	if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
			'client_id': process.env.fb_appid,
			'redirect_uri': 'http://letsgetsocialagain.herokuapp.com/auth/facebook',
			'scope': 'user_about_me, user_likes, user_friends'//you want to update scope to what you want in your app
		});

		if (!req.query.error) {
			res.redirect(authUrl);
		} else {
			res.send('access denied');
		}
		return;
	}
	graph.authorize({
		'client_id': process.env.fb_appid,
		'redirect_uri': 'http://letsgetsocialagain.herokuapp.com/auth/facebook',
		'client_secret': process.env.fb_appsecret,
		'code': req.query.code
	}, function( err, facebookRes) {
		res.redirect('/facebook/homepage');
			// /UserHasLoggedIn');
	});
});

app.get('/facebook', function(req, res) {
	// graph.get('/me', function(err, response) {
		//console.log(response);
	// 	console.log(err); //if there is an error this will return a value
	// 	data = { facebookData: response};
		graph.get('/me/friends', function(err, response) {
		//data = {};
		var data = [];
		// console.log(response);
		function increment(i) {

		var tempJSON = {};
		graph.get("/me/mutualfriends/" + response.data[i].id, function(err2, response2) {

		if(i < 11) {
			var str = response.data[i].name;
			// console.log(str);
			tempJSON.posts = response2.data.length;
			tempJSON.name = str.substr(0, str.indexOf(' '));
			//tempJSON.posts = response2.data.length;
			data.push(tempJSON);
			increment(i+1);
		  }
		  else {
		  	console.log(data);
		  	res.json(data);
		  }
		});
	 }
	increment(0);
	});
		//res.render('facebook');
			// , data);
	// });
});

app.get('/facebook/homepage', function(req, res) {
	res.render('facebook');
	// graph.get('/me/friends', function(err, response) {
	// 	data = {};
	// 	var data = [];
	// 	// console.log(response);
	// 	function increment(i) {

	// 	var tempJSON = {};
	// 	graph.get("/me/mutualfriends/" + response.data[i].id, function(err2, response2) {
	// 	if(i < 12) {
	// 		var str = response.data[i].name;
	// 		// console.log(str);
	// 		tempJSON.posts = response2.data.length;
	// 		tempJSON.name = str.substr(0, str.indexOf(' '));
	// 		tempJSON.posts = response2.data.length;
	// 		data.push(tempJSON);
	// 		increment(i+1);
	// 	  }
	// 	  else {
	// 	  	console.log(data);
	// 	  	res.json(data);
	// 	  }
	// 	});
	// }
	// increment(0);
	// });
});

//twitter authentication Oauth setup
//this will set up twitter oauth for any user not just one
// app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
// 	//nothing here because callback redirects to /auth/twitter/callback
// });

//callback. authenticates again and then goes to twitter
// app.get('/auth/twitter/callback', 
// 	passport.authenticate('twitter', { failureRedirect: '/' }),
// 	function(req, res) {
// 		res.redirect('/twitter');
// 	});


// app.get('/twitter', ensureAuthenticated, function(req, res) {
// 	//I can use twitterOauth as previously it's an array set up with the correcet information
// 	var T = new twit(twitterOauth); 
// 	T.get('/friends/list', function (err, reply) {
// 		console.log(err); //If there is an error this will return a value
// 		data = { twitterData: reply };
// 		res.render('twitter', data);
// 	});
// });

//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});