import { Injectable } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { DefaultProviderService } from './default-provider.service';
import { WalletProviderService } from './wallet-provider.service';
import Controller from '../../artifacts/Controller.json';
import ERC20 from '../../artifacts/ERC20.json';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

export interface CollateralInfo {
  symbol?: string
  token: string
  redeemable: BigNumber
  minted: BigNumber
}

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  controllerContract: any;
  usdcContract: any;
  xdtContract: any;
  wethContract

  mintSubject: Subject<any> = new Subject<any>();
  redeemSubject: Subject<any> = new Subject<any>();
  usdcApprovalSubject: Subject<any> = new Subject<any>();
  xdtApprovalSubject: Subject<any> = new Subject<any>();
  wethApprovalSubject: Subject<any> = new Subject<any>();
  usdcTransferSubject: Subject<any> = new Subject<any>();
  xdtTransferSubject: Subject<any> = new Subject<any>();

  constructor(private provider: DefaultProviderService, private wallet: WalletProviderService,) {
    this.controllerContract = new ethers.Contract(
      environment.controller,
      Controller.abi,
      provider.provider
      );
    this.usdcContract = new ethers.Contract(
        environment.usdc,
        ERC20.abi,
        this.provider.provider
    );
    this.xdtContract = new ethers.Contract(
        environment.uxd,
        ERC20.abi,
        this.provider.provider
    );
    this.wethContract = new ethers.Contract(
      environment.weth,
      ERC20.abi,
      this.provider.provider
  );
    this.registerEventListeners();
  }

  async mint(market: string, collateral: string, amount: BigNumber): Promise<any> {
    return await this.controllerContract.connect(this.wallet.signer).mint(market, collateral, amount);
  }

  async redeem(market: string, collateral: string, amount: BigNumber): Promise<any> {
    return await this.controllerContract.connect(this.wallet.signer).redeem(market, collateral, amount);
  }

  async getCollateralInfo() {
    return await this.controllerContract.getCollateralInfo();
  }

  async approveUsdc(spender: string, amount: BigNumber) {
    return await this.usdcContract.connect(this.wallet.signer).approve(spender, amount);
  }

  async approveUXD(spender: string, amount: BigNumber) {
    return await this.xdtContract.connect(this.wallet.signer).approve(spender, amount);
  }

  async approveToken(contractAddress: string, spender: string, amount: BigNumber) {
    const contract = new ethers.Contract(
      contractAddress,
      ERC20.abi,
      this.provider.provider
    );
    return await contract.connect(this.wallet.signer).approve(spender, amount);
  }


  async allowance(contractAddress: string, account: string, spender: string): Promise<BigNumber> {
    const contract = new ethers.Contract(
      contractAddress,
      ERC20.abi,
      this.provider.provider
    );
    return await contract.allowance(account, spender)
  }

  async xdtTotalSupply(): Promise<BigNumber> {
    return this.xdtContract.totalSupply();
  }

  async mintedPerCollateral(token: string): Promise<BigNumber> {
    return this.controllerContract.mintedPerCollateral(token)
  }
  
  async redeemable(token: string): Promise<BigNumber> {
    return this.controllerContract.redeemable(token)
  }

  registerEventListeners() {
    this.controllerContract.on('Minted', async (res) => {
      console.log('Minted: ', res);
      this.mintSubject.next(res);
    });
    this.controllerContract.on('Redeemed', async (res) => {
      console.log('Redeemed: ', res);
      this.redeemSubject.next(res);
    });

    this.usdcContract.on('Approval', async (res) => {
      this.usdcApprovalSubject.next(res);
    });

    this.xdtContract.on('Approval', async (res) => {
      this.xdtApprovalSubject.next(res);
    });

    this.wethContract.on('Approval', async (res) => {
      this.wethApprovalSubject.next(res);
    })

    this.usdcContract.on('Transfer', async (res) => {
      this.usdcTransferSubject.next(res);
    });

    this.xdtContract.on('Transfer', async (res) => {
      this.xdtTransferSubject.next(res);
    });
  }
}
