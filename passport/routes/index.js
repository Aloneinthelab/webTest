var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport');
var Account = require('../model/account');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler 
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()){
    return next();
  // if the user is not authenticated then redirect him to the login page
  }else{
  	res.redirect('/');
  }
}


  router.get('/', function (req, res) {
    res.render('index.html', { user : req.user });
  });
  router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
  });
  router.get('/signup', function(req, res) {
    res.render('signup.html', { user : req.user });
  });
  router.get('/profile',isAuthenticated, function(req, res) {
    res.render('profile.html', { user : req.user });
  });
  
  router.post('/signup', function(req, res) {
    Account.register(new Account({ username : req.username }), req.password, function(err, account) {
        if (err) {
        	console.log(err);
            //return res.render('login', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
  });

  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  module.exports = router;


