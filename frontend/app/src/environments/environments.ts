declare var externalEnvironments: any;

export const environment = {
	gatewayServer: externalEnvironments.gatewayServer,
	wsGatewayServer: externalEnvironments.wsGatewayServer,
}
