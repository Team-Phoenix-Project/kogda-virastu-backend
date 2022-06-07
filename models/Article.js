const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');

const User = mongoose.model('User');
const { PublishState } = require('./types');

const urlRegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:\/?#[\]@!$&'()*+,;=.]+$/;

const ArticleSchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  body: String,
  link: {
    type: String,
    validate: {
      validator: (v) => urlRegExp.test(v),
      message: 'Поле "link" должно быть валидным url-адресом.',
    },
  },
  favoritesCount: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  state: { type: String, default: 'pending', enum: PublishState },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, usePushEach: true });

ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' });

ArticleSchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ArticleSchema.methods.slugify = function () {
  // eslint-disable-next-line no-bitwise
  this.slug = `${slug(this.title)}-${(Math.random() * 36 ** 6 | 0).toString(36)}`;
};

ArticleSchema.methods.updateFavoriteCount = function () {
  const article = this;

  // eslint-disable-next-line no-underscore-dangle
  return User.count({ favorites: { $in: [article._id] } }).then((count) => {
    article.favoritesCount = count;

    return article.save();
  });
};

ArticleSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    link: this.link,
    state: this.state,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    // eslint-disable-next-line no-underscore-dangle
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user),
  };
};

ArticleSchema.methods.setState = function (state) {
  this.state = state;
  return this.save();
};

mongoose.model('Article', ArticleSchema);
