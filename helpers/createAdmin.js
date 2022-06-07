const mongoose = require('mongoose');
const { DB_URL } = require('../config');
require('../models/User');

const User = mongoose.model('User');
(async () => {
  await mongoose.connect(DB_URL);
  const email = 'admin@domain.com';
  const password = '123456';
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = new User({
      username: 'admin',
      email: 'admin@domain.com',
      nickname: 'admin',
      roles: ['user', 'admin'],
    });
    admin.setPassword(password);
    await admin.save();
  }
  console.log(`Use email = ${email} and password = ${password} to auth`);
  await mongoose.connection.close();
})();
