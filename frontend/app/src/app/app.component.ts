import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GatewayService } from '../services/gateway.service';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
	constructor(private gatewayService:GatewayService){

	}
	ngOnInit(): void {
		this.gatewayService.getNodes().subscribe(data=>{
			console.log("getNodes.data",data);
		});
	}
  title = 'app';
	
}
