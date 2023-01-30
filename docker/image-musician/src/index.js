const config = require('../../config.js')
const UDP = require('dgram')
const musician = UDP.createSocket('udp4')
const { v4: uuidv4 } = require('uuid')


if (process.argv.length != 3) {
    console.log('Invalid number of arguments ! Exit the programm...')
    process.exit()
}
else if(!(process.argv[2] in config.instruments)) {
    console.log('Invalid instrument ! Exit the programm... ')
    process.exit()
}


var args = process.argv.slice(2);
console.log(args);

var instrument = config.instruments[args[0]];


const paquet = JSON.stringify({
    uuid: uuidv4(),
    sound: instrument
});


function send() {
    musician.send(paquet, config.port, config.address, (err) => {
        if (err) {
            console.error('Failed to send packet !!')
        } else {
            console.log('Sending paquet: ' + paquet + ' via port ' + musician.address().port);
        }
    })
}

setInterval(send, 1000);


