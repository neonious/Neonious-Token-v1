'use strict';

const funcs = require('../lib.js');

const Web3 = require('web3');
const net = require('net');

// Set your correct path here
const web3 = new Web3('/opt/gethtest/.ethereum/geth.ipc', net);

// Does not exist in mainnet, only for testing
const INITIAL_ETH_ACCOUNT = {
        address: '0xdc48161C3AA199A2ba580023d62F419506EF1b91',
        privateKey: '0x28949df9705ea27b1ac3e8a3297002345eb10b742855f59d379354a6e2dd29a2'
};
// If not set, we create contract in run() below
let NEON_TESTTOKEN_CONTRACT = '0x1008940A4Da0A69B408B1Bc67e24323C3EaAeC96';

async function run() {
        console.log("Node ready:", await funcs.isNodeReady(web3));

	console.log("Deploy gas required: ", await funcs.deployToken(web3, INITIAL_ETH_ACCOUNT.privateKey, true, "Neonious Token", "1", "MDSIM", '120000000000000000000000000', 18));

	if(!NEON_TESTTOKEN_CONTRACT) {
		NEON_TESTTOKEN_CONTRACT = await funcs.deployToken(web3, INITIAL_ETH_ACCOUNT.privateKey, false, "Neonious Token", "1", "MDSIM", '125000000000000000000000000', 18);
		console.log("Token deployed at:", NEON_TESTTOKEN_CONTRACT);
	}

	console.log("Token name:", await funcs.tokenName(web3, NEON_TESTTOKEN_CONTRACT));
	console.log("Token version:", await funcs.tokenVersion(web3, NEON_TESTTOKEN_CONTRACT));
	console.log("Token symbol:", await funcs.tokenSymbol(web3, NEON_TESTTOKEN_CONTRACT));

	console.log("Initial ETH:", await funcs.getBalance(web3, null, INITIAL_ETH_ACCOUNT.address));
	console.log("Initial Token:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, INITIAL_ETH_ACCOUNT.address));

	// Get current block

	const block = await web3.eth.getBlockNumber();
	const addressesAll = await funcs.createAddresses(web3, 4);

	let addresses = [];
	for(let i = 0; i < addressesAll.length; i++)
		addresses.push(addressesAll[i].address);

	console.log("ETH balances:", await funcs.getBalance(web3, null, addresses));
	console.log("Token balances:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, addresses));

	console.log("Transfer to first two");
	console.log("Gas cost ETH transfer:", await funcs.transfer(web3, INITIAL_ETH_ACCOUNT.privateKey, null, addressesAll[0].address, '1000000000000000', undefined, true));
	console.log("Gas cost Token transfer:", await funcs.transfer(web3, INITIAL_ETH_ACCOUNT.privateKey, NEON_TESTTOKEN_CONTRACT, addressesAll[0].address, '1000000000', undefined, true));
	await funcs.transfer(web3, INITIAL_ETH_ACCOUNT.privateKey, null, addressesAll[0].address, '1000000000000000');
	await funcs.transfer(web3, INITIAL_ETH_ACCOUNT.privateKey, NEON_TESTTOKEN_CONTRACT, addressesAll[0].address, '1000000000');

	console.log("ETH balances:", await funcs.getBalance(web3, null, addresses));
	console.log("Token balances:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, addresses));

	console.log("Transfer 100 of ETH from first to second");
	await funcs.transfer(web3, addressesAll[0].privateKey, null, addressesAll[1].address, 100);

	console.log("ETH balances:", await funcs.getBalance(web3, null, addresses));
	console.log("Token balances:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, addresses));

	console.log("Transfer 100 of Token from first to third");
	await funcs.transfer(web3, addressesAll[0].privateKey, NEON_TESTTOKEN_CONTRACT, addressesAll[2].address, 100);

	console.log("ETH balances:", await funcs.getBalance(web3, null, addresses));
	console.log("Token balances:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, addresses));

	console.log("Transfer 100 of Token from third to fourth, delegated by first");
	console.log("Gas cost delegated transfer:", await funcs.transferDelegated(web3, addressesAll[0].privateKey, NEON_TESTTOKEN_CONTRACT, addressesAll[2].privateKey, addressesAll[3].address, 100, undefined, true));
	await funcs.transferDelegated(web3, addressesAll[0].privateKey, NEON_TESTTOKEN_CONTRACT, addressesAll[2].privateKey, addressesAll[3].address, 100);

	console.log("ETH balances:", await funcs.getBalance(web3, null, addresses));
	console.log("Token balances:", await funcs.getBalance(web3, NEON_TESTTOKEN_CONTRACT, addresses));

	// Output history
	console.log("ETH history:", await funcs.getHistory(web3, null, addresses, block + 1));
	console.log("Token history:", await funcs.getHistory(web3, NEON_TESTTOKEN_CONTRACT, addresses, block + 1));

	console.log("Done.");
	process.exit(0);
}
run();
