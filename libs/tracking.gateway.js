const NodeControllerServer = require("./node.controller.server");
const { ServerManager } = require("./server.manager");
const { HttpServer } = require('./network/http.server');
const { ParserServer}  = require("./parser.server");
const { Scheduler}  = require("./scheduler");

class TrackingGateway{
    constructor(){
        console.info("Tracking-Gateway 1.0.0");
        //this.nodeControllerServer = new NodeControllerServer();
				this.scheduler = new Scheduler();
				this.parserServer = new ParserServer();
				this.httpServer = new HttpServer({port:process.env.HTTP_MANAGER,publicFolder:'./public'});
				this.serverManager = new ServerManager(this.scheduler,this.httpServer,this.parserServer);
				
    }
    start(){
        const self = this;
        //self.nodeControllerServer.start();
				self.parserServer.start();
				self.parserServer.on('parser.connect',(client,uuid,data)=>{
					//this.httpServer.
				});
				self.httpServer.start();
				self.serverManager.start();
				self.scheduler.start();
    }
}

module.exports = {TrackingGateway}