'use strict';

const funcs = require('./lib.js');

const Web3 = require('web3');
const net = require('net');

// Set your correct path here
const web3 = new Web3('/opt/gethtest/.ethereum/geth.ipc', net);

// Does not exist in mainnet, only for testing
const INITIAL_ETH_ACCOUNT = {
        address: '0xdc48161C3AA199A2ba580023d62F419506EF1b91',
        privateKey: '0x28949df9705ea27b1ac3e8a3297002345eb10b742855f59d379354a6e2dd29a2'
};

async function run() {
	console.log("Node ready:", await funcs.isNodeReady(web3));
	console.log("Average gas price:", await web3.eth.getGasPrice());

	const address = await funcs.deployToken(web3, INITIAL_ETH_ACCOUNT.privateKey, false, "Neonious Token", "1", "NEON", '125000000000000000000000000', 18);
	console.log("Token deployed at:", address);

	process.exit(0);
}
run();
