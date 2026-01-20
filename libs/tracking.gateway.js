const NodeCaptureServer = require("./node.capture.server");
const {HttpServer} = require('./network/http.server');

class TrackingGateway{
    constructor(){
        console.info("Tracking-Gateway 1.0.0");
        this.nodeCaptureServer = new NodeCaptureServer();
				this.httpServer = new HttpServer({port:8080,publicFolder:'./public'});
				
    }
    start(){
        const self = this;
        self.nodeCaptureServer.start();
				self.httpServer.start();
				self.httpServer.get('/nodes.get',(req,res)=>{
					
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ result: "ok" }));
				});
    }
}

module.exports = {TrackingGateway}