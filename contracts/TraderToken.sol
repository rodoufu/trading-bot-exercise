// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TraderToken is ERC20 {
	constructor(uint256 initialSupply) public ERC20("TraderToken", "TRD") {
		_mint(msg.sender, initialSupply);
	}
}
