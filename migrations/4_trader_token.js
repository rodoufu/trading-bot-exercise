const TraderToken = artifacts.require("TraderToken");

module.exports = function(deployer) {
  deployer.deploy(TraderToken);
};
