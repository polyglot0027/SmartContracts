var AssetsManager = artifacts.require("./AssetsManager.sol");
const Storage = artifacts.require('./Storage.sol');
const AssetsManagerAggregations = artifacts.require('./AssetsManagerAggregations.sol')

module.exports = function (deployer, network) {
    deployer
    .then(() => deployer.link(AssetsManagerAggregations, AssetsManager))
    .then(() => deployer.deploy(AssetsManager, Storage.address, 'AssetsManager'))

    .then(() => console.log("[MIGRATION] [" + parseInt(require("path").basename(__filename)) + "] AssetsManager deploy: #done"))
}
