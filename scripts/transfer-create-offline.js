const {
  apiHost,
  verifyNetworkId,
  verifyChainId,
  verifySenderAcctOffline,
  verifyReceiverAcctOffline,
  verifyReceiverPublicKeyOffline,
  verifyAmountOffline,
  verifySenderPublicKey,
  verifySenderPrivateKey,
  printCurlCmd
} = require("../util/verify.js");

const { transferCreate } = require("../util/create-cmd.js");

async function runOfflineTransferCreate(
  node,
  networkId,
  chainId,
  senderAcct,
  receiverAcct,
  receiverPublicKey,
  amount,
  senderPublicKey,
  senderPrivateKey
) {
  networkId = await verifyNetworkId(networkId);
  chainId = await verifyChainId(chainId);
  const host = apiHost(node, networkId, chainId);
  senderAcct = await verifySenderAcctOffline(senderAcct);
  receiverAcct = await verifyReceiverAcctOffline(receiverAcct);
  receiverPublicKey = await verifyReceiverPublicKeyOffline(
    receiverAcct,
    receiverPublicKey
  );
  amount = await verifyAmountOffline(senderAcct, receiverAcct, amount);
  senderPublicKey = await verifySenderPublicKey(senderAcct, senderPublicKey);
  senderPrivateKey = await verifySenderPrivateKey(senderAcct, senderPrivateKey);
  return printCurlCmd(
    transferCreate.send(
      senderAcct,
      senderPublicKey,
      senderPrivateKey,
      receiverAcct,
      receiverPublicKey,
      amount,
      chainId,
      networkId
    ),
    host
  );
}

module.exports = runOfflineTransferCreate;
