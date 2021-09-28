# Neonious Token v1

The Neonious Token (MDSIM) as described in the Neonious Whitepaper v4.

Link to whitepaper: https://www.neonious.org/static/Neonious-Token-Whitepaper-v4.pdf


## Node.JS Lib

In lib.js you can find a Node.JS API for

- deployment of Neonious Token test contract
- transfer of ETH + ERC20
- delegated ("gasless") transfer via EIP-3009 as supported by MDSIM or USDC
- transfer to many as supported by MDSIM (cheaper gas / transfer)
- and misc functions

In swap-uniswap-v3.js and swap-quickswap-js you can find a Node.JS API for

- getting the current ETH/USD price based on median of USDC/USDT/DAI
- getting a Uniswap v3 pair price, in average and for selling/buying tokens
- swapping / transfering with swap
- adding liquidity (only Quickswap for now)

Also includes full unit test for transfer functions at test/test.js. Please see that code to learn how the API can be called.



## Deployed Token Address

The token is deployed at

Ethereum: 0xDa48C42517AFfB3BF3FC13CE26561092e1a61A80

Polygon:  0xE454034b75Bb9D017f21228e61b9Ddbc889623C0

View in Etherscan:   https://etherscan.io/token/0xDa48C42517AFfB3BF3FC13CE26561092e1a61A80

View in Polygonscan: https://polygonscan.com/token/0xE454034b75Bb9D017f21228e61b9Ddbc889623C0

## Gas Costs (Ethereum)

for ETH transfer: 21.000 (as a reference)

for MDSIM transfer: 51.195


for MDSIM transferToMany with 2 addresses: 59.036

for MDSIM transferToMany with 3 addresses: 65.538

any additional address: 6.502


for MDSIM delegated ("gasless") transfer: 83.043


## Testing

Testing was done with a private Ethereum network, based on the genesis block defined in test/CustomGenesis.json.
