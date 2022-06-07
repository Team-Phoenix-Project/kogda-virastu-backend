const crypto = require('crypto');
const mongoose = require('mongoose');
const HttpResponse = require('es6-http-response');

const randomString = (size = 64) => crypto.randomBytes(size).toString('base64').slice(0, size);

const InviteSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  issuer: { type: mongoose.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Types.ObjectId, ref: 'User' },
  used: { type: Boolean, default: false },
}, { timestamps: true });

InviteSchema.statics.issue = async function (userId) {
  const issuer = mongoose.Types.ObjectId(userId);
  const code = await randomString(128);
  const invite = await new this({ issuer, code }).save();
  return invite.toJSON();
};

InviteSchema.statics.canUse = async function (code) {
  const invite = await this.findOne({ code });
  if (!invite || invite.used) {
    throw HttpResponse.BadRequest(`Invite ${code || 'empty'} not found or used`);
  }
  return invite;
};

InviteSchema.methods.redeem = async function () {
  this.used = true;
  return (await this.save()).toJSON();
};

module.exports = mongoose.model('Invite', InviteSchema);
