const { Model, DataTypes } = require('sequelize');
const argon2 = require('argon2');
const db = require('./../db');

class User extends Model {
    async authenticate(password) {
        if (await argon2.verify(this.password, password)) {
            return true;
        } else {
            return false;
        }
    }
    
    async hashPass(password) {
        const pwdHash = await argon2.hash(password);
        return pwdHash;
    }
}

User.init({
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
    }
},{
    sequelize: db,
    timestamps: true
});


class Upload extends Model {}

Upload.init({
    path: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    hash: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
},{
    sequelize: db,
    timestamps: true
})


module.exports = {User, Upload};
