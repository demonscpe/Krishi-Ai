const express = require('express');
const { validateAccessToken } = require('../../middleware/auth0.middleware');
const { syncProfile } = require('./auth0.controller');

const router = express.Router();

router.post('/profile', validateAccessToken, syncProfile);

module.exports = router;
