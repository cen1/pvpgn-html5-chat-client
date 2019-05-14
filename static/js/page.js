
function toast(text, index, duration) {  	
    $('.toast').hide();
    
    var toast_image_path = './static/images/error.png';
    
    if (index == 1) {
        toast_image_path = './static/images/message.png';
    }
    
    var toast_image = '<img width: 60%; max-width: 100%; height: auto; src="'+toast_image_path+'">';
    
    M.toast({html: text+' '+toast_image, displayLength: duration});
}

var pvpgn;
function sendMsg() {
    if (event.keyCode === 13) {
        var msg = $D('msg').value;
        $D('msg').value = "";
        Util.Debug("calling sendMsg('" + msg + "')");
        pvpgn.sendMsg(msg);
    }
}

function connect() {        	
    console.log("trying to connect");
    
    $D('connectButton').disabled = true; 
    var ret;
    ret  = pvpgn.connect($D('username').value,
                        $D('password').value,
                        $D('select-server').value,
                        $D('channel').value);
    if (! ret) { 
        toast('Connection failed', 0, 4000);
        $D('msg').disabled = true;
        $D('connectButton').disabled = false;
        $D('connectButton').value = "Login";
        $D('connectButtonWrap').style.display = 'block';
        var password_input = document.getElementById("password");
        password_input.addEventListener("keydown", function (e) {
            if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
                connect();
            }
        });

    }
}
function disconnect() {
    $D('connectButton').disabled = true;
    $D('login').style.display = 'block';
    $D('chatBox').style.display = 'none';
    $D('msg').style.display = 'none';
    $D('html').classList.remove("black");
    toast('Logged out', 1, 1000);
    pvpgn.disconnect();
}
function connected() {
    console.log("Connected");

    $D('login').style.display = 'none';
    $D('msg').disabled = false;
    $D('connectButton').disabled = false;
    $D('connectButtonWrap').style.display = 'none';
    $D('userlistBox').classList.remove("hide");
    $D('chatWindow').classList.remove("hide");
    $D('uiContainer').classList.remove("hide");

    $D('uiContainer').classList.remove("hide");
    $D('loginUIContainer').classList.add("hide");
}
function disconnected() {
    console.log("Disconected");

    $D('msg').disabled = true;
    $D('connectButton').disabled = false;
    $D('connectButton').value = "Login";
    $D('connectButtonWrap').style.display = 'block';
    var password_input = document.getElementById("password");
    password_input.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
            connect();
        }
    });

    $D('connectButton').onclick = connect;
    $D('exitButton').onclick = disconnect;
    $D('msg').style.display = 'none';
    $D('chatBox').style.display = 'none';
    $D('userlistBox').classList.add("hide");
    $D('chatWindow').classList.add("hide");
    $D('uiContainer').classList.add("hide");

    $D('uiContainer').classList.add("hide");
    $D('loginUIContainer').classList.remove("hide");
}
window.onload = function() {
    console.log("onload");
    var url = document.location.href;
    disconnected();
    
    $('#chatroom-ul').on('click', '.user-link', function(){
        $('#msg').val('/w '+$(this).text()+' ');
        $('#msg').focus();
        return false;
    });
    
    pvpgn = PVPGN('pvpgn', connected, disconnected, $D('username').value);
}