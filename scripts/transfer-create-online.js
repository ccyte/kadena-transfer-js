// Uncomment only if using self-signed certificate node;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const {
  apiHost,
  verifyNode,
  verifyChainId,
  verifySenderAcctOnline,
  verifyReceiverAcctTransferCreateOnline,
  verifyReceiverPublicKeyOnline,
  verifyAmountOnline,
  verifySenderPublicKey,
  verifySenderPrivateKey,
  printPreview,
  printCurlCmd
} = require("../util/verify.js");

const { transferCreate } = require("../util/create-cmd.js");

async function runOnlineTransferCreate(
  node,
  chainId,
  senderAcct,
  receiverAcct,
  receiverPublicKey,
  amount,
  senderPublicKey,
  senderPrivateKey
) {
  nodeInfo = await verifyNode(node);
  node = nodeInfo.node;
  networkId = nodeInfo.networkId;
  chainId = await verifyChainId(chainId);
  host = apiHost(node, networkId, chainId);
  senderInfo = await verifySenderAcctOnline(senderAcct, chainId, host);
  senderDetails = senderInfo.details;
  senderAcct = senderInfo.account;
  receiverInfo = await verifyReceiverAcctTransferCreateOnline(
    receiverAcct,
    chainId,
    host
  );
  receiverDetails = receiverInfo.details;
  receiverAcct = receiverInfo.account;
  receiverPublicKey = await verifyReceiverPublicKeyOnline(
    receiverAcct,
    receiverPublicKey,
    receiverDetails,
    chainId,
    host
  );
  amount = await verifyAmountOnline(
    senderAcct,
    senderDetails,
    receiverAcct,
    amount
  );

  senderPublicKey = await verifySenderPublicKey(senderAcct, senderPublicKey);
  senderPrivateKey = await verifySenderPrivateKey(senderAcct, senderPrivateKey);
  await printPreview(
    transferCreate.local(
      senderAcct,
      senderPublicKey,
      senderPrivateKey,
      receiverAcct,
      receiverPublicKey,
      amount,
      chainId
    ),
    host
  );
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

module.exports = runOnlineTransferCreate;
