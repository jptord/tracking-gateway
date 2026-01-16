const dotenv = require('dotenv').config();
const {overrideLog} = require('atx-prettylog') ;
const {TrackingGateway} = require("./libs/tracking.gateway.js");
overrideLog();
const trackingGateway = new TrackingGateway();
trackingGateway.start();