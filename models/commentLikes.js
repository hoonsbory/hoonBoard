
module.exports = (sequelize, DataTypes) => {
  const moment = require('moment');
  
  const commentLikes = sequelize.define('commentLikes', {
    id: {
      type : DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    userId: DataTypes.STRING,
    commentId : DataTypes.INTEGER,
    createdAt: { 
      type: DataTypes.DATEONLY,
      get() {
        return moment.utc(this.getDataValue('createdAt')).format('YYYY-MM-DD hh:mm');
    }
    }
  }, {
      timestamps: false,
      tableName : 'commentLikes'
  });
  commentLikes.associate = function (models) {
    commentLikes.belongsTo(models.comments, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  commentLikes.associate = function (models) {
    commentLikes.belongsTo(models.users, {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return commentLikes
}
