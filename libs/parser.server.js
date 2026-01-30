const TcpServerManager = require('./network/tcp.server.manager');
const WSServerManager = require('./network/ws.server.manager');
//const express = require('express');
//const router = express.Router();


class ParserServer{
    constructor(){
			this.parsers = [];
			this.wsServerManagerParser = new WSServerManager({instanceName:'ParserWSNodeServer',port:process.env.WS_SERVERPORT_NODE_PARSER});
			this.events = { "parser.connect":[], "parser.devices":[], "parser.disconnect":[], "device.ping":[] };
    }
		on(ev, fn){
			if (this.events[ev] == undefined) this.events[ev] = [];
			this.events[ev].push(fn);
		}
		getClients(){
			return this.parsers.map(c=>this.getClient(c));
		}
		getClient(c){
			return  {uuid:c.uuid,response:c.response,connectTime:c.connectTime,connectTimeF:(new Date(c.connectTime)).toISOString(),devicesCount: c.devices?.length};
		}
		doPing(){
			this.wsServerManagerParser.doPing();
		}
    start(){
			console.info("ParserServer started");
			const self = this;
			this.parsers = self.wsServerManagerParser.clients;
			self.wsServerManagerParser.on("COM",(client, uuid, data)=>{
				//console.log("NodeControllerServer.client ", client);
				self.events['parser.connect'].forEach(fn=>fn(client, uuid, data));
			});
			self.wsServerManagerParser.on("disconnect",(client, uuid, data)=>{
				self.events['parser.disconnect'].forEach(fn=>fn(client, uuid, data));
			});
			self.wsServerManagerParser.on("devices.all",(client, uuid, data)=>{
				console.log("devices.all uuid", uuid);
				client['devices'] = data;
				self.events['parser.devices'].forEach(fn=>fn(client, uuid, this.getClient(client) ));
			});
			self.wsServerManagerParser.on("devices.in",(client, uuid, data)=>{
				console.log("devices.in uuid", uuid);
				console.log("devices.in data", data);
			});
			self.wsServerManagerParser.on("devices.out",(client, uuid, data)=>{
				console.log("devices.out uuid", uuid);
				console.log("devices.out data", data);
			});
			self.wsServerManagerParser.on("device.ping",(client, uuid, data)=>{
				self.events['device.ping'].forEach(fn=>fn(client, uuid, data ));
			});

			self.wsServerManagerParser.start();
			

    }
}
module.exports = { ParserServer } 