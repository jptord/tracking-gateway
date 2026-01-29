import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GatewayService } from '../services/gateway.service';
import { provideHttpClient } from '@angular/common/http';
import { WSGatewayService } from '../services/wsgateway.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
	constructor(private gatewayService:GatewayService,
    private wsGatewayService: WSGatewayService,){

	}
	ngOnInit(): void {
		this.gatewayService.getNodes().subscribe(data=>{
			console.log("getNodes.data",data);
		});
		this.initializeSocketConnection();
	}
  initializeSocketConnection() {
    const self = this;
    var BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    //this.devices = this.websocketService.devices;
    //this.clusters = this.websocketService.clusters;
    this.wsGatewayService.on("parser.all",(data)=>{
			console.log("parser.all data",data);
    });
	}
  title = 'app';
	
}
