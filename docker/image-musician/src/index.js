// 1 récupérer l'argument passer en paramètre

// créer un socket udp

// faire une fonction qui s'appelle chaque seconde et qui affiche un msg

var args = process.argv.slice(2);
console.log(args);

var instrument = args[0];

const config = require('../../config.js')

const UDP = require('dgram')
const musician = UDP.createSocket('udp4')

const port = config.PROTOCOL_PORT;
const multicast_address = config.PROTOCOL_MULTICAST_ADDRESS;

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

const packet = Buffer.from(makeNoise(instrument))

function send() {
    musician.send(packet, port, multicast_address, (err) => {
        if (err) {
            console.error('Failed to send packet !!')
        } else {
            console.log('Packet send !!')
        }
    })
}

const timeId = setInterval(send, 1000)
