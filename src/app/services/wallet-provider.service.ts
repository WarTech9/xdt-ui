import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { Signer, ethers, BigNumber } from 'ethers';
import { Config } from 'protractor';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NetworkParams } from './config';
import { GlobalAlertService } from './global-alert.service';

@Injectable({
  providedIn: 'root'
})
export class WalletProviderService {
  provider: any
  ethereum;
  signer: Signer;
  currentAccount;
  currentNetwork: NetworkParams;
  currentConfig: Config;

  connectedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  accountSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  networkSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private globalAlert: GlobalAlertService,
  ) {
    this.initializeNetworkConnection();
  }

  async connect(): Promise<boolean> {
    try {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        console.log('starting app with ethereum: ', ethereum)
        await this.startApp(ethereum);
        return ethereum !== undefined;
      } else {
        console.log('*** No ethereum')
        return false;
      }
    } catch (error) {
      console.error('unable to detect ethereum provider: ', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.currentAccount != null && this.currentAccount !== undefined;
  }

  async startApp(ethereum: any) {
    this.provider = new ethers.providers.Web3Provider(ethereum, 'any');
    this.signer = await this.provider.getSigner();
    console.log("***signer in startApp is ", this.signer)
    this.registerHandlers();
    if (ethereum.selectedAddress) {
      ethereum.enable();
      this.setCurrentAccount(ethereum.selectedAddress);
    } else {
    }
  }

  async addNetwork() {
    if (!this.provider) {
      console.log('no provider');
      this.globalAlert.presentNoConnectionAlert();
      return;
    }
    console.log('about to add: ', this.currentNetwork);
    this.provider
    .send(
      'wallet_addEthereumChain',
      [environment.networkParams]
    )
    .catch((error: any) => {
      console.log(error);
    });
  }

  async addToken(address: string, symbol: string, decimals: number, image?: string) {
    this.provider
  .send(
    'wallet_watchAsset',
    {
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image
      },
  })
  .then((success) => {
    if (success) {
      console.log('successfully added to wallet!');
    } else {
      throw new Error('Something went wrong.');
    }
  })
  .catch(console.error);
  }

  async getAccounts() {
    if (!this.provider) {
      return;
    }

    let accounts = await this.provider.send('eth_requestAccounts', []);
    if (accounts.length > 0) {
      this.setCurrentAccount(accounts[0]);
    } else {
      accounts = await this.enableEthereum();
      if (accounts.length > 0) {
        this.setCurrentAccount(accounts[0]);
      } else {
        this.setCurrentAccount(null);
      }
    }
    this.signer = this.provider.getSigner();
    return accounts;
  }

  async disconnect() {
    // not the right call
    // await this.ethereum.disconnect()
    this.setCurrentAccount(null);
  }

  async checkBalance(): Promise<BigNumber | BigNumber> {
    if (this.currentAccount) {
      return await this.provider.getBalance(this.currentAccount);
    } else {
      return BigNumber.from(0);
    }
  }

  async balanceIsOver(value: BigNumber): Promise<boolean | boolean> {
    if (this.currentAccount) {
      const balance: BigNumber = await this.provider.getBalance(this.currentAccount);
      console.log(`Balance=${balance}, value=${value}`);
      return balance.gt(value); // must be strictly > to account for gas cost.
    } else {
      return false;
    }
  }

  async enableEthereum(): Promise<any> {
    return await this.provider.enable();
  }

  private async registerHandlers() {
    console.log('registering handlers');
    this.provider.on('connect', this.handleAccountConnected.bind(this));
    this.provider.on('disconnect', this.handleAccountDisconnected.bind(this));
    this.provider.on('network', this.handledChainChanged.bind(this));
    this.provider.on('accountsChanged', this.handleAccountChanged.bind(this));
  }

  private handleAccountConnected(accounts) {
    console.log('>>> Account connected: ', accounts);
  }

  private handleAccountDisconnected(accounts) {
    console.log('>>> Account disconnected: ', accounts);
  }

  private handledChainChanged(network) {
    console.log('>>> Chain changed to: ', network);
    this.networkSubject.next(this.getHexString(network.chainId));
    // this.networkSubject.next(network);
  }

  private handleAccountChanged(accounts) {
    if (accounts.length > 0) {
      this.setCurrentAccount(accounts[0]);
    } else {
      this.setCurrentAccount(null);
    }
    console.log('>>> Account changed to: ', accounts);
  }

  private setCurrentAccount(account: string | null) {
    this.currentAccount = account;
    this.accountSubject.next(account);
  }

  private initializeNetworkConnection() {
    console.log('initializing connection');
    const eth: any = window.ethereum;
    if (eth) {
      const hexVersion = this.getHexString(eth.networkVersion);
      this.handledChainChanged(hexVersion);
    } else {
      console.log('no ethereum');
    }
    const currentNetwork: NetworkParams = environment.networkParams;
    if (currentNetwork && currentNetwork.chainId) {
    }
    this.currentNetwork = currentNetwork;
    this.currentConfig = environment;
  }

  private getHexString(networkCode) {
    return `0x${(+networkCode).toString(16)}`;
  }
}
