import sequelize from '../config/database.js';
import Product from './Product.js';
import Category from './Category.js';
import Carousel from './Carousel.js';
import User from './User.js';

// Relaciones Product <-> Category
Product.belongsTo(Category, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

Category.hasMany(Product, {
  foreignKey: 'categoria_id',
  as: 'productos'
});

// Exportar modelos y sequelize
export {
  sequelize,
  Product,
  Category,
  Carousel,
  User
};

export default {
  sequelize,
  Product,
  Category,
  Carousel,
  User
};