import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header } from "./components";

import useLocalStorage from 'react-use-localstorage';
import { Wallet } from "ethers"

// import { addresses, abis } from "@my-app/contracts";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {

  /*
  TODOS:

  - Find simple useLocalStorage
  - Check if wallet is already here
  - If not, generate and save
  - display public address
  - allow entering public / private key to override
  
  - allow entering sc address
  - save to localstorage
  
  - Setup ethers provider with wallet info
  - Adjust config to point to ArbitrumGoerli

  - paste WalletConnect and save connection
  - get dispatch events
  - send mint tx from tickets frontend
  - receive tx and do something with it
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

  const [contractInput, setContractInput] = useState("");
  const onSaveContractInput = () => {
    setXpnsContract(contractInput)
  }


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
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <h3>{addr}</h3>
        <div>
          <input value={contractInput} onChange={e => setContractInput(e.target.value)} type="text" />
          <button onClick={onSaveContractInput}>Save Contract Address</button>
        </div>
        <h3>{xpnsContract}</h3>
        <div>
          <input placeholder="Wallet Connect URL" type="text" />
          <button>Connect with WalletConnect</button>
        </div>
      </Body>
    </Container>
  );
}

export default App;
