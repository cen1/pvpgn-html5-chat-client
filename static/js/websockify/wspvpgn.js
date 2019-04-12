/*
 * WebSockets PvPGN client
 * by rchase
 * https://github.com/reillychase/pvpgn_html5_chat_client
 */
 
 var chat_style_whisper = '"color: #00eb00"';
 var chat_style_server = '"color: #84dbff"';
 var chat_style_gold = '"color: #efc710"';
 var chat_style_basic = '"color: #ffffff"';
 var chat_style_error = '"color: #ff0000"';
 var chat_style_admin = '"color: #42aaf7"';

function PVPGN(target, connect_callback, disconnect_callback, username) {

var that = {},  // Public API interface
    ws, sQ = [],
    in_channel = [],
    chatroom = '',
    state = "unconnected",
    in_channel = [];


Array.prototype.pushStr = function (str) {
    var n = str.length;
    for (var i=0; i < n; i++) {
        this.push(str.charCodeAt(i));
    }
}

function do_send() {
    if (sQ.length > 0) {
        Util.Debug("Sending " + sQ);
        ws.send(sQ);
        sQ = [];
    }
}

function do_recv() {
    console.log(">> do_recv");
    var rQ, rQi, i;

    while (ws.rQlen() > 1) {
        rQ = ws.get_rQ();
        rQi = ws.get_rQi();
        for (i = rQi; i < rQ.length; i++) {
            if (rQ[i] === 10) {
                break;
            }
        }
        if (i >= rQ.length) {
            // No line break found
            break;
        }
        recvMsg(ws.rQshiftStr((i-rQi) + 1));
    }

}

function updateUserlist(in_channel) {
	chatroom = '';
	for (var i = 0; i < in_channel.length; i++) {
 		addToUserlist(in_channel[i]);
	}
}

function getUserIcon(user) {
	if (user == 'la-dota' || user == 'lagabuse.com') {
		return 'bnet-blizzard';
	}
	
	return 'bnet-war3x';
}

function isAdmin(user) {
	if (user == 'la-dota' || user == 'lagabuse.com') {
		return true;
	}
	
	return false;
}

function addToUserlist(new_user) {

	//Icon to be displayed next to username
	
	var icon = getUserIcon(new_user);
	
	var iconPath = '"static/icons/'+icon+'.bmp"';
	
	//Border
	
	var borderClass = 'user-wrap-general';
	
	if (isAdmin(new_user)) {
		borderClass = 'user-wrap-admin';
	}
	
	
	//Add icon + username as list item to userlist
	
	chatroom = chatroom + 
	'<li>' +
	'<div class="user-wrap '+borderClass+'">' +
		'<div class="user-icon-container">' +
			'<img class="user-icon-image" src='+iconPath+'>' +
		'</div>' +
		'<a href="#">' + escapeHtml(new_user) + '</a>' +
		'<div class="user-icon-helper"></div>' +
	'</div>' +
	'</li>'
}

// Handle a PVPGN message
function recvMsg(msg) {
    var empty = 0;
    var flag = 1;
    var not_whisper = 1;
    Util.Debug(">> recvMsg");

    // All the regex we want to catch coming from the server to the client

    unicode_catch_regex = /\\([0-9][0-9][0-9])/g;
    unicode_catch = unicode_catch_regex.exec(msg)


    if (unicode_catch != null) {

      result = msg.match(unicode_catch_regex);
      for(var i=0; i<result.length; ++i){
        charToReplace = result[i].toString();
        charCode = parseInt(result[i].toString().replace(/\\(.)/mg, "$1"));
        console.log(charCode)
        msg = msg.replace(charToReplace, String.fromCharCode(parseInt(charCode, 8)))
      }

    }

    whisper_to_regex = /^\<to (.*)\> (.*)/g;
    whisper_to = whisper_to_regex.exec(msg)

    whisper_from_regex = /^\<from (.*)\> (.*)/g;
    whisper_from = whisper_from_regex.exec(msg)

    broadcast_regex = /^Broadcast: (.*)/g;
    broadcast = broadcast_regex.exec(msg)

    no_bot_regex = /^Account has no bot access/g;
    no_bot = no_bot_regex.exec(msg)

    failed_regex = /^Login failed/g;
    failed = failed_regex.exec(msg);

    empty_regex = /^\r\n$/g;
    empty2 = empty_regex.exec(msg);

    success_regex = /^Your unique name/g;
    success = success_regex.exec(msg);

    password_regex = /^Password/g;
    password2 = password_regex.exec(msg);

    username_regex = /^Username/g;
    username2 = username_regex.exec(msg);

    sorry_regex = /^Sorry, there is no guest account/g;
    sorry = sorry_regex.exec(msg);

    enter_regex = /^Enter your account name/g;
    enter = enter_regex.exec(msg);

    bot_regex = /^BOT or Telnet Connection from/g;
    bot = bot_regex.exec(msg);
    
    is_here_regex = /^\[(.*) is here\]/g;
    is_here = is_here_regex.exec(msg);

    enters_regex = /^\[(.*) enters\]/g;
    enters = enters_regex.exec(msg);

    leaves_regex = /^\[(.*) leaves\]/g;
    leaves = leaves_regex.exec(msg);

    joining_channel_regex = /^Joining channel: (.*)/g;
    joining_channel = joining_channel_regex.exec(msg);

    quit_regex = /^\[(.*) quit\]/g;
    quit = quit_regex.exec(msg);

    kicked_regex = /^\[(.*) has been kicked\]/g;
    kicked = kicked_regex.exec(msg);

    banned_regex = /^\[(.*) has been banned\]/g;
    banned = banned_regex.exec(msg);

    chat_regex = /^<(.*)> (.*)/g;
    chat = chat_regex.exec(msg);

    error_regex = /^ERROR: (.*)/g;
    error = error_regex.exec(msg);

    // Catch all to turn anything that didn't match a regex into a yellow msg from server
    if (whisper_to == null && whisper_from == null && success == null && failed == null && joining_channel == null && empty2 == null && username2 == null && password2 == null && bot == null && sorry == null && enter == null && chat == null && is_here == null && banned == null && enters == null && error == null && leaves == null && quit == null && kicked == null) {
      new_msg = '<span style='+chat_style_server+'>' + escapeHtml(msg) + '</span>'
      writeToChannel(new_msg);
      flag = 0;
    }

    // Catch all for messages that should be ignored and not sent to chatroom
    if (username2 != null || password2 != null || sorry !=null || bot != null || enter != null || empty2 != null) {
      flag = 0;
    }

    if (whisper_to != null) {
      new_msg = '<span style='+chat_style_gold+'>You whisper to ' + unescape(escapeHtml(whisper_to[1])) + ': </span><span style='+chat_style_whisper+'> ' + unescape(escapeHtml(whisper_to[2])) + '</span>'
      writeToChannel(new_msg);
      whisper_to = whisper_to_regex.exec(msg);
      flag = 0;
      not_whisper = 0;
    }

    if (whisper_from != null) {
      new_msg = '<span style='+chat_style_gold+'>' + unescape(escapeHtml(whisper_from[1])) + ' whispers: </span><span style='+chat_style_whisper+'> ' + unescape(escapeHtml(whisper_from[2])) + '</span>'
      writeToChannel(new_msg);
      whisper_from = whisper_from_regex.exec(msg);
      flag = 0;
      not_whisper = 0;
    }

    // What to do when all other regexes are seen
    while (success != null) {
      $D('login').style.display = 'none';
      $D('pvpgn').style.display = 'block';
      $D('msg').style.display = 'block';
      $D('connectButtonWrap').style.display = 'none';
      $D('html').classList.add("black");
      toast('Connected!', 1, 1000);
      success = success_regex.exec(msg);
      flag = 0;
    };

    while (failed != null) {
      $D('login').style.display = 'block';
      $D('connectButton').disabled = false;
      $D('pvpgn').style.display = 'none';
      $D('msg').style.display = 'none';
      $D('html').classList.remove("black");
      toast('Login failed!', 0, 4000);
      failed = failed_regex.exec(msg);
      that.disconnect();
      flag = 0;
    };

    while (no_bot != null) {

      $D('login').style.display = 'block';
      $D('connectButton').disabled = false;
      $D('pvpgn').style.display = 'none';
      $D('msg').style.display = 'none';
      $D('html').classList.remove("black");
      toast("PvPGN server blocked telnet", 0, 4000);
      no_bot = no_bot_regex.exec(msg);
      that.disconnect();
      flag = 0;
    };

    while (chat != null) {
      if (not_whisper == 1) {
      new_msg = '<span style='+chat_style_gold+'>' + escapeHtml(chat[1]) + ': </span><span style='+chat_style_basic+'> ' + unescape(escapeHtml(chat[2])) + '</span>'
      writeToChannel(new_msg);
      }
      chat = chat_regex.exec(msg);
      flag = 0;
    };

    while (is_here != null) {

      addToUserlist(is_here[1]);

      in_channel.push(is_here[1]);

      is_here = is_here_regex.exec(msg);

      flag = 0;
    };

    while (enters != null) {
    
      addToUserlist(enters[1]);

      in_channel.push(enters[1]);

      enters = enters_regex.exec(msg);

      flag = 0;
    };
    while (kicked != null) {

      var index = in_channel.indexOf(kicked[1]);

      if (index > -1) {
        in_channel.splice(index, 1);
      }

     updateUserlist(in_channel);

      kicked = kicked_regex.exec(msg);

      flag = 0;
    };
    while (banned != null) {

      var index = in_channel.indexOf(banned[1]);

      if (index > -1) {
        in_channel.splice(index, 1);
      }

      updateUserlist(in_channel);

      banned = banned_regex.exec(msg);

      flag = 0;
    };
    while (leaves != null) {

      var index = in_channel.indexOf(leaves[1]);

      if (index > -1) {
        in_channel.splice(index, 1);
      }

      updateUserlist(in_channel);

      leaves = leaves_regex.exec(msg);

      flag = 0;
    };
    while (quit != null) {

      var index = in_channel.indexOf(quit[1]);

      if (index > -1) {
        in_channel.splice(index, 1);
      }

      updateUserlist(in_channel);

      quit = quit_regex.exec(msg);

      flag = 0;
    };

    while (joining_channel != null) {

      chatroom = ''

      in_channel = [];

      new_msg = '<span style='+chat_style_basic+'>Joining channel: </span><span style='+chat_style_gold+'>' + escapeHtml(joining_channel[1]) + '</span>'
      writeToChannel(new_msg);
      joining_channel = joining_channel_regex.exec(msg);

      flag = 0;
    };

    while (error != null) {

      new_msg = '<span style='+chat_style_error+'>' + escapeHtml(error[1]) + '</span>'
      writeToChannel(new_msg);
      error = error_regex.exec(msg);

      flag = 0;
    };

    while (broadcast != null) {

      new_msg = '<span style='+chat_style_admin+'>' + escapeHtml(broadcast[1]) + '</span>'
      writeToChannel(new_msg);
      broadcast = broadcast_regex.exec(msg);

      flag = 0;
    };

    $D("chatroom-ul").innerHTML = chatroom;
    // Show raw received
    if (flag == 1) {
        writeToChannel(escapeHtml(msg));
    }

}

function writeToChannel(msg) {

    msgLog.push(msg);
    var full_list = ""
    for(var i=0; i<msgLog.length; ++i){
          full_list = full_list + msgLog[i] + "<br>"
    }
    
    var chatbox = $D("pvpgn");

    chatbox.innerHTML = full_list;
   	chatbox.scrollTop = chatbox.scrollHeight;
    //window.scrollTo(0,document.body.scrollHeight);

}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function sendCmd(msg) {
    Util.Info("Sending: " + msg);
    sQ.pushStr(msg + "\r\n");
    do_send();
}
that.sendMsg = function(msg) {
    var write = 1;
    is_command_regex = /^\//g;
    is_command = is_command_regex.exec(msg);

    while (is_command != null) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
      is_command = is_command_regex.exec(msg);
      write = 0;
    };

    if (write == 1) {
      writeToChannel('<span style='+chat_style_gold+'>' + username + ': </span><span style='+chat_style_basic+' > ' + escapeHtml(msg) + '</span>')
    }
    sendCmd(msg);
}


that.connect = function(username, password, server, channel) {
    var host = 'xpam.pl',
        port = 33333,
        username = username,
        password = password,
        channel = channel,
        clientTag = '',
        scheme = "ws://", uri;
    
    if (channel == '') {
    	channel = 'w3';
    }
    //Port is the websockify instance to connect to
    if (server == 'server.eurobattle.net') {
      port = '33333';
      clientTag = 'W3XP'
    }
    Util.Debug(">> connect");
    if (ws) {
        ws.close();
    }

    uri = scheme + host + ":" + port;
    console.log("connecting to " + uri);

    ws.open(uri, subprotocols=["binary", "base64"])
    sendCmd("\r\n");
    sendCmd(username);
    sendCmd("\r\n");
    sendCmd(password);
    sendCmd("\r\n");
    sendCmd("/join " + channel);
    sendCmd("\r\n");
    Util.Debug("<< connect");
    return true;
}

that.disconnect = function() {
    Util.Debug(">> disconnect");
    if (ws) {
        ws.close();
    }
    $D('login').style.display = 'block';
    $D('connectButton').disabled = false;
    $D('pvpgn').style.display = 'none';
    $D('msg').style.display = 'none';
    $D('html').classList.remove("black");
    $D("pvpgn").innerHTML = '';
    disconnect_callback();
    Util.Debug("<< disconnect");
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function constructor() {
    /* Initialize Websock object */
    ws = new Websock();

    ws.on('message', do_recv);
    ws.on('open', function(e) {
        Util.Info(">> WebSockets.onopen");
        state = "connected";
        msgLog = [];
        username =  $D('username').value;
        sendCmd("\r\n");
        connect_callback();
        Util.Info("<< WebSockets.onopen");
    });
    ws.on('close', function(e) {
        Util.Info(">> WebSockets.onclose");
        that.disconnect();
        Util.Info("<< WebSockets.onclose");
    });
    ws.on('error', function(e) {
        Util.Info(">> WebSockets.onerror");
        that.disconnect();
        Util.Info("<< WebSockets.onerror");
    });

    return that;
}

return constructor(); // Return the public API interface

} // End of Telnet()
