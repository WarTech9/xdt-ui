export const environment = {
    production: true,
    chainId: '0x45',
    jsonRpcUrl: 'https://kovan.optimism.io',
    usdc: '0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560',
    weth: '0x4200000000000000000000000000000000000006',
    uxd: '0xeDC193514c2CB2B335b59D2411B96aAef44F8793',
    ethMarket: '0x5802918dC503c465F969DA0847b71E3Fbe9B141c',
    controller: '0xa63350dc898587E39C42e26104f1B7A1Fa06d81A',
    txUrlPrefix: 'https://kovan-optimistic.etherscan.io/tx',
    accountProxy: '0x92b54336c013A2A3974fc841495386504662a6C5',
    depository: '0xc9bc8592fC3FEECa3ceaF30A7e86007882F3190b',
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
