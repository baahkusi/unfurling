const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const globalErrorHandler = require('./controllers/error');
const AppError = require('./utils/appError');
const routes = require('./routes');

// Init express app
const app = express();

app.use(helmet());

app.use(morgan('combined'));

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use(limiter);

app.use(fileUpload());

// Body parser, reading data from body into req.body
app.use(express.json());

// 3) ROUTES
app.use(routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
