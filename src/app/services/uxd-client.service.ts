import { Injectable } from '@angular/core';
import { BigNumber, ethers, Signer } from 'ethers';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UXDController } from 'uxd-evm-client';
import { DefaultProviderService } from './default-provider.service';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class UxdClientService {

  controller: UXDController
  
  mintSubject: Subject<any> = new Subject<any>();
  redeemSubject: Subject<any> = new Subject<any>();
  uxdApprovalSubject: Subject<any> = new Subject<any>();
  wethApprovalSubject: Subject<any> = new Subject<any>();
  wethTransferSubject: Subject<any> = new Subject<any>();
  uxdTransferSubject: Subject<any> = new Subject<any>();

  constructor(
    private providerService: DefaultProviderService,
    private wallet: WalletProviderService 
  ) { 
    this.initializeClient()
  }

  async initializeClient() {
    this.controller = new UXDController(
      this.providerService.provider,
      environment.controller,
      environment.uxd
    )
    this.registerEvents()
  }

  async mint(wethAmount: BigNumber) {
    console.log('calling mint')
    return await this.controller.mint(
      environment.ethMarket, 
      environment.weth,
      wethAmount,
      BigNumber.from(0),
      this.wallet.signer
    )
  }

  async mintWithEth(ethAmount: BigNumber) {
    return await this.controller.mintWithEth(
      environment.ethMarket,
      ethAmount,
      BigNumber.from(0),
      this.wallet.signer, 
    )
  }

  async redeem(uxdAmount: BigNumber) {
    return await this.controller.redeem(
      environment.ethMarket,
      environment.weth,
      uxdAmount,
      BigNumber.from(0),
      this.wallet.signer
    )
  }

  async redeemEth(uxdAmount: BigNumber) {
    return await this.controller.redeemEth(
      environment.ethMarket,
      uxdAmount,
      BigNumber.from(0),
      this.wallet.signer
    )
  }

  async uxdTotalSupply() {
    return await this.controller.uxdTotalSupply()
  }

  async tokenBalance(contractAddress: string, account: string): Promise<BigNumber> {
    return await this.controller.tokenBalance(contractAddress, account)
  }

  async allowance(contract: string, account: string, spender: string): Promise<BigNumber> {
    return await this.controller.allowance(contract, account, spender)
  }

  async approve(contract: string, spender: string, amount: BigNumber ) {
    return await this.controller.approveToken(
      contract,
      spender,
      amount,
      this.wallet.signer
    )
  }

  private async registerEvents() {
    this.controller.mintSubject.subscribe(t => {
      this.mintSubject.next(t)
    })
    this.controller.redeemSubject.subscribe(t => {
      this.redeemSubject.next(t)
    })
    this.controller.uxdApprovalSubject.subscribe(t => {
      this.uxdApprovalSubject.next(t)
    })
    this.controller.uxdTransferSubject.subscribe(t => {
      this.uxdTransferSubject.next(t)
    })
  }
}
