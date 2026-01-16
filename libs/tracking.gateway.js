const NodeCaptureServer = require("./node.capture.server");

class TrackingGateway{
    constructor(){
        console.info("Tracking-gateway 1.0.0");
        this.nodeCaptureServer = new NodeCaptureServer();
    }
    start(){
        const self = this;
        self.nodeCaptureServer.start();
    }
}

module.exports = {TrackingGateway}