'use strict';
           
const lib = require('../lib.js');
const swap = require('../swap.js');

const Web3 = require('web3');
const net = require('net');

// Set your correct path here
const web3 = new Web3('/opt/geth/.ethereum/geth.ipc', net);

async function run() {
	console.log((new web3.utils.BN('7')).div(new web3.utils.BN(3)).toString());
/*
	console.log("Sell 1000: ", await swap.getSellPrice(web3, web3.utils.toWei('1000'), null, lib.TOKENS['USDT']) / 1000 / Math.pow(10, 6));
	console.log("Sell 1: ", await swap.getSellPrice(web3, web3.utils.toWei('1'), null, lib.TOKENS['USDT']) / Math.pow(10, 6));
	console.log("Ratio: ", await swap.getPrice(web3, null, lib.TOKENS['USDT']));
	console.log("Buy 1: ", await swap.getBuyPrice(web3, web3.utils.toWei('1'), null, lib.TOKENS['USDT']) / Math.pow(10, 6));
	console.log("Buy 1000: ", await swap.getBuyPrice(web3, web3.utils.toWei('1000'), null, lib.TOKENS['USDT']) / 1000 / Math.pow(10, 6));
*/
	console.log("APPROVE");
//	await swap.setupApproval(web3, '0xe0cdb4d9852a67974a503046307094cff58a63e38d383b0142b3fd4144aa98da', lib.TOKENS['USDT']);

	console.log("Done.");
	process.exit(0);
}

run();

