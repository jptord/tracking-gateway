const { timeStamp } = require('console');
const net = require('net');

class TcpServer {
    className = 'TCPServer';
    constructor({ port, jsonmode=true,instanceName='' }) {
        this.port = port;
        this.instanceName = instanceName;
        this.jsonmode = jsonmode;
        this.address = "";
        this.family = "";
        this.ipaddr = "";
        this.server = null;
        this.events = {'connect':[],'data':[],'disconnect':[],'error':[]};
    }
    on(event,callback) {
        this.events[event].push(callback);
    }
    start() {
        const me = this;
        const server = net.createServer(function (socket) {
            me.events['connect'].forEach(event => event(socket));
            socket.on('data', (data) => {
                if (me.jsonmode){
                    let jsondata;
                    try{
                        jsondata = JSON.parse(data.toString());
                    }catch(e){}
                    if (jsondata==null)
                        me.events['data'].forEach(event => event(socket,{a:'ANY',data:data.toString()}));
                    else
                        me.events['data'].forEach(event => event(socket,jsondata));
                    return;
                } else
                    me.events['data'].forEach(event => event(socket,`${data.toString()}`));
            });
            socket.on('end', () => {
                console.info(`TcpServer[${me.instanceName}].createServer.end: socket client disconnected`);
                me.events['disconnect'].forEach(event => event(socket));
            });
            socket.on('error', (err) => {
                console.error(`TcpServer[${me.instanceName}] socket client error`, err);
                me.events['error'].forEach(event => event(socket));
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