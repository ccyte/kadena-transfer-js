const Pact = require("pact-lang-api");
const fetch = require("node-fetch");
const apiHost = (node, networkId, chainId) =>
  `https://${node}/chainweb/0.0/${networkId}/chain/${chainId}/pact`;
const chains = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const creationTime = () => Math.round(new Date().getTime() / 1000) - 15;

async function verifyNode(server) {
  try {
    const nodeInfo = await fetch(`https://${server}/info`);
    const nodeInfoJSON = await nodeInfo.json();
    return { node: server, networkId: nodeInfoJSON.nodeVersion };
  } catch (e) {
    console.log(`\n`, e);
    exitMessage("Node was not verified");
  }
}

async function verifyNetworkId(networkId) {
  if (networkId === "") return "mainnet01";
  return networkId;
}

async function verifyChainId(chainId) {
  if (chains.indexOf(chainId.toString()) === -1) {
    exitMessage("Please Choose from 0 to 9");
  }
  return chainId.toString();
}

async function verifyCurrentChainId(chainId) {
  if (chains.indexOf(chainId.toString()) === -1) {
    exitMessage("Please Choose from 0 to 9");
  }
  return chainId.toString();
}

async function verifyTargetChainId(chainId, targetChainId) {
  if (chainId === targetChainId)
    exitMessage(
      "Use single chain transfer. You've selected the the same chain as Target Chain"
    );
  if (chains.indexOf(targetChainId.toString()) === -1) {
    exitMessage("Please Choose from 0 to 9");
  }
  return targetChainId.toString();
}

//online, offline
async function verifySenderAcctOffline(accountName) {
  checkAccountName(accountName);
  return accountName;
}

function checkAccountName(accountName) {
  if (accountName.length < 3) {
    exitMessage("Account name is too short!");
  }
  if (accountName.length > 256) {
    exitMessage("Account name is too long!");
  }
}

async function verifySenderAcctOnline(accountName, chainId, host) {
  checkAccountName(accountName);
  const accountInfo = await getDetails(accountName, chainId, host);
  if (!accountInfo) exitMessage("SENDER DOES NOT EXIST");
  return accountInfo;
}

async function verifyReceiverAcctOffline(accountName) {
  checkAccountName(accountName);
  return accountName;
}

async function verifyTargetChainGasPayerOffline(accountName) {
  checkAccountName(accountName);
  return accountName;
}

async function verifyTargetChainGasPayerPublicKeyOffline(
  account,
  key,
  chainId
) {
  checkKey(key);
  return key;
}

async function verifyTargetChainGasPayerPrivateKeyOffline(
  account,
  key,
  chainId
) {
  checkSecretKey(key);
  if (key.length === 128) return key.slice(0, 64);
  else return key;
}

async function verifyReceiverAcctTransferOnline(accountName, chainId, host) {
  checkAccountName(accountName);
  const accountInfo = await getDetails(accountName, chainId, host);
  if (!accountInfo) exitMessage("RECEIVER DOES NOT EXIST");
  return accountInfo;
}

async function verifyReceiverAcctTransferCreateOnline(
  accountName,
  chainId,
  host
) {
  checkAccountName(accountName);
  const accountInfo = await getDetails(accountName, chainId, host);
  if (!accountInfo) return { account: accountName, details: false };
  else return accountInfo;
}

async function verifyReceiverPublicKeyOffline(account, key) {
  checkKey(key);
  return key;
}

async function verifyReceiverPublicKeyOnline(
  account,
  key,
  accountDetails,
  chainId,
  host
) {
  if (!accountDetails)
    console.log(
      "Receiver Doesn't exist. You'll create account when you transfer."
    );
  checkKey(key);
  if (accountDetails) {
    if (accountDetails.guard.keys.length > 1)
      exitMessage("Receiver has a multi-sig guard");
    if (accountDetails.guard.keys[0] === key) {
      return key;
    } else {
      exitMessage("Receiver already exists but Receiver Guards don't match");
    }
  } else {
    return key;
  }
}

async function verifyAmountOnline(
  senderAcct,
  senderDetails,
  receiverAcct,
  amount,
  mode
) {
  if (isNaN(Number(amount))) {
    exitMessage("Please enter number for the amount");
  } else if (senderDetails.balance <= Number(amount)) {
    exitMessage(
      `Sender Account Balance, ${senderDetails.balance} KDA,  is insufficient for this transfer.`
    );
  }
  return Number(amount);
}

async function verifyAmountOffline(senderAcct, receiverAcct, amount, mode) {
  if (isNaN(Number(amount))) {
    exitMessage("Please enter number for the amount");
  } else return Number(amount);
}

async function verifySenderPublicKey(account, key) {
  checkKey(key);
  return key;
}

async function verifySenderPrivateKey(account, key) {
  checkSecretKey(key);
  if (key.length === 128) return key.slice(0, 64);
  else return key;
}

async function verifyProof(proof) {
  return proof;
}

async function askReview(chainId, senderAcct, receiverAcct, amount, receiverG) {
  if (receiverG)
    console.log(
      `Review Transfer Details: \n\n CHAIN ID: "${chainId}"\n SENDER: "${senderAcct}"\n RECEIVER: "${receiverAcct}"\n RECEIVER GUARD:\n\n"${JSON.stringify(
        receiverG
      )}"\n\n AMOUNT: ${amount} KDA`
    );
  else
    console.log(
      `Review Transfer Details: \n\n CHAIN ID: "${chainId}"\n SENDER: "${senderAcct}"\n RECEIVER: "${receiverAcct}"\n AMOUNT: ${amount} KDA`
    );
}

async function askReviewCrossChain(
  sourceChainId,
  targetChainId,
  senderAcct,
  receiverAcct,
  amount,
  receiverG,
  gasPayerAccount
) {
  if (receiverG)
    console.log(
      `Review Transfer Details: \n\n SOURCE CHAIN ID: "${sourceChainId}"\n TARGET CHAIN ID: "${targetChainId}"\n SENDER: "${senderAcct}"\n RECEIVER: "${receiverAcct}"\n TARGET CHAIN GAS PAYER: "${gasPayerAccount}"\n RECEIVER GUARD:\n\n"${JSON.stringify(
        receiverG
      )}"\n\n AMOUNT: ${amount} KDA`
    );
  else
    console.log(
      `Review Transfer Details: \n\n CHAIN ID: "${chainId}"\n SENDER: "${senderAcct}"\n RECEIVER: "${receiverAcct}"\n AMOUNT: ${amount} KDA`
    );
}

async function printPreview(localCmd, host) {
  const gasPrice = JSON.parse(localCmd.cmd).meta.gasPrice;
  const gasLimit = JSON.parse(localCmd.cmd).meta.gasLimit;
  try {
    const preview = await fetch(`${host}/api/v1/local`, mkReq(localCmd));
    const res = await preview.json();
    const gasOnFailure = (res.gas * gasPrice).toFixed(12);
    const gasOnSuccess = (gasPrice * gasLimit).toFixed(12);
    const view = JSON.stringify(res);
    if (res.result.status === "failure") {
      exitMessage(
        `\nYour tx will fail with the following details\n\n ${view}\n\nExpected Gas Consumption on Failure is: ${gasOnFailure}\nInvestigate issue and try again!`
      );
    } else if (res.result.status) {
      console.log(
        `\nHere's a preview of your TX result! \n\n ${view}\n\nExpected Gas Consumption on Success is: ${gasOnSuccess}\nExpected Gas Consumption on Failure is: ${gasOnFailure}`
      );
    }
  } catch (e) {
    exitMessage("\nSorry, Preview failed. \n" + e);
  }
}

function printCurlCmd(sendCmd, host) {
  const reqKey = sendCmd.cmds[0].hash;
  console.log(
    `\nHere you go! \n\nSTEP 1) MAKE TRANSFER \n\ncurl -X POST -H 'Content-Type:application/json' ${host}/api/v1/send -d '${JSON.stringify(
      sendCmd
    )}'\n\nSTEP 2) LOOK UP TX RESULT (You can call this as many times as you want) \n\ncurl -X POST -H 'Content-Type:application/json' ${host}/api/v1/listen -d '{"listen": "${reqKey}"}' \n\n`
  );
  return sendCmd.cmds[0].hash;
}

function printSPV(spvCmd, host) {
  console.log(
    `\nHere you go! \n\ncurl -X POST -H 'Content-Type:application/json' ${host}/spv -d '${JSON.stringify(
      spvCmd
    )}'\n\nContinue after you've fetched the proof on current chain\n`
  );
}

function printCmd(sendCmd) {
  console.log(`\nHere you go! \n\n${JSON.stringify(sendCmd)} \n\n`);
  return sendCmd.cmds[0].hash;
}

async function executeCmd(sendCmd, host) {
  try {
    console.log("\nSending to the Node... \n\n", JSON.stringify(sendCmd));
    const res = await fetch(`${host}/api/v1/send`, mkReq(sendCmd));
    const resJSON = await res.json();
    try {
      console.log("\n Listening For the Response... \n\n", resJSON);
      const listen = await fetch(
        `${host}/api/v1/listen`,
        mkReq({ listen: resJSON.requestKeys[0] })
      );
      const listenJSON = await listen.json();
      console.log("\nHere's your result!! \n\n", resJSON);
      return listen;
    } catch (e) {
      exitMessage("\nSorry, LISTENING failed. \n" + e);
    }
  } catch (e) {
    exitMessage("\nSorry, TX failed. \n" + e);
  }
}

const exitMessage = msg => {
  // console.log("EXITING - ", msg)
  // process.exit()
  throw new Error(msg);
};

const is_hexadecimal = str => {
  const regexp = /^[0-9a-fA-F]+$/;
  if (regexp.test(str)) return true;
  else return false;
};

const checkKey = key => {
  if (key.length !== 64) {
    exitMessage("Key does not have length of 64");
  } else if (!is_hexadecimal(key)) {
    exitMessage("Key is not hex string");
  }
};

const checkSecretKey = key => {
  if (key.length !== 64 && key.length !== 128) {
    exitMessage("Key does not have the correct length");
  } else if (!is_hexadecimal(key)) {
    exitMessage("Key is not hex string");
  }
};

const mkReq = function(cmd) {
  return {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cmd)
  };
};

const getDetails = async function(account, chainId, host) {
  try {
    const accountInfo = await Pact.fetch.local(
      {
        pactCode: `(coin.details "${account}")`,
        keyPairs: Pact.crypto.genKeyPair(),
        meta: Pact.lang.mkMeta(
          account,
          chainId,
          0.00001,
          600,
          creationTime(),
          600
        )
      },
      host
    );
    if (accountInfo.result.status === "failure") {
      return null;
    } else if (accountInfo.result.status === "success") {
      accountDetails = accountInfo.result.data;
      return { account: account, details: accountDetails };
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  apiHost: apiHost,
  verifyNode: verifyNode,
  verifyNetworkId: verifyNetworkId,
  verifyChainId: verifyChainId,
  verifySenderAcctOnline: verifySenderAcctOnline,
  verifySenderAcctOffline: verifySenderAcctOffline,
  verifyReceiverAcctOffline: verifyReceiverAcctOffline,
  verifyTargetChainGasPayerOffline: verifyTargetChainGasPayerOffline,
  verifyTargetChainGasPayerPublicKeyOffline: verifyTargetChainGasPayerPublicKeyOffline,
  verifyTargetChainGasPayerPrivateKeyOffline: verifyTargetChainGasPayerPrivateKeyOffline,
  verifyReceiverAcctTransferOnline: verifyReceiverAcctTransferOnline,
  verifyReceiverAcctTransferCreateOnline: verifyReceiverAcctTransferCreateOnline,
  verifyReceiverPublicKeyOnline: verifyReceiverPublicKeyOnline,
  verifyReceiverPublicKeyOffline: verifyReceiverPublicKeyOffline,
  verifyAmountOnline: verifyAmountOnline,
  verifyAmountOffline: verifyAmountOffline,
  verifySenderPublicKey: verifySenderPublicKey,
  verifySenderPrivateKey: verifySenderPrivateKey,
  verifyCurrentChainId: verifyCurrentChainId,
  verifyTargetChainId: verifyTargetChainId,
  verifyProof: verifyProof,
  askReview: askReview,
  askReviewCrossChain: askReviewCrossChain,
  printPreview: printPreview,
  printSPV: printSPV,
  printCurlCmd: printCurlCmd,
  printCmd: printCmd,
  executeCmd: executeCmd
};
