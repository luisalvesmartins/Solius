const Modbus = require('jsmodbus') // https://github.com/Cloud-Automation/node-modbus
const net = require('net')
const utils = require('./utils')
const socket = new net.Socket()
const options = {
    'host' : '192.168.4.151',
    'port' : '8899'
}

const client = new Modbus.client.TCP(socket)
socket.on('connect', async function () {

    //Lê a temperatura
    var resp=await getTemperature();

    //Aumenta a temperatura 1 grau
    let temp1=resp[0];
    let temp2=resp[1]+1;

    // Grava temperatura 
    await setTemperature(temp1,temp2);

    // Mostra os registos
    await readHolding(0,10);

    socket.end();
})

socket.on('error', console.error)
socket.connect(options)

async function readHolding(start,length){
    try {
        var resp=await client.readHoldingRegisters(start, length);
        var v=resp.response._body._values;

        //Formatação
        var r=[];
        for(var f=0;f<length;f++){
            r.push({endereco:40000+f+start,valor:v[f],binary:utils.convertToBinary(v[f]), HighByte:utils.highByte(v[f]), LowByte:utils.lowByte(v[f])})
            //console.log(f+start,v[f], convertToBinary1(v[f]), "H:" + HighByte(v[f]), "L:" + LowByte(v[f]) );
        }
        console.table(r)
    } catch (error) {
        console.log("ERROR");
        console.log("Reading " + start + " to " + (start+length));
        console.log(error);
    }
}

async function setTemperature(temp1,temp2){
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

async function getTemperature(){
    try {
        var resp=await client.readHoldingRegisters(2, 1);
        var v=resp.response._body._values[0];
        return [utils.highByte(v), utils.lowByte(v)];
    } catch (error) {
        console.log("Erro ao ler a temperatura");
        console.log(error);
    }
}
