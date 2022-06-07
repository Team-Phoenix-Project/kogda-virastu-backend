const router = require('express').Router();
const { requireRole } = require('../../middlewares/index');
const auth = require('../auth');

router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));
router.use('/admin', auth.required, requireRole('admin'), require('./admin'));
router.use('/tags', require('./tags'));

router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errorType = Object.keys(err.errors)[0];
    // TODO throw error instead
    const statusCode = err?.errors[errorType]?.kind === 'unique' ? 409 : 400;
    return res.status(statusCode).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        // eslint-disable-next-line no-param-reassign
        errors[key] = err.errors[key].message;
        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
