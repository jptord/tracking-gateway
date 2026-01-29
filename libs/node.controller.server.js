const TcpServerManager = require('./network/tcp.server.manager');
const WSServerManager = require('./network/ws.server.manager');
//const express = require('express');
//const router = express.Router();

class NodeControllerServer{
    constructor(){
			this.parsers = [];
			this.wsServerManagerParser = new WSServerManager({instanceName:'ParserWSNodeServer',port:process.env.WS_SERVERPORT_NODE_PARSER});
			/*this.tcpServerManagerParser = new TcpServerManager({instanceName:'ParserNodeServer',port:process.env.TCP_SERVERPORT_NODE_PARSER});
			this.tcpServerManagerBackenddb = new TcpServerManager({instanceName:'BackenddbNodeServer',port:process.env.TCP_SERVERPORT_NODE_BACKENDDB});
			this.tcpServerManagerProccesor = new TcpServerManager({instanceName:'ProcessorNodeServer',port:process.env.TCP_SERVERPORT_NODE_PROCESSOR});				*/
			this.events = { "parser.connect":[], "parser.disconnect":[] };
    }
		on(ev, fn){
			if (this.events[ev] == undefined) this.events[ev] = [];
			this.events[ev].push(fn);
		}
		getClients(){

		}
    start(){
			console.info("NodeCaptureServer started");
			const self = this;
			this.parsers = self.wsServerManagerParser;
			self.wsServerManagerParser.on("COM",(client, uuid, data)=>{
				//console.log("NodeControllerServer.client ", client);
				self.events['parser.connect'].forEach(event=>event(client, uuid, data));
			});
			self.wsServerManagerParser.on("devices.all",(client, uuid, data)=>{
				console.log("devices.all uuid", uuid);
				console.log("devices.all data", data);
			});
			self.wsServerManagerParser.on("devices.in",(client, uuid, data)=>{
				console.log("devices.in uuid", uuid);
				console.log("devices.in data", data);
			});
			self.wsServerManagerParser.on("devices.out",(client, uuid, data)=>{
				console.log("devices.out uuid", uuid);
				console.log("devices.out data", data);
			});

			self.wsServerManagerParser.start();
			/*
			self.tcpServerManagerParser.start();
			self.tcpServerManagerParser.on('data',(client,data)=>{            
					console.log("clients",self.tcpServerManagerParser.getAll());
					console.log("data",data);
			});

			self.tcpServerManagerBackenddb.start();
			self.tcpServerManagerBackenddb.on('data',(client,data)=>{            
					console.log("clients",self.tcpServerManagerBackenddb.getAll());
					console.log("data",data);
			});

			self.tcpServerManagerProccesor.start();
			self.tcpServerManagerProccesor.on('data',(client,data)=>{            
					console.log("clients",self.tcpServerManagerProccesor.getAll());
					console.log("data",data);
			});*/

    }
}
module.exports = NodeControllerServer