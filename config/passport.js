var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// регистрация
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    // validate fields
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        })
        return done(null, false, req.flash('error', messages));
    }

    // check if email exists in the database
    User.findOne({ 'email': email }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, { message: 'Email is already in use.' });
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

// вход
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    // validate fields
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        })
        return done(null, false, req.flash('error', messages));
    }

    // check if email exists in the database
    User.findOne({ 'email': email }, (err, user) => {
        if (err) {
            return done(err);
        }
        // ifuser wasn't found in database
        if (!user) {
            return done(null, false, { message: 'No user found.' });
        }
        // function, defined in user.js
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Wrong password.' });
        }
        // if everything is successful, return done with NO error and retrieved user
        return done(null, user);
    });
}));