import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environments';

@Injectable({
	providedIn: 'root'
})
export class GatewayService {
	host = environment.gatewayServer;
	apiName = "actions";
	constructor(private http: HttpClient) {

	}
	getNodes() {
		return this.http.get(
			this.host + `/parser.all`
		);
	}
}
