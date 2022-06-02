export interface Config {
    production: boolean;
    jsonRpcUrl: string;
    usdc: string;
    weth: string;
    uxd: string;
    ethMarket: string;
    txUrlPrefix: string;
    faucet: string;
    accountProxy: string;
    networkParams: NetworkParams;
    collateral: CollateralToken[]
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
};

export interface CollateralToken {
    name: string;
    symbol: string
    decimals: number;
    address: string;
}
