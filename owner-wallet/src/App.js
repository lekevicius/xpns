import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress, useContractFunction, useSendTransaction } from "@usedapp/core";
import React, { useEffect, useState } from "react";

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

  function useTokenId(
    address
  ) {
    const { value, error } =
      useCall(
        address && {
          contract: new Contract(xpnsContract || addresses.wallet, new utils.Interface(abis.wallet)), // instance of called contract
          method: "tokenOfOwnerByIndex", // Method to be called
          args: [address, 0], // Method arguments - address to be checked for balance
        }
      ) ?? {};
    if (error) {
      console.error(error.message)
      return undefined
    }
    console.log(value?.[0].string)
    return value?.[0]
  }

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

  // const [wcInput, setWcInput] = useState("");
  // const onWCConnect = () => {
  //   console.log(wcInput)
  //   connect({ uri: wcInput })
  // }

  const walletInterface = new utils.Interface(abis.wallet)
  const walletAddress = addresses.wallet
  const contract = new Contract(walletAddress, walletInterface)

  const [mintPassTargetInput, setMintPassTargetInput] = useState("");
  const [mintPassLimitInput, setMintPassLimitInput] = useState(0);
  const onMintPassInput = () => {
    mintPass( mintPassTargetInput, mintPassLimitInput)
  }

  const { state: mintTxState, send: mintTx } = useContractFunction(contract, 'mintSpendooorPass', { transactionName: 'Mint spendooor pass', privateKey: privateKey, chainId: 421613, gasLimitBufferPercentage: 10 })
  const mintPass = (address, limit) => {
    void mintTx(address, ethers.utils.parseEther(limit.toString()))
  }

  const [changeLimitTargetInput, setChangeLimitTargetInput] = useState(0);
  const [changeLimitLimitInput, setChangeLimitLimitInput] = useState(0);
  const onChangeLimitInput = () => {
    setLimit(changeLimitTargetInput, changeLimitLimitInput)
  }

  const { state: setLimitTxState, send: setLimitTx } = useContractFunction(contract, 'setLimit', { transactionName: 'Set limit of token', privateKey: privateKey, chainId: 421613, gasLimitBufferPercentage: 10 })
  const setLimit = (tokenId, limit) => {
    void setLimitTx(tokenId, ethers.utils.parseEther(limit.toString()))
  }
  // const mintPass({address}) {
  //   const { sendTransaction, state } = useSendTransaction()
  // }

  // console.log(chainId)
  // var customHttpProvider = new ethers.providers.JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc")
  // const provider = new ({
  //   name: "ArbitrumGoerli",
  //   chainId: 421613
  // })
  // customHttpProvider.enable()
  // activate(customHttpProvider)
  // console.log(account)

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

  const tokenId = useTokenId(addr)

  return (
    <section>
      {tokenId && tokenId.toNumber() == 0 && (
        <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 text-left my-6">
          <section aria-labelledby="payment-details-heading">
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-white py-6 px-4 sm:p-6">

                <div className="border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">

                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 pt-2">Mint pass</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">

                        <div className="flex">
                          <div className="flex-grow">
                            <input
                              type="text"
                              name="mint-pass-address"
                              id="mint-pass-address"
                              onChange={e => setMintPassTargetInput(e.target.value)}
                              className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                              placeholder="Wallet address"
                            />
                          </div>
                          <div className="flex-grow">
                            <input
                              type="number"
                              name="mint-pass-limit"
                              id="mint-pass-limit"
                              value={mintPassLimitInput} onChange={e => setMintPassLimitInput(e.target.value)}
                              className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                              placeholder="Limit"
                            />
                          </div>
                          <span className="ml-3">
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                              onClick={onMintPassInput}
                            >
                              <span>Mint</span>
                            </button>
                          </span>
                        </div>

                      </dd>
                    </div>


                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 pt-2">Change Limit</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">

                        <div className="flex">
                          <div className="flex-grow">
                            <input
                              type="number"
                              name="change-limit-token"
                              id="change-limit-token"
                              value={changeLimitTargetInput} onChange={e => setChangeLimitTargetInput(e.target.value)}
                              className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                              placeholder="Token ID"
                            />
                          </div>
                          <div className="flex-grow">
                            <input
                              type="number"
                              name="change-limit-limit"
                              id="change-limit-limit"
                              value={changeLimitLimitInput} onChange={e => setChangeLimitLimitInput(e.target.value)}
                              className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                              placeholder="Limit"
                            />
                          </div>
                          <span className="ml-3">
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                              onClick={onChangeLimitInput}
                            >
                              <span>Save</span>
                            </button>
                          </span>
                        </div>

                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

          </section>
        </div>
      )}

      <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 text-left my-6">
        <section aria-labelledby="payment-details-heading">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="bg-white py-6 px-4 sm:p-6">

              <div className="border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Signer Address</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900 sm:col-span-2 sm:mt-0">{addr}</dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 pt-2">Update Private Key</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">

                      <div className="flex">
                        <div className="flex-grow">
                          <input
                            type="text"
                            name="add-team-members"
                            id="add-team-members"
                            value={privInput} onChange={e => setPrivInput(e.target.value)}
                            className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                            placeholder="New Private Key"
                          />
                        </div>
                        <span className="ml-3">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            onClick={onSavePrivInput}
                          >
                            <span>Save</span>
                          </button>
                        </span>
                      </div>

                    </dd>
                  </div>


                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Contract Address</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900 sm:col-span-2 sm:mt-0">{xpnsContract}</dd>
                  </div>

                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 pt-2">Update Contract Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">

                      <div className="flex">
                        <div className="flex-grow">
                          <input
                            type="text"
                            name="add-team-members"
                            id="add-team-members"
                            value={contractInput} onChange={e => setContractInput(e.target.value)}
                            className="block p-2 w-full rounded-md border-gray-300 border shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                            placeholder="New Smart Contract Address"
                          />
                        </div>
                        <span className="ml-3">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            onClick={onSaveContractInput}
                          >
                            <span>Save</span>
                          </button>
                        </span>
                      </div>

                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

        </section>
      </div>
    </section>
    // <div>
    //   <div>
    //     <input placeholder="New Private Key" value={privInput} onChange={e => setPrivInput(e.target.value)} type="text" />
    //     <button onClick={onSavePrivInput}>Save New Private Key</button>
    //   </div>
    //   <h3>{addr}</h3>
    //   <div>
    //     <input placeholder="Smart Contract Address" value={contractInput} onChange={e => setContractInput(e.target.value)} type="text" />
    //     <button onClick={onSaveContractInput}>Save Contract Address</button>
    //   </div>
    //   <h3>{xpnsContract}</h3>
    //   <div>
    //     <input placeholder="Receiver address" value={mintPassTargetInput} onChange={e => setMintPassTargetInput(e.target.value)} type="text" />
    //     <input placeholder="Limit in ether" value={mintPassLimitInput} onChange={e => setMintPassLimitInput(e.target.value)} type="number" />
    //     <button onClick={onMintPassInput}>Mint pass</button>
    //   </div>
    //   <div>
    //     <input placeholder="Toke id" value={changeLimitTargetInput} onChange={e => setChangeLimitTargetInput(e.target.value)} type="number" />
    //     <input placeholder="Limit in ether" value={changeLimitLimitInput} onChange={e => setChangeLimitLimitInput(e.target.value)} type="number" />
    //     <button onClick={onChangeLimitInput}>Set Limit</button>
    //   </div>
    // </div>
  );
}

export default App;
