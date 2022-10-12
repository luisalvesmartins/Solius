const Modbus = require('jsmodbus') // https://github.com/Cloud-Automation/node-modbus
const net = require('net')
const utils = require('./utils')
const socket = new net.Socket()
const express = require("express")


var aerobox_ip = process.env.AEROBOX_IP
var aerobox_port = process.env.AEROBOX_PORT
var debug = process.env.DEBUG

if (!aerobox_ip)
    aerobox_ip = "192.168.4.151"
if (!aerobox_port)
    aerobox_port=8899
if (!debug)
    debug = "none";

const options = {
    'host' : aerobox_ip,
    'port': aerobox_port,
    'keepAlive': true
}
const port=8000;

const client = new Modbus.client.TCP(socket)
socket.on('connect', function () {
    if (debug!="none") console.log("CONNECTED")
})
socket.on('end', function () {
    if (debug!="none") console.log("DISCONNECTED")
});
socket.on('error', function () {
    console.log("CONNECTION ERROR")
});

socket.on('error', console.error)

//FOR DEBUG ONLY
async function readHolding(start,length){
    try {
        var resp=await client.readHoldingRegisters(start, length);
        var v=resp.response._body._values;

        var r=[];
        for(var f=0;f<length;f++){
            r.push({endereco:40000+f+start,valor:v[f],binary:utils.convertToBinary(v[f]), HighByte:utils.highByte(v[f]), LowByte:utils.lowByte(v[f])})
        }
        console.table(r)
    } catch (error) {
        console.log("ERROR Reading " + start + " to " + (start+length));
        console.log(error);
    }
}


//CORE
async function setAeroboxTemperature(temp1,temp2){
    let sHex = temp1.toString(16) + temp2.toString(16)
    let number = parseInt(sHex, 16);

    try {
        await client.writeSingleRegister(2,number);
        console.log("Temperatura a %i e %i", temp1,temp2);
    } catch (error) {
        console.log("Erro ao definir a temperatura")
        console.log(error);
    }
}

async function getAeroboxTemperature(){
    try {
        var resp=await client.readHoldingRegisters(2, 1);
        var v=resp.response._body._values[0];
        return [utils.highByte(v), utils.lowByte(v)];
    } catch (error) {
        console.log("Erro ao ler a temperatura");
        console.log(error);
    }
}

var lastTemp = [0, 0];

const webservice = express()

webservice.get('/', async (req, res) => {
    res.json("Working")
})

//REST
webservice.get('/aerobox_temperature1', async (req, res) => {
    if (debug!="none") console.log("GET /temperature1")
    if (socket.readyState=="open"){
        lastTemp=await getAeroboxTemperature();
    }
    else
    {
        if (socket.readyState != "opening") {
            if (debug!="none") console.log("Reconnecting")
            socket.connect(options, async () => {
                lastTemp = await getAeroboxTemperature();
            })
        }
    }
    res.json({ temp: lastTemp[0] })
})

webservice.get('/aerobox_temperature2', async (req, res) => {
    if (debug!="none") console.log("GET /temperature2")
    if (socket.readyState=="open"){
        lastTemp=await getAeroboxTemperature();
    }
    else
    {
        if (socket.readyState != "opening") {
            if (debug!="none") console.log("Reconnecting")
            socket.connect(options, async () => {
                lastTemp = await getAeroboxTemperature();
            })
        }
    }
    res.json({ temp: lastTemp[1] })
})

webservice.post('/aerobox_temperature1', express.json(), async (req, res) => {
    socket.connect(options, async ()=>{
        console.log("POST /temperature1",req.body)
        var temp=parseInt(req.body.temp);
        await setAeroboxTemperature(temp,lastTemp[1]);
        lastTemp[0] = temp;

        res.json("ok")
    })
})

webservice.post('/aerobox_temperature2', express.json(), async (req, res) => {
    socket.connect(options, async ()=>{
        var temp=parseInt(req.body.temp);
        await setAeroboxTemperature(lastTemp[0], temp);
        lastTemp[1] = temp;

        res.json("ok")
    })
})

//INITIALIZE
console.log(`Starting listener on port ${port}.`)
webservice.listen(port, () => {
    console.log(`Solius Bridge is running on port ${port}.`);
})
console.log("aerobox_ip:", aerobox_ip, " aerobox_port:", aerobox_port);

socket.connect(options, async ()=>{
    lastTemp=await getAeroboxTemperature();
    console.log("Initial:",lastTemp);
})
