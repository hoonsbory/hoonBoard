
// module.exports = (sequelize, DataTypes) => {
//   const moment = require('moment');
  
//   return sequelize.define('posts', {
//     postId: {
//       type : DataTypes.INTEGER,
//       primaryKey: true,
//       allowNull: false,
//       autoIncrement: true,
//       unique: true
//     },
//     content: DataTypes.STRING,
//     title: DataTypes.STRING,
//     userId: DataTypes.STRING,
//     updatePost: { 
//       type: DataTypes.DATEONLY,
//       get() {
//         return moment.utc(this.getDataValue('updatePost')).format('YYYY/MM/DD h:mm');
//     }
//     },
//     thumbnail: DataTypes.STRING,
//     views: DataTypes.INTEGER
//   }, {
//       timestamps: false,
//       tableName : 'posts'
//   });
// }

module.exports = (sequelize, DataTypes) => {
  const moment = require('moment');
  const posts = sequelize.define('posts', {
    postId: {
      type : DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    description : DataTypes.STRING,
    content: DataTypes.STRING,
    title: DataTypes.STRING,
    userId: DataTypes.STRING,
    updatePost: { 
      type: DataTypes.DATEONLY,
      get() {
        return moment.utc(this.getDataValue('createdAt')).format('YYYY-MM-DD hh:mm');
    }
    },
    thumbnail: DataTypes.STRING,
    views: DataTypes.INTEGER
  }, {
      timestamps: false,
      tableName : 'posts'
  });
  posts.associate = function (models) {
    posts.belongsTo(models.users, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: true,
      },
    });
  };
  posts.associate = function (models) {
    models.posts.hasMany(models.likes, {
      foreignKey: 'postId',
      onDelete: 'cascade',
    });
  };
  posts.associate = function (models) {
    models.posts.hasMany(models.comments, {
      foreignKey: 'postId',
      onDelete: 'cascade',
    });
  };
  return posts;
};