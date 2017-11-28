var socket = io.connect('http://localhost:8080/');
var user = '';
var users_online = [];
window.onload = function () {
    $("#chat").css("display", "none");
    authUser().then(function(){
        $("#auth_form").css("display", "none");
        $("#chat").css("display", "block");
        user = JSON.parse(localStorage.getItem("user"));
        socket.emit("add user", user);
        return adminChat()
    }).then(function(users){
        printUserList(users, "users_list")
    });
    submitMessage = document.getElementById("submitMessage");
    submitMessage.onclick = subMessage;
    $("body").on("click","#users_list > li", function(){
        console.log($(this).attr("socket_id"));
        console.log($(this).attr("room"));
        socket.emit("get message list", {room: $(this).attr("room")});
        socket.on("view messages list", function(data){
            console.log(anyGlobalVariable=data);
            document.getElementById("messages").innerHTML = anyGlobalVariable.map(function(x){
                return `<li>${x.message}</li>`
            }).join("\n");
        });

        console.log("this dont funy");
        chooseRoom = {room:$(this).attr("room"), socket_id:$(this).attr("socket_id")};
    });

}


function printUserList(users, ulId){
    users_list = users.map(function(user){
        return `<li socket_id=${user.socket_id} room=${user.user_id }>${user.user_name}</li>`
    });
    users_list = users_list.join("\n");
    console.log(users);
    console.log(users_list);
    list =  document.getElementById("users_list");
    list.innerHTML = users_list

}

socket.on("get online users", function (data) {
    printUserList(data, "users_list");
});

function adminChat() {
    return new Promise(function(res, rej){
        socket.emit("online users");
        socket.on("get online users", function (data) {
            res(data);
        });
    })
}

function authUser(){
    return new Promise(function (rej, res) {
        if(localStorage.getItem("user") !== null)rej();
        submit_auth = document.getElementById("auth_btn");
        submit_auth.onclick = function(e){
            let user_id = document.getElementById("user_id").value;
            let user_name = document.getElementById("user_name").value;
            let user_telephone = document.getElementById("telephone").value;
            $.ajax({
                data: {
                    user_id, user_name, user_telephone
                },
                url: "/authOrRegister",
                method: "POST",
                success: function(data){
                    console.log(data);
                    localStorage.setItem("user", JSON.stringify({
                        user_id, user_name, user_telephone
                    }));
                    rej();
                }
            });

        }
    })

}



function subMessage(e){
    let messages = document.getElementById("messages");
    let inputMessage = document.getElementById("inputMessage");
    messages.innerHTML = messages.innerHTML +`<li>` + inputMessage.value +`</li>`;
    socket.emit("private message", {mess: inputMessage.value, socket_id:chooseRoom.socket_id});
    socket.on("my message",function(mess){
        messages.innerHTML = messages.innerHTML + `<li>${mess}</li>`;
    });
    socket.emit("post private message", {login: JSON.parse(localStorage.getItem("user")).user_id, message: inputMessage.value, room : chooseRoom});
    inputMessage.value = "";
}
