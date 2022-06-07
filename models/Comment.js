const mongoose = require('mongoose');
const { postState } = require('./types');

const CommentSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  state: { type: String, enum: postState, default: 'pending' },
}, { timestamps: true, usePushEach: true });

// Requires population of author
CommentSchema.methods.toJSONFor = function (user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    state: this.state,
    author: this.author.toProfileJSONFor(user),
  };
};

CommentSchema.methods.setState = function (state) {
  this.state = state;
  return this.save();
};

mongoose.model('Comment', CommentSchema);
