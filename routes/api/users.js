const expressAsyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const Invite = require('../../models/Invite');

const User = mongoose.model('User');
const auth = require('../auth');

router.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

router.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401); }

    // only update fields that were actually passed...
    if (typeof req.body.user.username !== 'undefined') {
      user.username = req.body.user.username;
    }
    if (typeof req.body.user.email !== 'undefined') {
      user.email = req.body.user.email;
    }
    if (typeof req.body.user.bio !== 'undefined') {
      user.bio = req.body.user.bio;
    }
    if (typeof req.body.user.image !== 'undefined') {
      user.image = req.body.user.image;
    }
    if (typeof req.body.user.nickname !== 'undefined') {
      user.nickname = req.body.user.nickname;
    }
    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password);
    }

    return user.save().then(() => res.json({ user: user.toAuthJSON() }));
  }).catch(next);
});

router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(400).json({ errors: { email: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(400).json({ errors: { password: "can't be blank" } });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) { return next(err); }

    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
  })(req, res, next);
});

router.post('/users', expressAsyncHandler(async (req, res, next) => {
  const { invite: inviteCode } = req.body;
  // TODO: Refactor, use Joi instead
  if (!req.body.invite) {
    return res.status(400).json({ errors: { invite: "can't be blank" } });
  }

  const invite = await Invite.canUse(inviteCode);

  let user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  if (typeof req.body.user.nickname !== 'undefined') {
    user.nickname = req.body.user.nickname;
  }
  user = await user.save();
  await invite.redeem();
  return res.json({ user: user.toAuthJSON() });
}));

router.post('/user/invites/new', auth.required, expressAsyncHandler(async (req, res, next) => {
  const { id } = req.payload;
  const { code } = await Invite.issue(id);
  return res.json({ code });
}));

router.get('/user/invites', auth.required, expressAsyncHandler(async (req, res, next) => {
  const { id: issuer } = req.payload;
  const invites = await Invite.find({ issuer }, { code: 1, used: 1, createdAt: 1});
  return res.json({ invites, invitesCount: invites.length });
}));

module.exports = router;
