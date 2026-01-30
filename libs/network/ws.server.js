const { createServer } = require("http");
const { Server } = require("socket.io");
const WebSocket	= require('ws');

class WSServer extends Server {
		className = 'WSServer';
		constructor({port, instanceName, mode}){
			super(port);
			this.instanceName = instanceName;
			this.port = port;
			this.mode = mode;
			this.events = { 'connect': [], 'message': [], 'data': [], 'disconnect': [], 'error': [] , 'end': [] };
		}
		start(){			
			
			/*const io = new Server(3000);
			io.on("connection", (socket) => {
				console.log("socket connected");
				socket.on("disconnect",()=>{
					console.log("socket disconnected");
				});
				socket.on("message",(uuid,data)=>{
					console.log("socket message uuid",uuid);
					console.log("socket message data",data);
				});
			});*/
		}
}

module.exports = { WSServer }