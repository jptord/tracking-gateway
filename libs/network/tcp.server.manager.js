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
        this.tcpServer = new TcpServer({ instanceName:instanceName, port, jsonmode : true });        
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
            console.info(`TcpServerManager[${self.instanceName}] client connected `);  
            const data = {a:"CON",uuid:generateShortHexId(8)};
            socket.write(JSON.stringify(data));
        });
        self.tcpServer.on('disconnect',(socket)=>{
            const client = self.clients.find(c=>c.uuid==socket.uuid);
            self.clientsLost.push(client);
            self.clients.splice(client,1);
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
