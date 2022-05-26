export const environment = {
    production: true,
    chainId: '0x45',
    jsonRpcUrl: 'https://kovan.optimism.io',
    usdc: '0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560',
    weth: '0x4200000000000000000000000000000000000006',
    xdt: '0x4f8E5950F28299414bb6Be72937c6491c0a3BAd8',
    ethMarket: '0x5802918dC503c465F969DA0847b71E3Fbe9B141c',
    controller: '0xF359A9c19CE5AB960d9c57977831f41838A87801',
    txUrlPrefix: 'https://kovan-optimistic.etherscan.io/tx',
    accountProxy: '0xC6fCAe482643876F2EcF593Bd8368c625036bd12',
    interactor: '0x37570629E000f1371FadE23E38C217Ef6AF90d4F',
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
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18,
        address: '0x4200000000000000000000000000000000000006'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: '0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560',
      }
    ]
  };
