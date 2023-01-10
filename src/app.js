const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const session = require('express-session');
const httpStatus = require('http-status');
const methodOverride = require('method-override')
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const apiRoutes = require('./routes/v1');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Allows PUT and DELETE method in forms
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// Session configuration
app.set('trust proxy', 1)
app.use(session({
  key: 'spore.blog.session',
  secret: config.jwt.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // 30 days
    maxAge: 60 * 60 * 24 * 30 * 1000,
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
  },
}));

// Add flash messages
app.use(require('flash')());
// Clear flash on each request
app.get('/*', function(req, res, next) {
  req.session.flash = [];
  next();
});

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Static files
app.use(express.static('public'))
app.use('/data/uploads', express.static('data/uploads'))
app.get('/data/themes/:name/:name.css', (req, res) => {
  res.sendFile(`/data/themes/${req.params.name}/${req.params.name}.css`, { root: './' });
});

// testing
app.use('/api/v1', apiRoutes);
// v1 api routes
app.use('/v1', apiRoutes);
app.use('/', routes);

// send back a 404 error for any unknown request
app.use((req, res, next) => {
  // Render the 404 page
  res.status(404).render('pages/404', { title: '404' });
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;