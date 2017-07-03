# Node server for my password keeper for chrome

This is the code which currently runs on my Amazon AWS EC2 instance. It is used by my [Password Keeper for chrome](https://github.com/Lagogo25/Password-keeper-for-chrome).

This is my code, though you won't be able to run it yourself as it depends on my AWS credentials (which hopefuly you don't have... ;))

**If you wish to run the server locally yourself (and not just take a look on my implementation) you should run local_server.js**

**Make sure to make the appropriate changes in background.js of the extension to run locally.**

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To use this extension you need to install [node.js](https://nodejs.org/en/download/) technology from the link or follow this tutorial:

<big><pre>
https://nodejs.org/en/download/package-manager/
</pre></big>

Afterwards you should be able to use npm and install those packages:

Crypto-js:
```
npm install crypto-js
```
AWS-SDK:
```
npm install aws-sdk
```
Socket.io:
```
npm install socket.io --save
```

### Installing

```
git clone https://github.com/Lagogo25/node_server.git
```
And run the desired server.

## Contributing

At the moment this is an indepent project made mostly for school and private usage.
If one wishes to contribute to the project/server, please contact me by mail: *lagogo@gmail.com*.

## Authors

* **Liraz Reichenstein** - *Full project* - [Lagogo25](https://github.com/Lagogo25)

See also the list of [contributors](https://github.com/Lagogo25/Password-keeper-for-chrome/contributors) who participated in this project.

## License

All code in here is written by me. I put a lot of effort writing this so please don't be rude, if you are using it, please give some credit. (Of course all code beside the one in the imported scripts)

## Acknowledgments

* Great thanks to [Evan Vosberg](https://github.com/brix) and his great Crypto library for javascript: [Crypto-JS](https://github.com/brix/crypto-js) 
* The people of [Socket.io](https://github.com/socketio/socket.io)
* A special thanks to my proffesor, [Dr. Itai Dinur](http://oldweb.cs.bgu.ac.il/faculty/person/dinuri.html) for the idea and guidance along the way.
