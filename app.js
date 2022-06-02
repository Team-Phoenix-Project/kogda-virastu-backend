const express = require('express');
const session = require('express-session');
const cors = require('cors');
const errorhandler = require('errorhandler');
const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(require('method-override')());

app.use(
  session({
    secret: 'kitchen',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  }),
);

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://kogda-virastu-mongodb:27017/kitchen');
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');

app.use(require('./routes'));

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');

  err.status = 404;
  next(err);
});

// / error handlers

/*
 * Development error handler
 * will print stacktrace
 */
if (!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

/*
 * Production error handler
 * no stacktraces leaked to user
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

// Finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
