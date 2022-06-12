export const environment = {
    production: true,
    chainId: '0x45',
    jsonRpcUrl: 'https://kovan.optimism.io',
    usdc: '0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560',
    weth: '0x4200000000000000000000000000000000000006',
    uxd: '0x671Bc200474f9326878759c74E3C49DC748dEcF1',
    ethMarket: '0x5802918dC503c465F969DA0847b71E3Fbe9B141c',
    controller: '0x4d09BB1e958Ff4B9d4f7449d1a123C0c7465b1E4',
    txUrlPrefix: 'https://kovan-optimistic.etherscan.io/tx',
    accountProxy: '0xDBEA5cC914a340691Fc4128Ff09e489F8e0E6df8',
    depository: '0x009b1828F0C6566fBD452eF4f47EC6c97654f7C3',
    faucet: 'https://kovan.optifaucet.com',
    networkParams: {
      chainId: '0x45',
      chainName: 'Optimistic Kovan',
      nativeCurrency: {
          name: 'Kovan ETH',
          symbol: 'KOR',
          decimals: 18
      },
      rpcUrls: ['https://kovan.optimism.io'],
      blockExplorerUrls: ['https://kovan-optimistic.etherscan.io/']
    },
    collateral: [
      {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        address: '0x0',
      },
      {
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18,
        address: '0x4200000000000000000000000000000000000006'
      },
    ]
  };
