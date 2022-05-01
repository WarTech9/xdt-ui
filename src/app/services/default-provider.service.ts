import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DefaultProviderService {

  provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(environment.jsonRpcUrl);
  }

  async getBlockNumber() {
    const blockNumber = await this.provider.getBlockNumber();
    console.log('block number is: ', blockNumber);
  }
}
