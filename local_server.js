/**
 * Created by Liraz Reichenstein on 15/05/2017.
 */


// needed to communicate with client
console.log("starting server...");
var io = require('socket.io').listen(1337);
console.log("server is running!");

// needed to work with files
var fs = require('fs');

// needed to encrypt stuff
var CryptoJS = require("crypto-js");

// the users file
const users = "users";

var user_socket = {};

function login(socket, data){
    console.log(data.user + " " + data.password + " login request");
    var content = fs.readFileSync('./' + users, 'utf8');
    var lines = content.split('\n');
    var i;
    for (i = 0; i < lines.length; i++){
        var details = lines[i].split(' ');
        if (data.user === details[0]){
            console.log("user " + data.user + " exists!");
            var key = data.password + details[1]; // given password + salt
            var hashed = CryptoJS.HmacSHA256(key, data.user).toString(CryptoJS.enc.Base64); // makes it harder
            if (hashed === details[2]){
                console.log("password accepted!");
                var fileName = CryptoJS.HmacSHA256(key, data.password).toString(); // hash it
                // should check here if modified!
                var d = fs.statSync("./" + fileName).mtime;
                if (details[3] !== CryptoJS.HmacSHA256(key, "" + d).toString()){
                    console.log("ERROR! Someone altered passwords file for a user!");
                    // console.log("when we find about error " + d + '\nin file: ' + details[3] + '\nOurs: ' + CryptoJS.HmacSHA256(key, "" + d).toString());
                    socket.emit('login_response', { response: 'signed in', salt: details[1], name: fileName, content: "problem" });
                    //content = "problem";
                }
                else { // success!!
                    if (user_socket[data.user]){
                        var sockets = user_socket[data.user];
                        sockets[sockets.length] = socket;
                        user_socket[data.user] = sockets;
                    }
                    else{
                        user_socket[data.user] = [socket];
                    }
                    // fs.writeFileSync('./' + fileName, data.Body.toString('utf-8'), 'utf8');
                    content = fs.readFileSync('./' + fileName, 'utf8');
                    socket.emit('login_response', { response: 'signed in', salt: details[1], name: fileName, content: content });
                }
                //socket.emit('login_response', { response: 'signed in', salt: details[1], name: fileName, content: content });
                return;
            }
            else{
                console.log("wrong password!");
                socket.emit('login_response', { response: 'wrong password' });
                return;
            }
        }
    }
    // if we got here, means we haven't found user in users file!
    console.log("user " + data.user + " does not exist!");
    socket.emit('login_response', { response: 'wrong user name' });
}

function register(socket, data){
    // should check if user name exists
    console.log(data.user + " " + data.password + " register request");
    var content = fs.readFileSync('./' + users, 'utf8');
    var lines = content.split('\n');
    var i;
    for (i = 0; i < lines.length; i++){
        var uname = lines[i].split(' ')[0];
        if (data.user === uname){
            console.log("user " + uname + " already exists!");
            socket.emit('register_response', { response: 'invalid user name' });
            return;
        }
    }
    // if we got here, means we haven't found user in users file!
    // console.log("user " + data.user + " does not exist!"); // should first add to users file
    // should write user name, salt, user name encrypted by pass+salt
    var salt = CryptoJS.lib.WordArray.random(16); // 16 random char salt
    var key = data.password + salt;
    var fileName = CryptoJS.HmacSHA256(key, data.password).toString(); // hash it
    fs.writeFileSync("./" + fileName, '', 'utf8');
    var mtime = fs.statSync("./" + fileName).mtime;
    // console.log("on register we wrote " + mtime);
    var hashed = CryptoJS.HmacSHA256(key, data.user).toString(CryptoJS.enc.Base64); // makes it harder
    var line = data.user + ' ' + salt + ' ' + hashed + ' ' + CryptoJS.HmacSHA256(key, "" + mtime).toString() + '\n';
    fs.appendFileSync('./' + users, line, 'utf8');
    // console.log("added to users: " + line);
    console.log(data.user + " registered successfully!");
    socket.emit('register_response', { response: data.user + ' registered' });
}

io.on('connection', function (socket) {

    socket.emit('server_ready', { need: 'request' });

    socket.on('login', function (data) {
        login(socket, data);
    });

    socket.on('register', function (data) {
        register(socket, data);
    });

    socket.on('update_server', function(data){
        // console.log("got: " + JSON.stringify(data));
        var salt;
        var fileContent = fs.readFileSync('./' + users, 'utf8');
        var c = fileContent.split('\n');
        var i;
        for (i = 0; i < c.length; i++) {
            var line = c[i].split(' ');
            if (line[0] === data.user) {
                // console.log(line);
                salt = line[1];
                break;
            }
        }
        var key = data.password + salt;
        var fileName = CryptoJS.HmacSHA256(key, data.password).toString(); // hash it
        // console.log('Updated ' + fileName); // + ':\n' + data.content);
        fs.writeFileSync("./" + fileName, data.content, 'utf8');
        var mod = fs.statSync("./" + fileName).mtime;
        fileContent = fs.readFileSync('./' + users, 'utf8');
        var content = fileContent.split('\n');
        var lines = [];
        for (i = 0; i < content.length; i++) {
            var line = content[i].split(' ');
            if (line[0] === data.user) {
                // console.log("this are key: " + key + " and mod: " + mod);
                line[3] = CryptoJS.HmacSHA256(key, "" + mod).toString();
            }
            lines[i] = line;
        }
        // console.log("on update we wrote " + mod);
        c = "";
        for (i = 0; i < lines.length; i++) {
            for (var j = 0; j < lines[i].length; j++) {
                c += lines[i][j] + " ";
            }
            c[c.length - 1] = "\n";
        }
        // console.log("This is what we write to users: " + c);
        fs.writeFileSync('./' + users, c, 'utf8');
        console.log('file ' + fileName + ' has been updated!');
        for (var s in user_socket[data.user]){
            if (s !== socket){
                s.emit("update_file", {content: data.content});
            }
        }
    });

    socket.on('delete_user', function(data){
        // should delete fileName and remove line from users! as well as close all available sockets for this user
        for (var s in user_socket[data.user]){
            s.emit("account_deleted", {});
        }
        delete user_socket[data.user]; // no more need in those sockets
        var salt;
        var fileContent = fs.readFileSync('./' + users, 'utf8');
        var c = fileContent.split('\n');
        var lines = [];
        var i, j = 0;
        for (i = 0; i < c.length; i++) {
            var line = c[i].split(' ');
            if (line[0] === data.user) {
                // console.log(line);
                salt = line[1];
            }
            else{
                lines[j++] = line;
            }
        }
        // we should write users
        c = "";
        for (i = 0; i < lines.length; i++){
            c += lines[i][0] + " " + lines[i][1] + " " + lines[i][2] + " " + lines[i][3] + "\n";
        }
        fs.writeFileSync('./' + users, c, 'utf8');
        // now we should remove file locally and from S3
        var key = data.password + salt;
        var fileName = CryptoJS.HmacSHA256(key, data.password).toString(); // hash it
        fs.unlinkSync('./' + fileName);
    });

    socket.on('sign_out', function(data){
        // data.user
        // should delete socket from user list
        user_socket[data.user].splice(user_socket[data.user].indexOf(socket), 1);
        if (user_socket[data.user].length === 0)
            delete user_socket[data.user];
    });

    socket.on('disconnect', function(reason){
        for (var usr in user_socket){
            if (user_socket[usr].indexOf(socket) > -1){
                user_socket[usr].splice(user_socket[usr].indexOf(socket), 1);
                if (user_socket[usr].length === 0)
                    delete user_socket[usr];
            }
        }
    });
});
