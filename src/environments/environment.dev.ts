export const environment = {
    production: true,
    chainId: '0x45',
    jsonRpcUrl: 'https://kovan.optimism.io',
    usdc: '0x3e22e37Cb472c872B5dE121134cFD1B57Ef06560',
    weth: '0x4200000000000000000000000000000000000006',
    xdt: '0x79302CDFeda4D42136A51c8E357d375883497D77',
    ethMarket: '0x5802918dC503c465F969DA0847b71E3Fbe9B141c',
    controller: '0xB223b6B095ea781759B05180552e8632a3ad6640',
    txUrlPrefix: 'https://kovan-optimistic.etherscan.io/tx',
    accountProxy: '0xC6fCAe482643876F2EcF593Bd8368c625036bd12',
    interactor: '0x169ca11d588fFfE581Ca34b8Dc292D733e1F2dcb',
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
