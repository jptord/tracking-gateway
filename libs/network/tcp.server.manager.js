const { TcpServer } = require("./tcp.server.js");

function generateShortHexId(length){
    let result = '';
    const characters = '0123456789abcdef';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function generateShortId(length = 8){
    return Math.random().toString(36).substring(2, length + 2);
}

function getHeader(data){
	const uuid = Buffer.from(data.subarray(0,4));
	const len = Buffer.from(data.subarray(4,5)).readUInt8(0);
	const action = Buffer.from(data.subarray(5,5+len));
}
function setHeader(uuid,event,data){						
	const len = Buffer.alloc(1);
	len.writeUint8(event.length,0);
	if (data==null)
		return Buffer.concat([Buffer.from(uuid, 'hex'),len,Buffer.from(event)])
	else 
		return Buffer.concat([Buffer.from(uuid, 'hex'),len,Buffer.from(event),Buffer.from(data)]);
}
// PROTOCOL TCP-N1
/* BALANCING, REGISTRED */
class Client{
    constructor(socket,uuid){
        this.uuid = uuid==null?generateShortHexId(8):uuid;
        this.socket = socket;
        this.connectTime = Date.now();
    }
    get(){
        return {uuid:this.uuid,connectTime:this.connectTime};
    }
}
class TcpServerManager {
    constructor({ port, instanceName='' }) {
        this.tcpServer = new TcpServer({ instanceName:instanceName, port, jsonmode:true });        
        this.port = port;
        this.instanceName = instanceName;
        this.events = {'data':[],'connect':[],'disconnect':[]};
        this.clients = [];
        this.clientsLost = [];
    }
    on(event,callback){
        this.events[event].push(callback);
    }
    getAll(){
        return this.clients.map(c=>c.get());
    }
    start(){
        const self = this;
        self.tcpServer.start();
				console.info(`TcpServerManager[${self.instanceName}] started on `, self.port );
        self.tcpServer.on('connect',(socket)=>{
					/*console.log("data",data);
						console.log("uuid16", uuid.toString('hex'));
						console.log("len", len);
						console.log("action", action.toString());
            const data = {a:"CON",uuid:generateShortHexId(8)};
						socket.uuid = data.uuid;
            console.info(`TcpServerManager[${self.instanceName}] ${data.uuid} client connected `);  
            socket.write(JSON.stringify(data));*/
						socket.uuid = generateShortHexId(8);
						socket.write(setHeader(socket.uuid,'COM',Buffer.from("connected")));
        });
        self.tcpServer.on('disconnect',(socket)=>{
            const client = self.clients.find(c=>c.uuid==socket.uuid);
            self.clientsLost.push(client);
            self.clients.splice(client,1);
						console.info("TcpServerManager[self.instanceName] ",socket.uuid + " disconnected" );
            if (client==null) return;
            self.events['disconnect'].forEach(event=>event(client,data));
            console.info(`TcpServerManager[${self.instanceName}] client removed`,socket.uuid);            
        });
        self.tcpServer.on('data',(socket,jsondata)=>{
					
            if (jsondata.a=="CON"){
                const clientLost = self.clientsLost.find(c=>c.uuid==jsondata.uuid);
                const client = self.clients.find(c=>c.uuid==socket.uuid);
                if (clientLost == null && client == null) {
                    const newClient = new Client(socket,jsondata.uuid);
                    socket.uuid = jsondata.uuid;
                    self.clients.push(newClient);
                    console.info(`TcpServerManager[${self.instanceName}] CON created`,socket.uuid,jsondata.uuid);  
                }else if(clientLost && client==null){
                    self.clientsLost.splice(clientLost,1);
                    self.clients.push(clientLost);
                    socket.uuid = jsondata.uuid;
                    clientLost.socket = socket;
                    console.info(`TcpServerManager[${self.instanceName}] CON recovery `,socket.uuid,jsondata.uuid);  
                }else if(client && clientLost==null){
                    client.socket = socket;
                    console.info(`TcpServerManager[${self.instanceName}] CON updated `,socket.uuid,jsondata.uuid);  
                    client.uuid = jsondata.uuid
                    socket.uuid = jsondata.uuid;                    
                }
                return;
            }
          	const client = self.clients.find(c=>c.uuid==socket.uuid);
          	if (client == null) return;
          	self.events['data'].forEach(event=>event(client,jsondata));
        });
    }
    broadcast(message){
        self.clients.splice(client,1);
    }
}

module.exports = TcpServerManager;
