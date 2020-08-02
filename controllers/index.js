const {
  promisify
} = require('util');
const jwt = require('jsonwebtoken');
const {
  User,
  Upload
} = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');


const signToken = id => {
  return jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};


exports.login = catchAsync(async (req, res, next) => {

  const username = req.params.username;
  const password = req.params.password;

  // 1) Check if email and password exist
  if (!username || !password) {
    return next(new AppError('Please provide username and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({
    where: {
      username: username
    }
  });

  if (!user) {
    return next(new AppError('Username does not exist!', 400));
  }

  const is_authentic = await user.authenticate(password);

  if (!is_authentic) {
    return next(new AppError('Invalid username, password match!', 400))
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});


exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exist.',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});


exports.parse = catchAsync(async (req, res, next) => {


  let site = await axios.get('http://' + req.params.url);

  console.log('http://' + req.params.url);

  let $ = cheerio.load(site.data);

  res.status(200).json({
    title: $('title').text(),
    favicon: site.config.url + $('link[rel="icon"]').attr('href'),
    "large-image": $('meta[name="twitter:image"]').attr('content') || $('meta[property="og:image"]').attr('content'),
    snippet: $('meta[name="description"]').attr('content')
  })
});


exports.translate = catchAsync(async (req, res, next) => {

  res.status(200).send('<h1>Unimplemented</h1>')
});


exports.upload = catchAsync(async (req, res, next) => {

  if (!req.files) {
    res.status().json({
      msg: 'No file uploaded!'
    });
  }

  const file = Object.values(req.files)[0];

  let savePath = path.resolve(__dirname, '../uploads/' + file.name);

  console.log(savePath);


  console.log(file);

  const exists = await Upload.findOne( {where: {hash: file.md5 } });

  if(exists){
    res.status(400).json({
      msg: `File with Identifier ${file.md5} has already been uploaded.`
    })
  }

  file.mv(savePath, async function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    await Upload.create({path: savePath, hash: file.md5});

    res.status(200).json({
      msg: "File upload successful",
      identifier: file.md5
    });
  });

});


exports.download = catchAsync(async (req, res, next) => {

  const file = await Upload.findOne({where: {hash: req.params.identifier}})

  if(!file){
    res.status(400).json({
      msg: `File with Identifier ${req.params.identifier} does not exist on our servers.`
    })
  }

  res.download(file.path);
});
