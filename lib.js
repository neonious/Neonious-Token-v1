'use strict';

const fs = require('fs');
const path = require('path');

const ethSigUtil = require('eth-sig-util');

const ERC20_ABI = [
	{
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [{ "name": "_owner", "type": "address" }],
		"name": "balanceOf",
		"outputs": [{ "name": "balance", "type": "uint256" }],
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validAfter",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "validBefore",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "nonce",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "transferWithAuthorization",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "tos",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "transferToMany",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

let erc20Contracts = {}, erc20Decimals = {};
let accounts = {}, transactionCounts = {};

exports.TOKENS = {
	'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	'WMATIC': '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
	'MDSIM': '0xDa48C42517AFfB3BF3FC13CE26561092e1a61A80',
	'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
	'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
};
exports.TOKENS_POLYGON = {
	'WETH': '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
	'WMATIC': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
	'MDSIM': '0xE454034b75Bb9D017f21228e61b9Ddbc889623C0',
	'DAI': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
	'USDC': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
	'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
};

exports.isNodeReady = async function isNodeReady(web3) {
	return !await web3.eth.isSyncing();
}

exports.getPrivateKeyAddress = async function getPrivateKeyAddress(web3, privateKey) {
	let account = accounts[privateKey];
	if (!account)
		account = accounts[privateKey] = await web3.eth.accounts.privateKeyToAccount(privateKey);

	return account.address;
}

exports.createAddresses = async function createAddresses(web3, count) {
	let addrs = [];
	for (let i = 0; i < count; i++) {
		const addr = await web3.eth.accounts.create();

		addrs.push({ address: addr.address, privateKey: addr.privateKey });
		accounts[addr.privateKey] = addr;
	}

	return addrs;
}

exports.tokenName = async function tokenName(web3, tokenAddr) {
	if (!erc20Contracts[tokenAddr])
		erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	return await erc20Contracts[tokenAddr].methods.name().call();
}

exports.tokenVersion = async function tokenVersion(web3, tokenAddr) {
	if (!erc20Contracts[tokenAddr])
		erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	return await erc20Contracts[tokenAddr].methods.version().call();
}

exports.tokenSymbol = async function tokenSymbol(web3, tokenAddr) {
	if (!erc20Contracts[tokenAddr])
		erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	return await erc20Contracts[tokenAddr].methods.symbol().call();
}

exports.tokenDecimals = async function tokenDecimals(web3, tokenAddr) {
	if (tokenAddr) {
		const decimals = erc20Decimals[tokenAddr];	// tokenDecimals is used often
		if (decimals !== undefined)
			return decimals;

		if (!erc20Contracts[tokenAddr])
			erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
		return erc20Decimals[tokenAddr] = await erc20Contracts[tokenAddr].methods.decimals().call();
	} else
		return 1E-18;
}

// subtractFeeTokenEthRate != undefined
// => special mode, where it subtracts the fee from the MDSIMs transferred
// at the rate given. The MDSIMs subtracted are returned
exports.transferDelegated = async function transferDelegated(web3, privateKeyFees, tokenAddr, privateKeyFrom, to, amount, subtractFeeTokenEthRate, gasFactor, onlyEstimate) {
	let subReturn = '0';

	let accountFrom = accounts[privateKeyFrom];
	if (!accountFrom)
		accountFrom = accounts[privateKeyFrom] = await web3.eth.accounts.privateKeyToAccount(privateKeyFrom);

	if (!erc20Contracts[tokenAddr])
		erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	const tokenName = await erc20Contracts[tokenAddr].methods.name().call();
	const tokenVersion = await erc20Contracts[tokenAddr].methods.version().call();

	if (subtractFeeTokenEthRate && !onlyEstimate) {
		const data = {
			types: {
				EIP712Domain: [
					{ name: "name", type: "string" },
					{ name: "version", type: "string" },
					{ name: "chainId", type: "uint256" },
					{ name: "verifyingContract", type: "address" },
				],
				TransferWithAuthorization: [
					{ name: "from", type: "address" },
					{ name: "to", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "validAfter", type: "uint256" },
					{ name: "validBefore", type: "uint256" },
					{ name: "nonce", type: "bytes32" },
				],
			},
			domain: {
				name: tokenName,
				version: tokenVersion,
				chainId: await web3.eth.getChainId(),
				verifyingContract: tokenAddr,
			},
			primaryType: "TransferWithAuthorization",
			message: {
				from: accountFrom.address,
				to: to,
				value: amount,
				validAfter: 0,
				validBefore: Math.floor(Date.now() / 1000) + 3600,
				nonce: web3.utils.randomHex(32),
			},
		};

		const signature = ethSigUtil.signTypedData_v4(Buffer.from(privateKeyFrom.substr(2), 'hex'), { data });
		const v = "0x" + signature.slice(130, 132);
		const r = signature.slice(0, 66);
		const s = "0x" + signature.slice(66, 130);

		let gas = await exports.sendPrivateKey(web3, privateKeyFees,
			erc20Contracts[tokenAddr].methods.transferWithAuthorization(accountFrom.address, to, amount, 0, data.message.validBefore, data.message.nonce, v, r, s), tokenAddr, undefined, undefined, true);
		gas *= subtractFeeTokenEthRate;

		await exports.sendPrivateKey(web3, privateKeyFees, async (gasPrice) => {
			let tryAmount;
			let subAmount = (new web3.utils.BN(gas)).mul(new web3.utils.BN(gasPrice));
			tryAmount = (new web3.utils.BN(amount)).sub(subAmount).toString();
			subReturn = subAmount.toString();
			if (tryAmount == '0' || tryAmount[0] == '-')
				return amount;

			const data = {
				types: {
					EIP712Domain: [
						{ name: "name", type: "string" },
						{ name: "version", type: "string" },
						{ name: "chainId", type: "uint256" },
						{ name: "verifyingContract", type: "address" },
					],
					TransferWithAuthorization: [
						{ name: "from", type: "address" },
						{ name: "to", type: "address" },
						{ name: "value", type: "uint256" },
						{ name: "validAfter", type: "uint256" },
						{ name: "validBefore", type: "uint256" },
						{ name: "nonce", type: "bytes32" },
					],
				},
				domain: {
					name: tokenName,
					version: tokenVersion,
					chainId: await web3.eth.getChainId(),
					verifyingContract: tokenAddr,
				},
				primaryType: "TransferWithAuthorization",
				message: {
					from: accountFrom.address,
					to: to,
					value: tryAmount,
					validAfter: 0,
					validBefore: Math.floor(Date.now() / 1000) + 3600,
					nonce: web3.utils.randomHex(32),
				},
			};

			const signature = ethSigUtil.signTypedData_v4(Buffer.from(privateKeyFrom.substr(2), 'hex'), { data });
			const v = "0x" + signature.slice(130, 132);
			const r = signature.slice(0, 66);
			const s = "0x" + signature.slice(66, 130);

			return [erc20Contracts[tokenAddr].methods.transferWithAuthorization(accountFrom.address, to, tryAmount, 0, data.message.validBefore, data.message.nonce, v, r, s), 0];
		}, tokenAddr, undefined, gasFactor, onlyEstimate);
		return subReturn;
	} else {
		const data = {
			types: {
				EIP712Domain: [
					{ name: "name", type: "string" },
					{ name: "version", type: "string" },
					{ name: "chainId", type: "uint256" },
					{ name: "verifyingContract", type: "address" },
				],
				TransferWithAuthorization: [
					{ name: "from", type: "address" },
					{ name: "to", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "validAfter", type: "uint256" },
					{ name: "validBefore", type: "uint256" },
					{ name: "nonce", type: "bytes32" },
				],
			},
			domain: {
				name: tokenName,
				version: tokenVersion,
				chainId: await web3.eth.getChainId(),
				verifyingContract: tokenAddr,
			},
			primaryType: "TransferWithAuthorization",
			message: {
				from: accountFrom.address,
				to: to,
				value: amount,
				validAfter: 0,
				validBefore: Math.floor(Date.now() / 1000) + 3600,
				nonce: web3.utils.randomHex(32),
			},
		};

		const signature = ethSigUtil.signTypedData_v4(Buffer.from(privateKeyFrom.substr(2), 'hex'), { data });
		const v = "0x" + signature.slice(130, 132);
		const r = signature.slice(0, 66);
		const s = "0x" + signature.slice(66, 130);

		return await exports.sendPrivateKey(web3, privateKeyFees,
			erc20Contracts[tokenAddr].methods.transferWithAuthorization(accountFrom.address, to, amount, 0, data.message.validBefore, data.message.nonce, v, r, s), tokenAddr, undefined, gasFactor, onlyEstimate);
	}
}

exports.transfer = async function transfer(web3, privateKey, tokenAddr, to, amount, subtractFeeTokenEthRate, gasFactor, onlyEstimate) {
	if (tokenAddr) {
		if (!erc20Contracts[tokenAddr])
			erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);

		if (subtractFeeTokenEthRate) {
			let gas = await exports.sendPrivateKey(web3, privateKey, erc20Contracts[tokenAddr].methods.transfer(to, amount), tokenAddr, undefined, undefined, true);
			if (onlyEstimate)
				return gas;
			gas *= subtractFeeTokenEthRate;

			return await exports.sendPrivateKey(web3, privateKey, async (gasPrice) => {
				let tryAmount;
				let subAmount = (new web3.utils.BN(gas)).mul(new web3.utils.BN(gasPrice));
				tryAmount = (new web3.utils.BN(amount)).sub(subAmount).toString();
				if (tryAmount == '0' || tryAmount[0] == '-')
					return;

				return erc20Contracts[tokenAddr].methods.transfer(to, tryAmount);
			}, tokenAddr, undefined, gasFactor);
		} else
			return await exports.sendPrivateKey(web3, privateKey, erc20Contracts[tokenAddr].methods.transfer(to, amount), tokenAddr, undefined, gasFactor, onlyEstimate);
	} else {
		if (onlyEstimate)
			return 21000;

		const account = await web3.eth.accounts.privateKeyToAccount(privateKey);

		let nonce = transactionCounts[account.address];
		if (nonce === undefined)
			nonce = await web3.eth.getTransactionCount(account.address, 'pending');
		transactionCounts[account.address] = nonce + 1;

		let gasPrice = '1000000000';
		if (!gasFactor)
			gasFactor = 1;

		while (true) {
			while (true) {
				let newPrice = await web3.eth.getGasPrice();
				newPrice = (new web3.utils.BN(newPrice)).mul(new web3.utils.BN(Math.round(gasFactor * 1000))).toString() * 0.001;

				if (gasPrice.length > newPrice.length || (gasPrice.length == newPrice.length && gasPrice >= newPrice))
					gasPrice = (new web3.utils.BN(gasPrice)).add(new web3.utils.BN('10000000000')).toString();
				else
					gasPrice = newPrice;
				if ((new web3.utils.BN(gasPrice)).gte(new web3.utils.BN('500000000000')))
					throw new Error('above 500 Gwei');

				break;
			}

			let tryAmount;
			if (subtractFeeTokenEthRate) {
				tryAmount = (new web3.utils.BN(amount)).sub((new web3.utils.BN(21000)).mul(new web3.utils.BN(gasPrice))).toString();
				if (tryAmount == '0' || tryAmount[0] == '-')
					return;			// nothing to transfer
			} else
				tryAmount = amount;

			const createTransaction = await account.signTransaction({
				from: account.address,
				to,
				value: tryAmount,
				gas: 21000,
				gasPrice,
				nonce
			});

			try {
				return await web3.eth.sendSignedTransaction(
					createTransaction.rawTransaction
				);
			} catch (e) {
				if (e.message && e.message.indexOf('not mined within') < 0)
					throw e;
			}
		}
	}
}

exports.transferToManyMDSIM = async function transferToManyMDSIM(web3, privateKey, tokenAddr, tos, amounts, gasFactor, onlyEstimate) {
	if (tos.length != amounts.length)
		throw new Error('array lengths do not match');

	erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	return await exports.sendPrivateKey(web3, privateKey, erc20Contracts[tokenAddr].methods.transferToMany(tos, amounts), tokenAddr, undefined, gasFactor, onlyEstimate);
}

exports.approve = async function approve(web3, privateKey, tokenAddr, byAddress, limit, gasFactor, onlyEstimate) {
	if (limit === undefined || limit === null)
		limit = (new web3.utils.BN(2)).pow(new web3.utils.BN(256)).sub(new web3.utils.BN(1)).toString();

	erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);
	return await exports.sendPrivateKey(web3, privateKey, erc20Contracts[tokenAddr].methods.approve(byAddress, limit), tokenAddr, undefined, gasFactor, onlyEstimate);
}

exports.getDecimalFactor = async function getDecimalFactor(web3, tokenAddr) {
	if (tokenAddr) {
		if (!erc20Contracts[tokenAddr])
			erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);

		const decimals = await erc20Contracts[tokenAddr].methods.decimals().call();
		return Math.pow(10, -decimals);
	} else
		return 1E-18;
}

exports.getBalance = async function getBalance(web3, tokenAddr, addresses, human) {
	let balances = [];

	let only1;
	if (typeof addresses == 'string') {
		addresses = [addresses];
		only1 = true;
	}

	let fac = human ? await exports.getDecimalFactor(web3, tokenAddr) : 1;
	let val;

	for (let i = 0; i < addresses.length; i++) {
		if (tokenAddr) {
			if (!erc20Contracts[tokenAddr])
				erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);

			val = await erc20Contracts[tokenAddr].methods.balanceOf(addresses[i]).call();
		} else
			val = await web3.eth.getBalance(addresses[i]);

		balances.push(human ? val * fac : val);
	}

	return only1 ? balances[0] : balances;
}

exports.getHistory = async function getHistory(web3, tokenAddr, addresses, fromBlock, human, lastBlock) {
	let fac = human ? await exports.getDecimalFactor(web3, tokenAddr) : 1;
	let res = {
		nextBlock: await web3.eth.getBlockNumber() + 1,
		transfers: []
	};
	if (fromBlock === null || fromBlock === undefined)
		fromBlock = res.nextBlock - 1;

	let addressObj = {}, allAddresses;
	if (typeof addresses == 'string')
		addressObj[addresses] = true;
	else if (addresses)
		for (let i = 0; i < addresses.length; i++)
			addressObj[addresses[i]] = true;
	else
		allAddresses = true;

	if (tokenAddr) {
		const count = tokenAddr == exports.TOKENS['MDSIM'] || tokenAddr == exports.TOKENS_POLYGON['MDSIM'] ? 100 : 2;

		if (!erc20Contracts[tokenAddr])
			erc20Contracts[tokenAddr] = new web3.eth.Contract(ERC20_ABI, tokenAddr);

		// To be safe, we do block to block, because otherwise the JSON gets too big for Web3
		for (let b = fromBlock | 0; b < res.nextBlock; b += count) {
			const raw = await erc20Contracts[tokenAddr].getPastEvents("Transfer", { fromBlock: b, toBlock: lastBlock && lastBlock < b + count - 1 ? lastBlock : b + count - 1 });
			for (let i = 0; i < raw.length; i++)
				if (raw[i].address == tokenAddr && (allAddresses || addressObj[raw[i].returnValues[0]] || addressObj[raw[i].returnValues[1]]))
					res.transfers.push({
						transaction: raw[i].transactionHash,
						from: raw[i].returnValues[0],
						to: raw[i].returnValues[1],
						amount: human ? raw[i].returnValues[2] * fac : raw[i].returnValues[2],
						timestamp: (await web3.eth.getBlock(raw[i].blockNumber)).timestamp
					});
		}
	} else {
		for (let i = fromBlock | 0; i < res.nextBlock; i++) {
			const block = await web3.eth.getBlock(i, true);
			if (block.transactions.length)
				for (let j = 0; j < block.transactions.length; j++) {
					if ((block.transactions[j].value | 0) && (allAddresses || addressObj[block.transactions[j].from] || addressObj[block.transactions[j].to]))
						res.transfers.push({
							transaction: block.transactions[j].hash,
							from: block.transactions[j].from,
							to: block.transactions[j].to,
							amount: human ? block.transactions[j].value * fac : block.transactions[j].value,
							timestamp: block.timestamp
						});
				}
		}
	}

	return res;
}

exports.sendPrivateKey = async function sendPrivateKey(web3, privateKey, query, to, value, gasFactor, onlyEstimate) {
	let account = accounts[privateKey];
	if (!account)
		account = accounts[privateKey] = await web3.eth.accounts.privateKeyToAccount(privateKey);

	if (onlyEstimate) {
		if (!query.estimateGas)
			query = await query('1000000000');
		return await query.estimateGas({ from: account.address, value });
	}

	let nonce = transactionCounts[account.address];
	if (nonce === undefined)
		nonce = await web3.eth.getTransactionCount(account.address, 'pending');
	transactionCounts[account.address] = nonce + 1;

	let gasPrice = '1000000000';
	if (!gasFactor)
		gasFactor = 1;

	while (true) {
		while (true) {
			let newPrice = await web3.eth.getGasPrice();
			newPrice = (new web3.utils.BN(newPrice)).mul(new web3.utils.BN(Math.round(gasFactor * 1000)).div(new web3.utils.BN(1000))).toString();
			if (gasPrice.length > newPrice.length || (gasPrice.length == newPrice.length && gasPrice >= newPrice))
				gasPrice = (new web3.utils.BN(gasPrice)).add(new web3.utils.BN('10000000000')).toString();
			else
				gasPrice = newPrice;
			if (new web3.utils.BN(gasPrice).gte(new web3.utils.BN('500000000000')))
				throw new Error('above 500 Gwei');

			break;
		}

		let queryTry = query.estimateGas ? query : await query(gasPrice);
		if (!queryTry)
			return;
		if (queryTry.length == 2) {
			value = queryTry[1];
			queryTry = queryTry[0];
		}

		let gas = await queryTry.estimateGas({ from: account.address, value });
		gas *= 2;
		if (gas > 7000000)
			gas = 7000000;

		const createTransaction = await account.signTransaction({
			from: account.address,
			to,
			data: queryTry.encodeABI(),
			gas,
			gasPrice,
			value,
			nonce
		});

		try {
			return await web3.eth.sendSignedTransaction(
				createTransaction.rawTransaction
			);
		} catch (e) {
			if (e.message && e.message.indexOf('not mined within') < 0)
				throw e;
		}
	}
}

exports.deployToken = async function deployToken(web3, privateKey, name, symbol, initialSupply, decimals, gasFactor, onlyEstimate) {
	const code = JSON.parse(await fs.promises.readFile(path.join(__dirname, 'contract.json'), 'utf8'));
	const contract = code.contracts['Token.sol'].Token;

	return await exports.deployContract(web3, privateKey, contract, gasFactor, onlyEstimate, name, '1', symbol, decimals, initialSupply);
}

exports.deployContract = async function deployContract(web3, privateKey, contract, gasFactor, onlyEstimate, ...args) {
	const contractObj = new web3.eth.Contract(contract.abi);
	const contractTx = contractObj.deploy({
		data: contract.evm.bytecode.object,
		arguments: args
	});

	const receipt = await exports.sendPrivateKey(web3, privateKey, contractTx, undefined, undefined, gasFactor, onlyEstimate);
	return onlyEstimate ? receipt : receipt.contractAddress;
}
