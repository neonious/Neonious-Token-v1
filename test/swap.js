'use strict';

const lib = require('../lib.js');
const swap = require('../swap.js');

const Web3 = require('web3');
const net = require('net');

// Set your correct path here
const web3 = new Web3('/opt/geth/.ethereum/geth.ipc', net);

const PRIVATE_KEY = 'TODO';

async function run() {
	console.log("Sell 1000: ", await swap.getSellPrice(web3, web3.utils.toWei('1000'), null, lib.TOKENS['USDT']) / 1000 / Math.pow(10, 6));
	console.log("Sell 1: ", await swap.getSellPrice(web3, web3.utils.toWei('1'), null, lib.TOKENS['USDT']) / Math.pow(10, 6));
	console.log("Ratio: ", await swap.getPrice(web3, null, lib.TOKENS['USDT']));
	console.log("Buy 1: ", await swap.getBuyPrice(web3, web3.utils.toWei('1'), null, lib.TOKENS['USDT']) / Math.pow(10, 6));
	console.log("Buy 1000: ", await swap.getBuyPrice(web3, web3.utils.toWei('1000'), null, lib.TOKENS['USDT']) / 1000 / Math.pow(10, 6));

//	await swap.setupApproval(web3, PRIVATE_KEY, lib.TOKENS['USDT']);

/*
	await swap.transferWithSwap(web3, PRIVATE_KEY, null, 'ADDRESS',
		'100000000000000000',
		lib.TOKENS['USDC'],
		undefined,
		true);
*/

	console.log("Done.");
	process.exit(0);
}

run();
