# Red Tetris

Creating a multi-player tetris using node react and socket io.

### Tutorials followed

Channel: Weibenfalk
1.https://www.youtube.com/playlist?list=PL0jpcQ5lO0nEH2BpPmJhePz_urgyAljFB

Channel: Meth Meth Method
2.https://www.youtube.com/watch?v=H2aW5V46khA&t=112s
3.https://youtu.be/JJo5JpbuTTs
4.https://youtu.be/Zdr6SJZC9ao


### Install

Requires [node](https://nodejs.org/en/).Install it, After that run:

```
$ npm install
```

To install all it's needed dependencies.

To run the app, you need to run both the server side and client side, using 2 different terminals

#### Launch Server Side

Type:
```
$ npm run  start-server
```

It launches a node.js server listening for socket.io connections, that is wired to receive `ping` messages and answered to … `pong`.

#### Launch Client Side

Type:

```
$ npm run start-client
```
It shoulld start the React development build, which should auto open a link to the React localhost.
Namely http://localhost:3000/

#### How to launch multiplayer

The app uses a hash based url to get a unique room, and the player name. It then creates a socket room in which a maximum of 4 players can join, by using the url with the same room name.
The url format is "http://localhost:3000/#RoomName[PlayerName]", for example:

```
http://localhost:3000/#room1[koketso]
```

Enjoy playing red tetris (0_0)/