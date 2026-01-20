class ServerManager{
	constructor(httpServer, parserServer, backenddbServer, processorServer){
		this.httpServer = httpServer;
		this.parserServer = parserServer;
	}
	start(){
		const self = this;
		self.setRoutes();
	}
	setRoutes(){
		self.httpServer.get('/nodes.get',(req,res)=>{			
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({ clients: self.parserServer.clients }));
		});
	}
}

module.exports = { ServerManager }