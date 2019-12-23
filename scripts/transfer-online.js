// Uncomment only if using self-signed certificate node;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const {
  apiHost,
  verifyNode,
  verifyChainId,
  verifySenderAcctOnline,
  verifyReceiverAcctTransferOnline,
  verifyAmountOnline,
  verifySenderPublicKey,
  verifySenderPrivateKey,
  printPreview,
  printCurlCmd,
} = require("../util/verify.js");

const { transfer } = require("../util/create-cmd.js");

async function runOnlineTransfer(
  node,
  chainId,
  senderAcct,
  receiverAcct,
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
  receiverInfo = await verifyReceiverAcctTransferOnline(
    receiverAcct,
    chainId,
    host
  );
  receiverAcct = receiverInfo.account;
  amount = await verifyAmountOnline(
    senderAcct,
    senderDetails,
    receiverAcct,
    amount
  );
  senderPublicKey = await verifySenderPublicKey(senderAcct, senderPublicKey);
  senderPrivateKey = await verifySenderPrivateKey(senderAcct, senderPrivateKey);
  await printPreview(
    transfer.local(
      senderAcct,
      senderPublicKey,
      senderPrivateKey,
      receiverAcct,
      amount,
      chainId
    ),
    host
  );
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

module.exports = runOnlineTransfer;
