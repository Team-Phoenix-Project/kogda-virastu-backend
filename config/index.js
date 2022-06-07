const { NODE_ENV = 'development', MONGODB_URI = 'mongodb://kogda-virastu-mongodb:27017/kitchen', SECRET, PORT = 3000 } = process.env;
const isProduction = NODE_ENV === 'production';

module.exports = {
  secret: isProduction ? SECRET : 'secret',
  isProduction,
  PORT,
  DB_URL:isProduction ? MONGODB_URI : 'mongodb://localhost:27017/kitchen'
};
