const Trader = artifacts.require("Trader");

module.exports = function(deployer) {
  deployer.deploy(Trader);
};
