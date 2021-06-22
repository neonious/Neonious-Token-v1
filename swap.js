'use strict';

const lib = require('./lib');

const univ3 = require('@uniswap/v3-sdk');
const uni = require('@uniswap/sdk');

const QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const SWAPROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const QUOTER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint160",
        "name": "sqrtPriceLimitX96",
        "type": "uint160"
      }
    ],
    "name": "quoteExactInputSingle",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
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
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint160",
        "name": "sqrtPriceLimitX96",
        "type": "uint160"
      }
    ],
    "name": "quoteExactOutputSingle",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const SWAPROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountInMaximum",
            "type": "uint256"
          },
          {
            "internalType": "uint160",
            "name": "sqrtPriceLimitX96",
            "type": "uint160"
          }
        ],
        "internalType": "struct ISwapRouter.ExactOutputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactOutputSingle",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMinimum",
            "type": "uint256"
          },
          {
            "internalType": "uint160",
            "name": "sqrtPriceLimitX96",
            "type": "uint160"
          }
        ],
        "internalType": "struct ISwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];
const POOL_ABI = [{
  "inputs": [],
  "name": "slot0",
  "outputs": [
    {
      "internalType": "uint160",
      "name": "sqrtPriceX96",
      "type": "uint160"
    },
    {
      "internalType": "int24",
      "name": "tick",
      "type": "int24"
    },
    {
      "internalType": "uint16",
      "name": "observationIndex",
      "type": "uint16"
    },
    {
      "internalType": "uint16",
      "name": "observationCardinality",
      "type": "uint16"
    },
    {
      "internalType": "uint16",
      "name": "observationCardinalityNext",
      "type": "uint16"
    },
    {
      "internalType": "uint8",
      "name": "feeProtocol",
      "type": "uint8"
    },
    {
      "internalType": "bool",
      "name": "unlocked",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}
];

let poolContracts = {};
let quoterContract, swapRouterContract;

exports.getBuyPrice = async function getBuyPrice(web3, buyTokenA, tokenA, tokenB, uniFee) {
  if (!tokenA)
    tokenA = lib.TOKENS['WETH'];
  if (!tokenB)
    tokenB = lib.TOKENS['WETH'];
  if (!uniFee)
    uniFee = 3000;

  if (!quoterContract)
    quoterContract = new web3.eth.Contract(QUOTER_ABI, QUOTER_ADDRESS);
  return await quoterContract.methods.quoteExactOutputSingle(tokenB, tokenA, uniFee, buyTokenA, 0).call();
}

exports.getSellPrice = async function getSellPrice(web3, sellTokenA, tokenA, tokenB, uniFee) {
  if (!tokenA)
    tokenA = lib.TOKENS['WETH'];
  if (!tokenB)
    tokenB = lib.TOKENS['WETH'];
  if (!uniFee)
    uniFee = 3000;

  if (!quoterContract)
    quoterContract = new web3.eth.Contract(QUOTER_ABI, QUOTER_ADDRESS);
  return await quoterContract.methods.quoteExactInputSingle(tokenA, tokenB, uniFee, sellTokenA, 0).call();
}

exports.getPrice = async function getPrice(web3, tokenA, tokenB, uniFee) {
  if (!tokenA)
    tokenA = lib.TOKENS['WETH'];
  if (!tokenB)
    tokenB = lib.TOKENS['WETH'];
  if (!uniFee)
    uniFee = 3000;

  const tokenADecimals = await lib.tokenDecimals(web3, tokenA);
  const tokenBDecimals = await lib.tokenDecimals(web3, tokenB);
  let inV = '1';
  for (let i = 0; i < tokenADecimals; i++)
    inV += '0';

  // Pool.sqrtPriceX96 is not updated constantly. This is better.
  return (0.5 * await exports.getSellPrice(web3, inV, tokenA, tokenB, uniFee)
    + 0.5 * await exports.getBuyPrice(web3, inV, tokenA, tokenB, uniFee))
    / Math.pow(10, tokenBDecimals);
}

exports.getETHPrice = async function getETHPrice(web3) {
  let prices = await Promise.all([
    exports.getPrice(web3, null, lib.TOKENS['USDC']),
    exports.getPrice(web3, null, lib.TOKENS['USDT']),
    exports.getPrice(web3, null, lib.TOKENS['DAI'])
  ]);

  prices.sort();
  return prices[1];
}

exports.setupApproval = async function setupApproval(web3, privateKey, tokenAddr, gasFactor, onlyEstimate) {
  if (!tokenAddr)
	return;

  await lib.approve(web3, privateKey, tokenAddr, SWAPROUTER_ADDRESS, undefined, gasFactor, onlyEstimate);
}

exports.transferWithSwap = async function transferWithSwap(web3, privateKey, tokenAddr, to, amount, tokenAddrOut, uniFee, subtractFees, gasFactor, onlyEstimate) {
  let directETH = false;
  if (!tokenAddr) {
    tokenAddr = lib.TOKENS['WETH'];
    directETH = true;
  }
  if(!to)
    to = await lib.getPrivateKeyAddress(web3, privateKey);
  if (!tokenAddrOut)
    tokenAddrOut = lib.TOKENS['WETH'];
  if (!uniFee)
    uniFee = 3000;

  if (!swapRouterContract)
    swapRouterContract = new web3.eth.Contract(SWAPROUTER_ABI, SWAPROUTER_ADDRESS);

  const SLIPPAGE = 990;
  let amountOutMin = (new web3.utils.BN(await exports.getSellPrice(web3, amount, tokenAddr, tokenAddrOut, uniFee))).mul(new web3.utils.BN(SLIPPAGE)).div(new web3.utils.BN(1000)).toString();

  let gas;
  if (subtractFees)
    gas = await lib.sendPrivateKey(web3, privateKey, swapRouterContract.methods.exactInputSingle(
      [tokenAddr, tokenAddrOut, uniFee, to, ((new Date().getTime() * 0.001) + 3600) | 0, amount, amountOutMin, 0]
    ), SWAPROUTER_ADDRESS, directETH ? amount : 0, undefined, true);

  return await lib.sendPrivateKey(web3, privateKey, async (gasPrice) => {
    let tryAmount, tryAmountWithUni;
    if (subtractFees)
      tryAmount = (new web3.utils.BN(amount)).sub((new web3.utils.BN(gas)).mul(new web3.utils.BN(gasPrice))).toString();
    else
      tryAmount = amount;
      if (tryAmount == '0' || tryAmount[0] == '-')
        return;

    amountOutMin = (new web3.utils.BN(await exports.getSellPrice(web3, tryAmount, tokenAddr, tokenAddrOut, uniFee))).mul(new web3.utils.BN(SLIPPAGE)).div(new web3.utils.BN(1000)).toString();
    return [swapRouterContract.methods.exactInputSingle(
      [tokenAddr, tokenAddrOut, uniFee, to, ((new Date().getTime() * 0.001) + 3600) | 0, tryAmount, amountOutMin, 0]), directETH ? tryAmount : 0];
  }, SWAPROUTER_ADDRESS, directETH ? amount : 0, gasFactor, onlyEstimate);
}

// TODO: when we implement a exact output swapping, remember we need to call refundETH if we do this with ETH
