const {
  apiHost,
  verifyNetworkId,
  verifyCurrentChainId,
  verifyTargetChainId,
  verifySenderAcctOffline,
  verifyReceiverAcctOffline,
  verifyTargetChainGasPayerOffline,
  verifyTargetChainGasPayerPublicKeyOffline,
  verifyTargetChainGasPayerPrivateKeyOffline,
  verifyReceiverPublicKeyOffline,
  verifyAmountOffline,
  verifySenderPublicKey,
  verifySenderPrivateKey,
  verifyProof,
  askReviewCrossChain,
  printCurlCmd,
  printSPV,
} = require("../util/verify.js");

const { transferCrosschain } = require("../util/create-cmd.js");


async function runOfflineTransferCrossChain(node, networkId, chainId, targetChainId, senderAcct, receiverAcct, receiverPublicKey, amount, senderPublicKey, senderPrivateKey, targetChainGasPayerAcct, targetChainGasPayerPublicKey, targetChainGasPayerPrivateKey) {
  let proof;
  networkId = await verifyNetworkId(networkId);
  chainId = await verifyCurrentChainId(chainId);
  targetChainId = await verifyTargetChainId(chainId, targetChainId);
  const currentHost = apiHost(node, networkId, chainId);
  const targetHost = apiHost(node, networkId, targetChainId);
  senderAcct = await verifySenderAcctOffline(senderAcct);
  receiverAcct = await verifyReceiverAcctOffline(receiverAcct);
  receiverPublicKey = await verifyReceiverPublicKeyOffline(receiverAcct, receiverPublicKey);
  amount = await verifyAmountOffline(senderAcct, receiverAcct, amount);
  targetChainGasPayerAcct = await verifyTargetChainGasPayerOffline(targetChainGasPayerAcct);
  const receiverGuard = {
    pred: 'keys-all',
    keys: [receiverPublicKey]
  }
  await askReviewCrossChain(chainId, targetChainId, senderAcct, receiverAcct, amount, receiverGuard, targetChainGasPayerAcct);
  senderPublicKey =  await verifySenderPublicKey(senderAcct, senderPublicKey);
  senderPrivateKey = await verifySenderPrivateKey(senderAcct, senderPrivateKey);
  targetChainGasPayerPublicKey =  await verifyTargetChainGasPayerPublicKeyOffline(targetChainGasPayerAcct, targetChainGasPayerPublicKey, targetChainId);
  targetChainGasPayerPrivateKey = await verifyTargetChainGasPayerPrivateKeyOffline(targetChainGasPayerAcct, targetChainGasPayerPrivateKey, targetChainId);
  console.log("\nTHERE ARE 3 STEPS TO CROSS CHAIN TRANSFER. PLEASE READ CAREFULLY AND FOLLOW THE STEPS \n1. THIS STEP INITIATES THE TRANSFER ON SOURCE CHAIN")
  const pactId = printCurlCmd(transferCrosschain.stepOne(senderAcct, senderPublicKey, senderPrivateKey, receiverAcct, receiverPublicKey, amount, chainId, targetChainId, networkId), currentHost)
  console.log("\n2. THIS STEP FETCHES SPV PROOF IN SOURCE CHAIN - If you see the message, SPV target not reachable, try again after 30~120 seconds")
  printSPV(transferCrosschain.stepTwo(pactId, targetChainId), currentHost)
  proof = await verifyProof(proof);
  console.log("\n3. THIS STEP COMPLETES THE TRANSFER IN TARGET CHAIN")
  return printCurlCmd(transferCrosschain.stepThree(targetChainGasPayerAcct, targetChainGasPayerPublicKey, targetChainGasPayerPrivateKey, proof, pactId, targetChainId, networkId), targetHost)
}
