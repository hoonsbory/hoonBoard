module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test', {
        id: {
            /* column 속성들 */
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey : true, /* 여기까지 */
        }, 
        name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        tableName : 'test'
    });
}
