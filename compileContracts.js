'use strict';

/*
 * compileContracts.js
 *
 * My script to compile the token from the contract code
 * No need for running it, as contract.json is pushed in this repository
 * 
 * Also creates contract-in.json for Etherscan
 */

const fs = require('fs');
const path = require('path');

const solc = require('solc');

function findImports(dependency) {
	let code;
	try {
		code = fs.readFileSync(path.join(__dirname, 'node_modules', dependency), 'utf8');
	} catch(e) {
		code = fs.readFileSync(path.join(__dirname, 'contract', dependency), 'utf8');
	}

	return { content: code };
}

async function compile(file, pathIn, pathOut) {
	const code = await fs.promises.readFile(path.join(__dirname, pathIn), 'utf8');

	let sources = {};
	sources[file] = { content: code };

	const files = [
		'@openzeppelin/contracts/math/SafeMath.sol',
		'@openzeppelin/contracts/utils/Address.sol',
		'lib/IERC20Internal.sol',
		'lib/EIP3009.sol',
		'lib/EIP712.sol',
		'lib/EIP712Domain.sol',
		'lib/ECRecover.sol'
	];
	for(let i = 0; i < files.length; i++)
		sources[files[i]] = findImports(files[i]);

	const inJSON = JSON.stringify({
		language: 'Solidity',
		sources,
		settings: { outputSelection: { '*': { '*': ['*'] } } }
	}, null, 2);
	await fs.promises.writeFile(path.join(__dirname, 'contract-in.json'),  inJSON);

	const res = JSON.parse(solc.compile(inJSON, { import: (dependency) => {
		console.error('Dependency ' + dependency + ' was not in list. Please add and retry');
		process.exit(1);
	} }));

	await fs.promises.writeFile(path.join(__dirname, pathOut), JSON.stringify(res, null, 2));
}

async function run() {
	await compile('Token.sol', 'contract/Token.sol', 'contract.json');

	// Needed because solc keeps program running
	process.exit(0);
}
run();
