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
const config = require('./config.js')
const musician = require('./musician');

// ---------- UDP SERVER ----------
const dgram = require('dgram')
const udpSocket = dgram.createSocket('udp4');
// The musician map has the uuid for the key and the musician data as the body
// Example :
// uuid1 { instrument: "piano", "activeSince": "2023-01-30T17:45:13.874Z"}
// uuid2 { instrument: "flute", "activeSince": "2023-01-30T17:44:37.874Z"}
// ...
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
	addLog(LogType.UDP, `Server got data from ${rinfo.address}:${rinfo.port}`);
	const message = JSON.parse(msg);

	// Find instrument type of this musician based on the sound it makes
	let inferredInstrument;
	for([instrumentType, sound] of Object.entries(config.instruments)) {
		if (message.sound === sound) {
			inferredInstrument = instrumentType;
		}
	}
	if (!inferredInstrument) {
		console.error(`Instrument "${message.sound}" inconnu`);
		return;
	}

	// If the musician doesn't exist, add it to the list
	if (!musicians.has(message.uuid)) {
		musicians.set(message.uuid, {instrument: inferredInstrument, activeSince: new Date()});
		return;
	}

	// If the musician doesn't exist
	musicians.forEach((musicianData, uuid) => {
		if (uuid == message.uuid) {
			musicians.set(uuid, {instrument: inferredInstrument, activeSince: new Date()});
		}
	});
});

// Vérifie chaque seconde si un des musiciens n'est plus actif
setInterval(() => {
	musicians.forEach((musicianData, uuid) => {
		if (new Date() - musicianData.activeSince > config.timeout) {
			musicians.delete(uuid);
		}
	});
}, 1000);

udpSocket.on('listening', () => {
	const address = server.address();
	addLog(LogType.UDP, `Started UDP server for auditor on ${address}:${config.port}`);
});



// ---------- TCP SERVER ----------
const Net = require('net');
const TCP_PORT = 2205;

const server = new Net.Server();
server.listen(TCP_PORT, function () {
	addLog(LogType.TCP, `Started TCP server on port ${TCP_PORT}`);
});

// Listen to incoming request
server.on('connection', function (socket) {
	addLog(LogType.TCP, 'Connexion to client initiated');

	// When a client connects to TCP, send musician data
	const musiciansPayload = [];
	for (const [uuid, musicianData] of musicians) {
		musiciansPayload.push({
			uuid,
			instrument: musicianData.instrument,
			activeSince: musicianData.activeSince,
		});
	}

	socket.write(JSON.stringify(musiciansPayload));

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
