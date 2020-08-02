const { User, Upload } = require('../models');

User.sync({force: true});
Upload.sync({force: true});
