const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      index: true,
    },
    nickname: String,
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [250, 'max length 250 symbols'],
    },
    image: String,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      default: []
      },
    ],
    followingUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followingTags: [
      {
        type: String
      },
    ],
    hash: String,
    salt: String,
  },
  { timestamps: true, usePushEach: true },
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');

  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
};

UserSchema.methods.generateJWT = function () {
  const today = new Date(),
    exp = new Date(today);

  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000, 10),
    },
    secret,
  );
};

UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image,
    nickname: this.nickname,
  };
};

UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    nickname: this.nickname,
    bio: this.bio,
    image:
      this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false,
    followingTags: user.followingTags,
  };
};

UserSchema.methods.favorite = function (id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function (id) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function (id) {
  return this.favorites.some(
    (favoriteId) => favoriteId.toString() === id.toString(),
  );
};

UserSchema.methods.follow = function (id) {
  if (this.followingUsers.indexOf(id) === -1) {
    this.followingUsers.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollow = function (id) {
  this.followingUsers.remove(id);
  return this.save();
};

UserSchema.methods.followTag = function (id) {
  if (!this.followingTags.includes(id)) {
    this.followingTags.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollowTag = function (id) {
  this.followingTags.remove(id);
  return this.save();
};


UserSchema.methods.isFollowing = function (id) {
  return this.followingUsers.some(
    (followId) => followId.toString() === id.toString(),
  );
};

UserSchema.methods.isFollowingTag = function (id) {
  return this.followingTags.includes(id);
};

mongoose.model('User', UserSchema);
