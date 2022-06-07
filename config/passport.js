const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const HttpResponse = require('es6-http-response');

const User = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, ((email, password, done) => {
  User.findOne({ email }).then((user) => {
    if (!user || !user.validPassword(password)) {
      return done(HttpResponse.Unauthorized('Incorrect login or password'), false);
    }

    return done(null, user);
  }).catch(done);
})));
