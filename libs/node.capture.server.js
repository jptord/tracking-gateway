const TcpServerManager = require('./network/tcp.server.manager');

class NodeCaptureServer{
    constructor(){
        this.tcpServerManagerCapture = new TcpServerManager({instanceName:'CaptureNodeServer',port:process.env.TCP_SERVERPORT_NODE_CAPTURE});        
        this.tcpServerManagerProccesor = new TcpServerManager({instanceName:'ProcessorNodeServer',port:process.env.TCP_SERVERPORT_NODE_PROCESSOR});
    }
    start(){        
        console.info("NodeCaptureServer started");
        const self = this;
        self.tcpServerManagerCapture.start();
        self.tcpServerManagerCapture.on('data',(client,data)=>{            
            console.log("clients",self.tcpServerManagerCapture.getAll());
            console.log("data",data);
        });

        self.tcpServerManagerProccesor.start();
        self.tcpServerManagerProccesor.on('data',(client,data)=>{            
            console.log("clients",self.tcpServerManagerProccesor.getAll());
            console.log("data",data);
        });
    }
}
module.exports = NodeCaptureServer