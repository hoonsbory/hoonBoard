// module.exports = (sequelize, DataTypes) => {
//   const Users = sequelize.define('users', {
//       id: {
//           /* column 속성들 */
//           type: DataTypes.STRING,
//           allowNull: false,
//           primaryKey : true, /* 여기까지 */
//       }, 
//       userName : {
//           type: DataTypes.STRING,
//           allowNull: false,
//       },
//       pw : {
//           type: DataTypes.STRING
//       }
//   }, {
//       timestamps: false,
//       tableName : 'users'
//   });
//   Users.associate = function (models) {
//     models.Users.hasMany(models.Posts, {
//       foreignKey: 'id',
//       onDelete: 'cascade',
//     });
//   };
//   return Users;
// }

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    id: {
      /* column 속성들 */
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true, /* 여기까지 */
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pw: {
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      get() {
        return moment.utc(this.getDataValue('createdAt')).format('YYYY/MM/DD h:mm');
      }
    },
  }, {
    timestamps: false,
    tableName: 'users'
  });
  //연관 관계 매핑
  users.associate = function (models) {
    models.users.hasMany(models.posts, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };
  users.associate = function (models) {
    models.users.hasMany(models.likes, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };
  users.associate = function (models) {
    models.users.hasMany(models.comments, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };
  users.associate = function (models) {
    models.users.hasMany(models.commentLikes, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };
  return users;
};