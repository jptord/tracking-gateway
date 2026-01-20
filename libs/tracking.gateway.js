const NodeControllerServer = require("./node.controller.server");
const {ServerManager} = require("./server.manager");
const {HttpServer} = require('./network/http.server');

class TrackingGateway{
    constructor(){
        console.info("Tracking-Gateway 1.0.0");
        this.nodeControllerServer = new NodeControllerServer();
				this.httpServer = new HttpServer({port:process.env.HTTP_MANAGER,publicFolder:'./public'});
				this.serverManager = new ServerManager(this.httpServer,this.nodeControllerServer);
				
    }
    start(){
        const self = this;
        self.nodeControllerServer.start();
				self.httpServer.start();
    }
}

module.exports = {TrackingGateway}