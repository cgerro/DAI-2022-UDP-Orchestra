const config = require('../../config.js')
const UDP = require('dgram')
const musician = UDP.createSocket('udp4')
const { v4: uuidv4 } = require('uuid')

const port = config.PROTOCOL_PORT;
const multicast_address = config.PROTOCOL_MULTICAST_ADDRESS;

var args = process.argv.slice(2);
console.log(args);


/*
function makeNoise(instrument) {
    switch (instrument) {
        case 'flute':
            return "trulu"
        case 'drum':
            return "boum-boum"
        case 'piano':
            return "ti-ta-ti"
        case 'violin':
            return "gzi-gzi"
        case 'trumpet':
            return "pouet"
    }
}
*/

const instruments = {
    flute: "trulu",
    drum: "boum-boum",
    piano: "ti-ta-ti",
    violin: "gzi-gzi",
    trumpet: "pouet"
}

var instrument = instruments[args[0]];

function uuid() {
    return uuidv4();
}

const paquet = JSON.stringify({
    uuid: uuid(),
    instrument: instrument});


function send() {
    musician.send(paquet, port, multicast_address, (err) => {
        if (err) {
            console.error('Failed to send packet !!')
        } else {
            console.log('Sending paquet: ' + paquet + ' via port ' + musician.address().port);
        }
    })
}

const timeId = setInterval(send, 1000)


