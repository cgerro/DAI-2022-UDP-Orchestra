const Net = require('net');
const port = 8080;

const server = new Net.Server();
server.listen(port, function () {
	console.log(`Started musician on port ${port}`);
});

// Listen to incoming request
server.on('connection', function (socket) {
	console.log('Connexion to client initiated');

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
		console.log(`Data received from client, but ignored:\n${chunk.toString()}`);
	});

	socket.on('end', function () {
		console.log('Connexion to client terminated');
	});

	socket.on('error', function (err) {
		console.log(`Error: ${err}`);
	});
});