# PvPGN HTML5 Chat Client
An HTML5 chat client for PvPGN servers. Uses Materialize CSS and Websockify.

## How it works
Websockify can act as a bridge from a websocket to a network socket.

This means the web client opens a websocket to your webserver, then websockify proxies that connection to the PvPGN server's telnet port.

PvPGN sees all the connections as coming from the webserver, not the actual end-user, which is important to keep in mind. If your PvPGN server limits the number of connections from a single IP, the HTML5 chat client may only be able to serve a few clients at a time unless you change PvPGN configuration.

## Installation Insructions
### Install Websockify
```
apt-get install websockify
```

### Run Websockify
```
websockify -v 33333 some.pvpgn.server.net:6112
```

### Run pvpgn-html5-chat-client
This project is a static HTML/JavaScript web page so just put the whole folder on some HTTP server.
All settings can be changed in `js/config.js`.

## TODO
Client currently does not initiate a real telnet chat protocol but some weird text chat protocol. 0x03 payload is missing from initial connection and a proper telnet chat protocol parser is missing. With a rewrite it will be possible to show proper server icons in channel.