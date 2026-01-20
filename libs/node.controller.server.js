const TcpServerManager = require('./network/tcp.server.manager');
//const express = require('express');
//const router = express.Router();

class NodeControllerServer{
    constructor(){
        this.tcpServerManagerParser = new TcpServerManager({instanceName:'ParserNodeServer',port:process.env.TCP_SERVERPORT_NODE_PARSER});
        this.tcpServerManagerBackenddb = new TcpServerManager({instanceName:'BackenddbNodeServer',port:process.env.TCP_SERVERPORT_NODE_BACKENDDB});
        this.tcpServerManagerProccesor = new TcpServerManager({instanceName:'ProcessorNodeServer',port:process.env.TCP_SERVERPORT_NODE_PROCESSOR});				
    }
		getClients(){

		}
    start(){
        console.info("NodeCaptureServer started");
        const self = this;
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
        });

    }
}
module.exports = NodeControllerServer