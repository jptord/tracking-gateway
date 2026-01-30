const NodeControllerServer = require("./node.controller.server");
const { ServerManager } = require("./server.manager");
const { HttpServer } = require('./network/http.server');
const { ParserServer}  = require("./parser.server");

const schedulerWorker = new Worker('./workers/scheduler.worker.js', { 
    workerData: {       timerEach : 5000, schedulePath:schedulePath }
});
class TrackingGateway{
    constructor(){
        console.info("Tracking-Gateway 1.0.0");
        //this.nodeControllerServer = new NodeControllerServer();
				this.parserServer = new ParserServer();
				this.httpServer = new HttpServer({port:process.env.HTTP_MANAGER,publicFolder:'./public'});
				this.serverManager = new ServerManager(this.httpServer,this.parserServer);
				
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

				//worker
				/*schedulerWorker.on("message",(message)=>{
								console.log("worker:",message);
				});*/
				schedulerWorker.on("message",(message)=>{
					console.log("worker:",message);
					if ( message.command == "schedule.run"){
									//console.info("[execute.schedule.payload]",message.payload.id);
									//self.executor.startTaskSchedule(devices, message.payload);
					}
					if ( message.command == "schedule.load"){
									schedules = message.payload;
									//console.log("schedules.payload",message.payload);
					}
				});
    }
}

module.exports = {TrackingGateway}