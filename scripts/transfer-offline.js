const {
  apiHost,
  verifyNetworkId,
  verifyChainId,
  verifySenderAcctOffline,
  verifyReceiverAcctOffline,
  verifyAmountOffline,
  verifySenderPublicKey,
  verifySenderPrivateKey,
  printCurlCmd
} = require("../util/verify.js");

const { transfer } = require("../util/create-cmd.js");

async function runOfflineTransfer(
  node,
  networkId,
  chainId,
  senderAcct,
  receiverAcct,
  amount,
  senderPublicKey,
  senderPrivateKey
) {
  networkId = await verifyNetworkId(networkId);
  chainId = await verifyChainId(chainId);
  const host = apiHost(node, networkId, chainId);
  senderAcct = await verifySenderAcctOffline(senderAcct);
  receiverAcct = await verifyReceiverAcctOffline(receiverAcct);
  amount = await verifyAmountOffline(senderAcct, receiverAcct, amount);

  senderPublicKey = await verifySenderPublicKey(senderAcct, senderPublicKey);
  senderPrivateKey = await verifySenderPrivateKey(senderAcct, senderPrivateKey);
  return printCurlCmd(
    transfer.send(
      senderAcct,
      senderPublicKey,
      senderPrivateKey,
      receiverAcct,
      amount,
      chainId,
      networkId
    ),
    host
  );
}

module.exports = runOfflineTransfer;
