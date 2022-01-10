'use strict';

const lib = require('./lib');

const FACTORY_ADDRESS = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';
const ROUTER_ADDRESS = '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff';

const FACTORY_ABI = [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "tokenA",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "tokenB",
					"type": "address"
				}
			],
			"name": "getPair",
			"outputs": [
				{
					"internalType": "address",
					"name": "pair",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
];
const ROUTER_ABI = [
{
			"inputs": [
				{
					"internalType": "address",
					"name": "tokenA",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "tokenB",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amountADesired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountBDesired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountAMin",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountBMin",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "deadline",
					"type": "uint256"
				}
			],
			"name": "addLiquidity",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "amountA",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountB",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "liquidity",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
{
			"inputs": [
				{
					"internalType": "address",
					"name": "tokenA",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "tokenB",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "liquidity",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountAMin",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountBMin",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "deadline",
					"type": "uint256"
				}
			],
			"name": "removeLiquidity",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "amountA",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountB",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "amountIn",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "amountOutMin",
					"type": "uint256"
				},
				{
					"internalType": "address[]",
					"name": "path",
					"type": "address[]"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "deadline",
					"type": "uint256"
				}
			],
			"name": "swapExactTokensForTokens",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "amounts",
					"type": "uint256[]"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		}
];

let poolContracts = {};
let routerContract, factoryContract;

exports.getBuyPrice = async function getBuyPrice(web3, buyTokenA, tokenA, tokenB) {
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  if (!factoryContract)
    factoryContract = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);
  const pairAddress = await (factoryContract.methods.getPair(tokenA, tokenB)).call();

   buyTokenA = new web3.utils.BN(buyTokenA);
   const tokenACount = new web3.utils.BN(await lib.getBalance(web3, tokenA, pairAddress));
   const tokenBCount = new web3.utils.BN(await lib.getBalance(web3, tokenB, pairAddress));

   return tokenACount.mul(tokenBCount).div(tokenACount.sub(buyTokenA)).sub(tokenBCount).mul(new web3.utils.BN(1000)).div(new web3.utils.BN(997)).toString();
}

exports.getSellPrice = async function getSellPrice(web3, sellTokenA, tokenA, tokenB) {
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  if (!factoryContract)
    factoryContract = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);
  const pairAddress = await (factoryContract.methods.getPair(tokenA, tokenB)).call();

   sellTokenA = new web3.utils.BN(sellTokenA);
   const tokenACount = new web3.utils.BN(await lib.getBalance(web3, tokenA, pairAddress));
   const tokenBCount = new web3.utils.BN(await lib.getBalance(web3, tokenB, pairAddress));

   return tokenBCount.sub(tokenACount.mul(tokenBCount).div(tokenACount.add(sellTokenA))).mul(new web3.utils.BN(997)).div(new web3.utils.BN(1000)).toString();
}

exports.getPrice = async function getPrice(web3, tokenA, tokenB) {
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  const tokenADecimals = await lib.tokenDecimals(web3, tokenA);
  const tokenBDecimals = await lib.tokenDecimals(web3, tokenB);
  let inV = '1';
  for (let i = 0; i < tokenADecimals - 2; i++)
    inV += '0';

  // Pool.sqrtPriceX96 is not updated constantly. This is better.
  return (0.5 * (await exports.getSellPrice(web3, inV, tokenA, tokenB)) / (1 - 3000 * 0.000001)
    + 0.5 * (await exports.getBuyPrice(web3, inV, tokenA, tokenB)) * (1 - 3000 * 0.000001))
    / Math.pow(10, tokenBDecimals - 2);
}

exports.getPriceRaw = async function getPriceRaw(web3, amountTokenA, tokenA, tokenB) {
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  const tokenADecimals = await lib.tokenDecimals(web3, tokenA);
  const tokenBDecimals = await lib.tokenDecimals(web3, tokenB);

  // Pool.sqrtPriceX96 is not updated constantly. This is better.
  return (new web3.utils.BN(await exports.getSellPrice(web3, amountTokenA, tokenA, tokenB))).mul(new web3.utils.BN(500)).div(new web3.utils.BN(997)).add((new web3.utils.BN(await exports.getBuyPrice(web3, amountTokenA, tokenA, tokenB))).mul(new web3.utils.BN(997)).div(new web3.utils.BN(2000))).toString();
}

exports.getMATICPrice = async function getETHPrice(web3) {
  let prices = await Promise.all([
    exports.getPrice(web3, null, lib.TOKENS_POLYGON['USDC']),
    exports.getPrice(web3, null, lib.TOKENS_POLYGON['USDT']),
    exports.getPrice(web3, null, lib.TOKENS_POLYGON['DAI'])
  ]);

  prices.sort();
  return prices[1];
}

exports.setupApproval = async function setupApproval(web3, privateKey, tokenAddr, gasFactor, onlyEstimate) {
  if (!tokenAddr)
	return;

  await lib.approve(web3, privateKey, tokenAddr, ROUTER_ADDRESS, undefined, gasFactor, onlyEstimate);
}

exports.addLiquidity = async function(web3, privateKey, tokenA, amountTokenA, tokenB) {
  const to = await lib.getPrivateKeyAddress(web3, privateKey);
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  if (!routerContract)
    routerContract = new web3.eth.Contract(ROUTER_ABI, ROUTER_ADDRESS);

  const tokenADecimals = await lib.tokenDecimals(web3, tokenA);
  const tokenBDecimals = await lib.tokenDecimals(web3, tokenB);

  const amountTokenB = (new web3.utils.BN(2)).pow(new web3.utils.BN(256)).sub(new web3.utils.BN(1)).toString();
  const SLIPPAGE = 990;
  let count = (await exports.getPrice(web3, tokenA, tokenB)) * 1e18;

  let amountOutMin = (new web3.utils.BN(await exports.getPriceRaw(web3, amountTokenA, tokenA, tokenB))).mul(new web3.utils.BN(SLIPPAGE)).div(new web3.utils.BN(1000)).toString();
   await lib.sendPrivateKey(web3, privateKey, routerContract.methods.addLiquidity(
	tokenA, tokenB, amountTokenA, amountTokenB, amountTokenA, amountOutMin, to, ((new Date().getTime() * 0.001) + 3600) | 0
   ), ROUTER_ADDRESS, 0);
}

exports.removeLiquidity = async function(web3, privateKey, tokenA, amountTokenA, tokenB) {
  if (!tokenA)
    tokenA = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenB)
    tokenB = lib.TOKENS_POLYGON['WMATIC'];

  if (!routerContract)
    routerContract = new web3.eth.Contract(ROUTER_ABI, ROUTER_ADDRESS);
}


exports.swap = async function(web3, privateKey, tokenIn, amountTokenIn, tokenOut) {
  const to = await lib.getPrivateKeyAddress(web3, privateKey);
  if (!tokenIn)
    tokenIn = lib.TOKENS_POLYGON['WMATIC'];
  if (!tokenOut)
    tokenOut = lib.TOKENS_POLYGON['WMATIC'];

  if (!routerContract)
    routerContract = new web3.eth.Contract(ROUTER_ABI, ROUTER_ADDRESS);

  const SLIPPAGE = 990;
  let amountOutMin = (new web3.utils.BN(await exports.getSellPrice(web3, amountTokenIn, tokenIn, tokenOut))).mul(new web3.utils.BN(SLIPPAGE)).div(new web3.utils.BN(1000)).toString();

   await lib.sendPrivateKey(web3, privateKey, routerContract.methods.swapExactTokensForTokens(
	amountTokenIn, amountOutMin, [tokenIn, tokenOut], to, ((new Date().getTime() * 0.001) + 3600) | 0
   ), ROUTER_ADDRESS, 0);
}
