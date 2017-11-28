const {sequelize, Sequelize} = require("./connection");

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING
    },
    login: {
        type: Sequelize.STRING,
        unique: true
    },
    role_id: {
        type: Sequelize.INTEGER,
    },
    phone: {
        type: Sequelize.STRING
    }

});

const Message = sequelize.define('message', {
    login: {
        type: Sequelize.STRING,
        references: {
            model: User,
            key: "login"
        }
    },
    room:{
        type:Sequelize.STRING
    },
    message: {
        type: Sequelize.TEXT
    }
});

// force: true will drop the table if it already exists
// Table created
User.sync({force: false}).then(() => {
    User.create({
        name: 'admin',
        role_id: 1,
        phone : "+380501002505",
        login: "admin"
    });
    return Message.sync({force: false});
}).then(function(){console.log("all fine");});

module.exports = {
    upsert(values, condition) {
    return User
        .findOne({ where: condition })
        .then(function(obj) {
            if(obj) { // update
                return obj.update(values);
            }
            else { // insert
                return User.create(values);
            }
        });
    },
    postMessage(login, room, message) {
        Message.create({login: login, room: room, message: message });
    },
    getMessageList(room){
        return Message.findAll({where:{room :room}});
    }
}



