/*
 * Our application protocol specifies the following default multicast address and port
 */

const PROTOCOL_MULTICAST_ADDRESS = "239.255.22.5";
const PROTOCOL_PORT = 9907;
const PROTOCOL_MUSICIAN_TIMEOUT = 5000;

const INSTRUMENTS = {
    flute: "trulu",
    drum: "boum-boum",
    piano: "ti-ta-ti",
    violin: "gzi-gzi",
    trumpet: "pouet"
}

module.exports = {
    address: PROTOCOL_MULTICAST_ADDRESS,
    port: PROTOCOL_PORT,
    instruments: INSTRUMENTS
}