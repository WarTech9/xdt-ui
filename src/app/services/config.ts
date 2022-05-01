export interface Config {
    production: boolean;
    jsonRpcUrl: string;
    usdc: string;
    xdt: string;
    ethMarket: string;
    txUrlPrefix: string;
    faucet: string;
    accountProxy: string;
    networkParams: NetworkParams;
};

export interface NetworkParams {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
        image?: string;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }
