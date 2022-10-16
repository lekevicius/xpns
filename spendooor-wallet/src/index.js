import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Mainnet } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";
import { getDefaultProvider } from "ethers";

import App from "./App";

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
const INFURA_PROJECT_ID = "529670718fd74cd2a041466303daecd7";

export const getAddressLink = (explorerUrl) => (address) => `${explorerUrl}/address/${address}`
export const getTransactionLink = (explorerUrl) => (txnId) => `${explorerUrl}/tx/${txnId}`

const arbitrumGoerliExplorerUrl = 'https://goerli-rollup-explorer.arbitrum.io'
export const ArbitrumGoerli = {
  chainId: 421613,
  chainName: 'Arbitrum Goerli',
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: '0x108B25170319f38DbED14cA9716C54E5D1FF4623',
  rpcUrl: 'https://nameless-misty-haze.arbitrum-goerli.discover.quiknode.pro/47bb4f76fd2a08b0a125da7808efc52b45cf77fd/',
  nativeCurrency: {
    name: 'AGOR',
    symbol: 'AGOR',
    decimals: 18,
  },
  blockExplorerUrl: arbitrumGoerliExplorerUrl,
  getExplorerAddressLink: getAddressLink(arbitrumGoerliExplorerUrl),
  getExplorerTransactionLink: getTransactionLink(arbitrumGoerliExplorerUrl),
}

const config = {
  readOnlyChainId: ArbitrumGoerli.chainId,
  readOnlyUrls: {
    [ArbitrumGoerli.chainId]: getDefaultProvider("https://nameless-misty-haze.arbitrum-goerli.discover.quiknode.pro/47bb4f76fd2a08b0a125da7808efc52b45cf77fd/")
  },
  gasLimitBufferPercentage: 100,
  refresh: 'everyBlock',
}

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
