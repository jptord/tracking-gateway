const { timeStamp } = require('console');
const net = require('net');
class TcpServer {
	className = 'TCPServer';
	constructor({ port, mode = 'json|encodeUuid|raw', instanceName = '' }) {
		this.port = port;
		this.instanceName = instanceName;
		this.mode = mode;
		this.address = "";
		this.family = "";
		this.ipaddr = "";
		this.server = null;
		this.events = { 'connect': [], 'message': [], 'data': [], 'disconnect': [], 'error': [] , 'end': [] };
	}
	on(event, callback) {
		if (this.events[event] == null)
			this.events[event] = [];
		this.events[event].push(callback);
		console.log("this.events[event]",);
	}
	setMode(mode){
		this.mode = mode;
	}
	start() {
		const me = this;
		const server = net.createServer((socket) => {

			me.events['connect'].forEach(event => event(socket));

			socket.on("data", (data) => {		
				if (socket["mode"] == "file") { 
					return;
				}
				if (socket["mode"] == "raw") { 
					me.events['data'].forEach(event => event(data, socket )); 
					return;
				}
				if (me.mode == "encodeUuid") {
					const uuid = Buffer.from(data.subarray(0, 4)).toString('hex');
					const len = Buffer.from(data.subarray(4, 5)).readUInt8(0);
					const action = Buffer.from(data.subarray(5, 5 + len)).toString();
					const payload = Buffer.from(data.subarray(5 + len));
					//console.log("action",action);
					if (me.events[action]!=undefined)
						me.events[action].forEach(event => event(payload, socket, uuid ));
				} else if (me.mode == "raw") {
					me.events['data'].forEach(event => event(data, socket ));
				}
				
			});
			socket.on('end', () => {//end data
				//console.info(`TcpServer[${me.instanceName}].createServer.end: socket client disconnected`);
				//me.events['disconnect'].forEach(event => event(socket));
				me.events['end'].forEach(event => event(socket));
			});
			socket.on('error', (err) => {
				me.events['disconnect'].forEach(event => event(socket));
			});
		});
		server.on('error', function (error) {
			console.error('TcpServer[${me.instanceName}].createServer.error: ', error.message);
			me.events['error'].forEach(event => event(socket));
			server.close();

		});
		server.listen(me.port, () => {
			console.info(`TcpServer[${me.instanceName}].createServer: listen port ${me.port}`);
		});
	}
	getInfo() {
		return {
			port: this.port,
			address: this.address,
			ipaddr: this.ipaddr
		};
	}
}
module.exports = { TcpServer }