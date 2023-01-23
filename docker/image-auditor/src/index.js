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
	const hours = d.getHours().toString().padStart(2, '0');;
	const minutes = d.getMinutes().toString().padStart(2, '0');;
	const seconds = d.getSeconds().toString().padStart(2, '0');;
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
const udpPort = config.PROTOCOL_PORT;
const multicast_address = config.PROTOCOL_MULTICAST_ADDRESS;

// ---------- UDP SERVER ----------
const dgram = require('dgram')
const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', (err) => {
	addLog(LogType.UDP, `Server error:\n${err.stack}`);
	udpSocket.close();
});

udpSocket.on('message', (msg, rinfo) => {
	addLog(LogType.UDP, `Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

udpSocket.on('listening', () => {
	const address = server.address();
	addLog(LogType.UDP, `Started UDP server for auditor on ${address}:${udpPort}`);
})

udpSocket.bind(udpPort, () => {
	udpSocket.addMembership(multicast_address);
});

// ---------- TCP SERVER ----------
const Net = require('net');
const tcpPort = 2205;

const server = new Net.Server();
server.listen(tcpPort, function () {
	addLog(LogType.TCP, `Started TCP server on port ${tcpPort}`);
});

// Listen to incoming request
server.on('connection', function (socket) {
	addLog(LogType.TCP, 'Connexion to client initiated');

	// Generate musicians array
	// TODO
	const musicians = [
		{
			"uuid": "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
			"instrument": "piano",
			"activeSince": "2016-04-27T05:20:50.731Z"
		},
		{
			"uuid": "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
			"instrument": "flute",
			"activeSince": "2016-04-27T05:39:03.211Z"
		}
	]

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
});
