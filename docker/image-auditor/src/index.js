require('colors')
const LogType = {
	TCP: 'TCP',
	UDP: 'UDP',
};

const getCurrentDateString = () => {
	const d = new Date();
	const year = d.getFullYear();
	const month = (d.getMonth()+1).toString().padStart(2, '0');
	const day = d.getDate().toString().padStart(2, '0');
	const hours = d.getHours().toString().padStart(2, '0');
	const minutes = d.getMinutes().toString().padStart(2, '0');
	const seconds = d.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const addLog = (type, message) => {
	let msg = `${getCurrentDateString()} [${type}] ${message}`;
	switch (type) {
		case 'TCP': msg = msg.cyan; break;
		case 'UDP': msg = msg.magenta; break;
	}
	console.log(msg);
};

// ---------- LOAD CONFIG ----------
const config = require('../../config.js')
const musician = require('./musician');

// ---------- UDP SERVER ----------
const dgram = require('dgram')
const udpSocket = dgram.createSocket('udp4');
let musicians = new Map();

udpSocket.bind(config.port, () => {
	console.log("Joining multicast group");
	udpSocket.addMembership(config.address);
});

udpSocket.on('error', (err) => {
	addLog(LogType.UDP, `Server error:\n${err.stack}`);
	udpSocket.close();
});

udpSocket.on('message', (msg, rinfo) => {
	var message = JSON.parse(msg);

	let trouve = false;
	musicians.forEach((value, key, map) => {
		if(key.uuid == message.uuid) {
			musicians.set(key, Date.now());
			trouve = true;
		}
	});

	if(!trouve) {
		let instrument;
		for([key, val] of Object.entries(config.instruments)) {
			if(val == message.instrument) {
				instrument = key;
				break;
			}
		}
		musicians.set(new musician.Musician(message.uuid, instrument, new Date()), Date.now());
	}
});

// Vérifie chaque seconde si un des musiciens n'est plus actif
setInterval(() => {
	musicians.forEach((value, key, map) => {
		if(Date.now() - value > config.timeout) {
			musicians.delete(key);
		}
	});
}, 1000);

udpSocket.on('listening', () => {
	const address = server.address();
	addLog(LogType.UDP, `Started UDP server for auditor on ${address}:${udpPort}`);
});



// ---------- TCP SERVER ----------
const Net = require('net');
const TCP_PORT = 2205;

const server = new Net.Server();
server.listen(TCP_PORT, function () {
	addLog(LogType.TCP, `Started TCP server on port ${tcpPort}`);
});

// Listen to incoming request
server.on('connection', function (socket) {
	addLog(LogType.TCP, 'Connexion to client initiated');

	// When a client connects to TCP, send musician data
	socket.write(JSON.stringify(musicians));

	// Ignore client data
	socket.on('data', function (chunk) {
		addLog(LogType.TCP, `Data received from client, but ignored:\n${chunk.toString()}`);
	});

	socket.on('end', function () {
		addLog(LogType.TCP, 'Connexion to client terminated');
	});

	socket.on('error', function (err) {
		addLog(LogType.TCP, `Error: ${err}`);
	});

	socket.end();
	
});
