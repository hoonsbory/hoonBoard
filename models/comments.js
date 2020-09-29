
module.exports = (sequelize, DataTypes) => {
  const moment = require('moment');
  
  const comments = sequelize.define('comments', {
    id: {
      type : DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    userId: DataTypes.STRING,
    postId: DataTypes.INTEGER,
    content : DataTypes.STRING,
    parentChild : DataTypes.STRING,
    groupId : DataTypes.INTEGER,
    delete : DataTypes.BOOLEAN,
    createdAt: { 
      type: DataTypes.DATEONLY,
      get() {
        return moment.utc(this.getDataValue('createdAt')).format('YYYY-MM-DD hh:mm');
    }
    }
  }, {
      timestamps: false,
      tableName : 'comments'
  });
  comments.associate = function (models) {
    comments.belongsTo(models.posts, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  comments.associate = function (models) {
    comments.belongsTo(models.users, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  comments.associate = function (models) {
    models.users.hasMany(models.commentLikes, {
      foreignKey: 'commentId',
      onDelete: 'cascade',
    });
  };
  return comments
}
