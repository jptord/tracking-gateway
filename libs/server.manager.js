const WSServerManager = require('./network/ws.server.manager');
const {WSServer} = require('./network/ws.server.js');
const { createServer } = require("http");
const { Server } = require("socket.io");

class ServerManager{
	className = "ServerManager";
	constructor(httpServer, parserServer, backenddbServer, processorServer){
		this.httpServer = httpServer;
		this.parserServer = parserServer;
		const httpServerWs = createServer();
		this.wsServer = new Server(httpServerWs,{  cors: {
					origin: "*", methods: ["GET", "POST"]	}});
		httpServerWs.listen(process.env.WS_MANAGER);
	}
	start(){
		const self = this;
		self.setRoutes();
	}
	setRoutes(){
		const self = this;
		const ws = this.wsServer;
		const parserServer = this.parserServer;
		self.httpServer.get('/parser.all',(req,res)=>{			
			console.log(this.className+" get parser.all");
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(parserServer.getClients()));
		});
		parserServer.on('parser.connect',(client,uuid,data)=>{
			console.log('parser.connect')
			ws.emit('parser.connect',uuid);
		})
		parserServer.on('parser.devices',(client,uuid,devices)=>{
			console.log('parser.devices')
			ws.emit('parser.devices',uuid,devices);
		})
		parserServer.on('parser.disconnect',(client,uuid,data)=>{
			console.log('parser.disconnect')
			ws.emit('parser.disconnect',uuid);
		})
		
		ws.on('connect',(socket)=>{
			
			console.log('parser.connect')
		});		
	}
}

module.exports = { ServerManager }