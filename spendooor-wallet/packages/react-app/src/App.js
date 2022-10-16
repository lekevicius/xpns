import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress, useContractFunction } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header } from "./components";

import useLocalStorage from 'react-use-localstorage';
import { Wallet, utils, getDefaultProvider, ethers } from "ethers"

import useWalletConnect from "./useWalletConnect"

import { addresses, abis } from "./contract";

// import { addresses, abis } from "@my-app/contracts";

// function WalletButton() {
//   const [rendered, setRendered] = useState("");

//   const { ens } = useLookupAddress();
//   const { account, activateBrowserWallet, deactivate, error } = useEthers();

//   useEffect(() => {
//     if (ens) {
//       setRendered(ens);
//     } else if (account) {
//       setRendered(shortenAddress(account));
//     } else {
//       setRendered("");
//     }
//   }, [account, ens, setRendered]);

//   useEffect(() => {
//     if (error) {
//       console.error("Error while connecting wallet:", error.message);
//     }
//   }, [error]);

//   return (
//     <Button
//       onClick={() => {
//         if (!account) {
//           activateBrowserWallet();
//         } else {
//           deactivate();
//         }
//       }}
//     >
//       {rendered === "" && "Connect Wallet"}
//       {rendered !== "" && rendered}
//     </Button>
//   );
// }

function App() {

  /*
  TODOS:

  - paste WalletConnect and save connection
  - get dispatch events
  - send mint tx from tickets frontend
  - receive tx and do something with it
  
  - Setup ethers provider with wallet info
  - Adjust config to point to ArbitrumGoerli

  */

  const [xpnsPriv, setXpnsPriv] = useLocalStorage('xpns_priv');
  const [xpnsContract, setXpnsContract] = useLocalStorage('xpns_contract');

  let privateKey;
  if (!xpnsPriv) {
    const newWallet = Wallet.createRandom()
    setXpnsPriv(newWallet.privateKey)
    privateKey = newWallet.privateKey
  } else {
    privateKey = xpnsPriv
  }

  const wallet = new Wallet(privateKey);
  const [addr, setAddr] = useState(wallet.address)


  const [privInput, setPrivInput] = useState("");
  const onSavePrivInput = () => {
    setXpnsPriv(privInput)
    setPrivInput("")
    const wallet = new Wallet(privInput);
    setAddr(wallet.address);
  }

  const [contractInput, setContractInput] = useState("");
  const onSaveContractInput = () => {
    setXpnsContract(contractInput)
  }

  const { account, activate, deactivate, chainId } = useEthers()

  const [wcInput, setWcInput] = useState("");
  const onWCConnect = () => {
    console.log(wcInput)
    connect({ uri: wcInput })
  }

  // console.log(chainId)
  // var customHttpProvider = new ethers.providers.JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc")
  // const provider = new ({
  //   name: "ArbitrumGoerli",
  //   chainId: 421613
  // })
  // customHttpProvider.enable()
  // activate(customHttpProvider)
  // console.log(account)

  const walletInterface = new utils.Interface(abis.wallet)
  const walletAddress = xpnsContract
  // const signer = wallet.getSigner(wallet.address);
  const contract = new Contract(walletAddress, walletInterface)

  const { state: execTxState, send: execTx } = useContractFunction(contract, 'execute', { transactionName: 'Execute', privateKey: privateKey, chainId: 421613, gasLimitBufferPercentage: 100, gasLimit: 10000000 })

  const executeTransaction = (request) => {
    console.log(request)
    execTx(request.to, request.value, request.data)
  }

  // data: "0x6a627842000000000000000000000000167acb75baacea65e895ae1ffbd1ed4b787547cf"
  // from: "0x167acb75baacea65e895ae1ffbd1ed4b787547cf"
  // gas: "0x163f1"
  // to: "0xed20a2a17aeb871b684098d508b0c515f42dbb10"
  // value: "0x16345785d8a0000"

  const getTx = (request) => {
    console.log(request)
    executeTransaction(request)
  }

  const { connections, requests, resolveMany, connect, disconnect, isConnecting } = useWalletConnect({
    account: wallet.address,
    chainId: 421613,
    initialUri: "",
    allNetworks: "",
    setNetwork: "",
    useStorage: useState,
    txCall: getTx
  })


  // Read more about useDapp on https://usedapp.io/
  // const { error: contractCallError, value: tokenBalance } =
  //   useCall({
  //      contract: new Contract(addresses.ceaErc20, abis.erc20),
  //      method: "balanceOf",
  //      args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
  //   }) ?? {};

  // const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  // useEffect(() => {
  //   if (subgraphQueryError) {
  //     console.error("Error while querying subgraph:", subgraphQueryError.message);
  //     return;
  //   }
  //   if (!loading && data && data.transfers) {
  //     console.log({ transfers: data.transfers });
  //   }
  // }, [loading, subgraphQueryError, data]);

  return (
    <Container>
      <Body>
        <div>
          <input placeholder="New Private Key" value={privInput} onChange={e => setPrivInput(e.target.value)} type="text" />
          <button onClick={onSavePrivInput}>Save New Private Key</button>
        </div>
        <h3>{addr}</h3>
        <div>
          <input placeholder="Smart Contract Address" value={contractInput} onChange={e => setContractInput(e.target.value)} type="text" />
          <button onClick={onSaveContractInput}>Save Contract Address</button>
        </div>
        <h3>{xpnsContract}</h3>
        <div>
          <input placeholder="Wallet Connect URL" value={wcInput} onChange={e => setWcInput(e.target.value)} type="text" />
          <button onClick={onWCConnect}>Connect with WalletConnect</button>
        </div>
      </Body>
    </Container>
  );
}

export default App;
