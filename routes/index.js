const express = require('express');

const router = express.Router();

const controller = require('../controllers');

router.get('/login/:username/:password', controller.login);
router.get('/parse/:url', controller.protect, controller.parse);
router.get('/translate/:url', controller.protect, controller.translate);
router.get('/download/:identifier', controller.protect, controller.download);
router.post('/upload', controller.protect, controller.upload);

module.exports = router;
