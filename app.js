require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const mongoose = require('mongoose');
const { notFoundEntrypoint, errorHandler } = require('./middlewares');
const routes = require('./routes');
const { isProduction, DB_URL, PORT } = require('./config');

// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: 'kitchen',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  }),
);

mongoose.connect(DB_URL);
mongoose.set('debug', !isProduction);

app.use('/api', routes);
app.use(notFoundEntrypoint);
app.use(errorHandler);

// Finally, let's start our server...
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${server.address().port}`);
});
