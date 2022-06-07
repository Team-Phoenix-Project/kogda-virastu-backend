const router = require('express').Router();
const api = require('./api');

router.use('/v1', api);
router.use(api);

module.exports = router;
