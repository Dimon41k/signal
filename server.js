// подключение express и socket.io
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const express = require("express");
let {upsert, postMessage, getMessageList} = require("./models");
var bodyParser = require('body-parser')
var path = require('path');

var port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
/*app.post("/", function(req, res){
 console.log(req.body);
 });*/
// массив для хранения текущих подключений
var connections = [];
// массив для хранения текущих пользователей
var users = [];
// массив для хранения текущих сообщений
var messages = [];
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/authOrRegister", function(req, res){
    let user = req.body;
    obj = upsert({name: user.user_name, login: user.user_id, phone: user.user_telephone, role_id:2}, {login : user.user_id});
    res.end();
});


app.get('/:id', function (req, res) {
    if(req.params.id == 'signal_client.js') {
        res.sendFile(path.join(__dirname, 'signal_client.js'));
    }
});


server.listen(port, function() {
    console.log('app running on port ' + port);
});


io.on('connection', function (socket) {
    //console.log(socket.id);
    socket.on("disconnect", function(){
        users = users.filter(function(user){
            return socket.id !== user.socket_id;
        });
        io.sockets.emit("get online users", users);
        console.log(users);
    });
    socket.on("add user", function(user){
        user.socket_id = socket.id;
        users.push(user);
        io.sockets.emit("get online users", users);
        console.log(users);
    });

    socket.on("private message", function(data){
        io.to(data.socket_id).emit("my message", data.mess);
    });

    socket.on("online users", function(){
        socket.emit("get online users", users);
    });

    socket.on("post private message", function(data){
        let {login, message, room} = data;
        console.log(data);
        postMessage(login, room.room, message);
    });
    socket.on("get message list", function(data){
        let {room} = data;
        getMessageList(room).then(function(data){
            socket.emit("view messages list", data);
        });
    });

});