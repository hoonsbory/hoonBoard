
module.exports = (sequelize, DataTypes) => {
  const moment = require('moment');
  
  const likes = sequelize.define('likes', {
    id: {
      type : DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    userId: DataTypes.STRING,
    postId: DataTypes.INTEGER,
    updatedAt: { 
      type: DataTypes.DATEONLY,
      get() {
        return moment.utc(this.getDataValue('createdAt')).format('YYYY-MM-DD hh:mm');
    }
    }
  }, {
      timestamps: false,
      tableName : 'likes'
  });
  likes.associate = function (models) {
    likes.belongsTo(models.posts, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  likes.associate = function (models) {
    likes.belongsTo(models.users, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return likes
}
