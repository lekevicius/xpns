import { shortenAddress, useEthers, useLookupAddress, useEtherBalance } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { getDefaultProvider } from 'ethers'

import { Body, Button, Container, Header } from "./components";

// Regular import crashes the app with "Buffer is not defined" error.
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js'
import { formatEther } from '@ethersproject/units'
// import { AccountIcon } from './components/AccountIcon'

import { addresses, abis } from "./contracts";

export const getAddressLink = (explorerUrl) => (address) => `${explorerUrl}/address/${address}`
export const getTransactionLink = (explorerUrl) => (txnId) => `${explorerUrl}/tx/${txnId}`

export const ArbitrumGoerli = {
  chainId: 421613,
  chainName: 'ArbitrumGoerli',
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  multicall2Address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  blockExplorerUrl: "https://goerli-rollup.arbitrum.io/rpc",
  getExplorerAddressLink: getAddressLink("https://goerli-rollup.arbitrum.io/rpc"),
  getExplorerTransactionLink: getTransactionLink("https://goerli-rollup.arbitrum.io/rpc"),
}

const config = {
  readOnlyChainId: ArbitrumGoerli.chainId,
  readOnlyUrls: {
    [ArbitrumGoerli.chainId]: getDefaultProvider("https://arb-goerli.g.alchemy.com/v2/RMAO-wGMdP6DawJoS_HRV_aj6Su-fqtC")
  },
}

// function WalletButton() {
//   const [rendered, setRendered] = useState("");

//   const { ens } = useLookupAddress();
//   const { account, activate, deactivate, chainId } = useEthers()

//   useEffect(() => {
//     if (ens) {
//       setRendered(ens);
//     } else if (account) {
//       setRendered(shortenAddress(account));
//     } else {
//       setRendered("");
//     }
//   }, [account, ens, setRendered]);

//   // useEffect(() => {
//   //   if (error) {
//   //     console.error("Error while connecting wallet:", error.message);
//   //   }
//   // }, [error]);

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
  // Read more about useDapp on https://usedapp.io/
  // const { error: contractCallError, value: tokenBalance } =
  //   useCall({
  //      contract: new Contract(addresses.Ticket, abis.Ticket),
  //      method: "balanceOf",
  //      args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
  //   }) ?? {};

  // const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  const { account, activate, deactivate, chainId } = useEthers()
  const etherBalance = useEtherBalance(account)
  console.log(chainId, config)
  if (!config.readOnlyUrls[chainId]) {
    return <p>Please use either Mainnet or Goerli testnet.</p>
  }

  async function onConnect() {
    try {
      const provider = new WalletConnectProvider({
        infuraId: 'd8df2cb7844e4a54ab0a782f608749dd',
      })
      await provider.enable()
      await activate(provider)
    } catch (error) {
      console.error(error)
    }
  }

  const ConnectButton = () => (
    <div>
      <button onClick={onConnect}>Connect</button>
    </div>
  )

  const WalletConnectConnect = () => (
    <div>
      {account && (
        <div>
          <div className="inline">
            {/* <AccountIcon account={account} /> */}
            &nbsp;
            <div className="account">{account}</div>
          </div>
          <br />
        </div>
      )}
      {!account && <ConnectButton />}
      {account && <button onClick={deactivate}>Disconnect</button>}
      <br />
    </div>
  )

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
        {/* <WalletButton /> */}
        <WalletConnectConnect />
      </Header>
      <Body>
        {etherBalance && (
          <div className="balance">
           <br />
            Balance:
            <p className="bold">{formatEther(etherBalance)} ETH</p>
          </div>
        )}
        <p>Mint ArbiCon Pass (0.1 ETH)</p>
        <button>Mint</button>
      </Body>
    </Container>
  );
}

export default App;
