import { Injectable } from '@angular/core';
import PerpAccountProxy from '../../artifacts/PerpAccountProxy.json';
import ERC20 from '../../artifacts/ERC20.json';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { DefaultProviderService } from './default-provider.service';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AccountProxyService {

  accountContract: any;

  constructor(private provider: DefaultProviderService, private wallet: WalletProviderService,) {
    this.accountContract = new ethers.Contract(
      environment.accountProxy,
      PerpAccountProxy.abi,
      provider.provider
    );
  }

  async getPositionValue() {
    return await this.accountContract.getTotalPositionValue(environment.interactor, environment.ethMarket);
  }

  async getOpenNotional() {
    return await this.accountContract.getTotalOpenNotional(environment.interactor, environment.ethMarket);
  }

  async getAccountValue() {
    return await this.accountContract.getAccountValue(environment.interactor);
  }
}
