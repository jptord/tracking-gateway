const { TcpServer } = require("./tcp.server.js");

const fs = require('fs');
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

class DataVars{
		constructor(){
			this.writeStream = null;
			this.receivedChunks = [];
			this.totalLength = 0;
			this.size = 0;
		}
		
}
class ReceiverBigData{
	constructor(tcpServer,clients){
		this.tcpServer = tcpServer;
		this.clients = clients;
		this.events = {'data':[]};
		this.init();
	}
	on(ev,fn){
		this.events[ev].push(fn);		
	}
	init(){
		const self = this;
		const receivers = {};
		
		self.tcpServer.on("SDATA", (data, socket, uuid)=>{
			console.log("protocol SDATA",Number.parseInt(data.toString()), socket.uuid);
			const client = self.clients.find(c=>c.uuid==socket.uuid);
			if (client == null) return;
			const dataVars = new DataVars();	
			dataVars.receivedChunks = [];
			dataVars.totalLength = 0;
			dataVars.size = 0;
			socket['mode'] = 'raw';
			//const destPath = 'received_file.dat';
			dataVars.size = Number.parseInt(data.toString());
			receivers[socket.uuid] = dataVars;
			
			//writeStream = fs.createWriteStream(destPath);
			//socket.pipe(writeStream, { end: false } );
		});
		self.tcpServer.on("EDATA", (data, socket, uuid)=>{
			console.log("protocol EDATA");					    			
			console.log("writted");
			socket['mode'] = '';
		});
		self.tcpServer.on('end',(socket, uuid)=>{
			console.log("protocol end");
			socket['mode'] = '';
			//writeStream.end();
		});
		
		self.tcpServer.on('data',(data, socket)=>{
				if (socket['mode']=='raw'){
					if(receivers[socket.uuid]==undefined) return;
					receivers[socket.uuid].receivedChunks.push(data);
					receivers[socket.uuid].totalLength += data.length;
					console.log("receivers[socket.uuid].totalLength",receivers[socket.uuid].totalLength);
					if (receivers[socket.uuid].totalLength > receivers[socket.uuid].size){
						const fullDataBuffer = Buffer.concat(receivers[socket.uuid].receivedChunks, receivers[socket.uuid].size);
						self.events['data'].forEach(e=>e(fullDataBuffer,socket,socket.uuid));
						receivers[socket.uuid] = null;
						//fs.writeFileSync('filerec.rar',fullDataBuffer);
					}
				}
		});
	}

}
class ReceiverFile{
	constructor(tcpServer, clients){
		this.tcpServer = tcpServer;
		this.clients = clients;
		this.events = {'data':[]};
		this.init();
	}
	on(ev,fn){
		if (this.events[ev] == null)
			this.events[ev] = [];
		this.events[ev].push(fn);		
	}
	init(){
		const writeStreams = {};
		const self = this;
		self.tcpServer.on("FDATA", (data, socket, uuid)=>{
			console.log("protocol FDATA", data);
			socket['mode'] = 'file';
			const destPath = data.toString();
			writeStreams[uuid] = fs.createWriteStream(destPath);
			socket.pipe(writeStreams[uuid], { end: false });
		});
		
		self.tcpServer.on('end',(socket, uuid)=>{			
			if(writeStreams[socket.uuid]==undefined) return;
			writeStreams[uuid].end();
			writeStreams[uuid] = null;
		});		
	}
}
class TcpServerManager {
    constructor({ port, instanceName='' }) {
        this.tcpServer = new TcpServer({ instanceName:instanceName, port, mode:"encodeUuid" });        
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
						console.log("TcpServerManager client connected");
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
				
        self.tcpServer.on('COM',(data, socket, uuid)=>{
					console.log("protocol COM", data);
					const clientLost = self.clientsLost.find(c=>c.uuid==uuid);

					const client = self.clients.find(c=>c.uuid==socket.uuid);
					if (clientLost == null && client == null) {
							const newClient = new Client(socket,uuid);
							socket.uuid = uuid;
							self.clients.push(newClient);
							console.info(`TcpServerManager[${self.instanceName}] CON created`,socket.uuid,uuid);  
					}else if(clientLost && client==null){
							self.clientsLost.splice(clientLost,1);
							self.clients.push(clientLost);
							socket.uuid = uuid;
							clientLost.socket = socket;
							console.info(`TcpServerManager[${self.instanceName}] CON recovery `,socket.uuid,uuid);  
					}else if(client && clientLost==null){
							client.socket = socket;
							console.info(`TcpServerManager[${self.instanceName}] CON updated `,socket.uuid,uuid);  
							client.uuid = uuid
							socket.uuid = uuid;                    
					}
					return;
				});
				const receiverBigData = new ReceiverBigData(self.tcpServer, self.clients);
				receiverBigData.on('data',(data,socket,uuid)=>{
					console.log("receiverBigData.length", data.length);
				});
				const receiverFile = new ReceiverFile(self.tcpServer, self.clients);
				receiverFile.on('data',(data,socket,uuid)=>{
					console.log("receiverFile.length", data.length);
				});
    }
    broadcast(message){
        self.clients.splice(client,1);
    }
}

module.exports = TcpServerManager;
