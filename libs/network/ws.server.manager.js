const {WSServer} = require('./ws.server.js');
function generateShortHexId(length){
    let result = '';
    const characters = '0123456789abcdef';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
// PROTOCOL TCP-N1
/* BALANCING, REGISTRED */
class Client{
    constructor(socket,uuid){
        this.uuid = uuid==null?generateShortHexId(8):uuid;
        this.socket = socket;
				this.response = 0;
        this.connectTime = Date.now();
    }
    get(){
        return {uuid:this.uuid,resonse:this.response,connectTime:this.connectTime,connectTimeF:(new Date(this.connectTime)).toISOString()};
    }
}
class WSServerManager {
	constructor({port, instanceName='' }){
		this.wsServer = new WSServer({ port });
		this.port = port;
		this.instanceName = instanceName;
		this.clients = [];
		this.clientsLost = [];
		//this.on = ()=>{};
		this.events = {'data':[],'COM':[],'connect':[],'disconnect':[],'devices.all':[],'devices.in':[],'devices.out':[],'devices.out':[],'device.pin':[]};		
	}
	on(ev, fn ,... args ){
		if (this.events[ev] == undefined) this.events[ev] = [];
		this.events[ev].push(fn);
		//console.log("this.events",this.events);
	}
	doPing(){	
		const self = this;
		const clients = this.clients;
		clients.forEach((client)=>{
			const ms = Date.now();
			client.socket.emit("ping",ms);
		});
	}
	start(){
		const self = this;
		self.wsServer.on('connect',(socket)=>{
			socket.uuid = generateShortHexId(8);			
			socket.emit('COM',socket.uuid, socket.uuid);
			socket.on('disconnect',()=>{
				const client = self.clients.find(c=>c.uuid==socket.uuid);
				self.clientsLost.push(client);
				self.clients.splice(client,1);
				console.info("WsServerManager[self.instanceName] ",socket.uuid + " disconnected" );
				if (client==null) return;
				self.events['disconnect'].forEach(event=>event(client, client.uuid));
				console.info(`WsServerManager[${self.instanceName}] client removed`,socket.uuid);            
			});
			socket.on('COM',(uuid,data)=>{			
				
			});
			socket.on('pong',(uuid,ms)=>{
				const client = self.clients.find(c=>c.uuid==socket.uuid);
				if (client==undefined) return;
				const t = Date.now();
				client.response = t-ms;
				self.events['device.ping'].forEach(fn=>fn(client, uuid, {response:client.response} ));
				//console.log("pong ms t", (t-ms) , "ms");
			});
			socket.on('COM',(uuid,data)=>{			
				console.log("protocol COM",uuid, data);
				const clientLost = self.clientsLost.find(c=>c?.uuid==uuid);
				const client = self.clients.find(c=>c.uuid==socket.uuid);
				let currentClient = null;
				if (clientLost == null && client == null) {
						const newClient = new Client(socket,uuid);
						currentClient = newClient;
						socket.uuid = uuid;
						self.clients.push(newClient);
						console.info(`WsServerManager[${self.instanceName}] CON created`,socket.uuid,uuid);  
				}else if(clientLost && client==null){
						self.clientsLost.splice(clientLost,1);
						self.clients.push(clientLost);
						currentClient = clientLost;
						socket.uuid = uuid;
						clientLost.socket = socket;
						console.info(`WsServerManager[${self.instanceName}] CON recovery `,socket.uuid,uuid);  
				}else if(client && clientLost==null){
						client.socket = socket;
						console.info(`WsServerManager[${self.instanceName}] CON updated `,socket.uuid,uuid);  
						currentClient = client;
						client.uuid = uuid;
						socket.uuid = uuid;
				}
				self.events['COM'].forEach(event=>event(currentClient, uuid, data));
				return;
			});
			
			socket.onAny((ev, ...args)=>{
				const client = self.clients.find(c=>c.uuid==socket.uuid);
				if (client == null) return;
				console.log("on",ev,);
				if (self.events[ev]==undefined) return;
				console.log("self.events[ev]",self.events[ev]);
				self.events[ev].forEach((fn)=>{
					fn(client,...args);
				});
			});
		});
		
		console.info(`WsServerManager[${self.instanceName}] started on `, self.port );
	}
}

module.exports =  WSServerManager 