import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountProxyService } from '../services/account-proxy.service';
import { CollateralInfo, ControllerService } from '../services/controller.service';

interface CollateralMap {
  symbol: string
  amount: string
}
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  totalSupply = '0';
  openNotional = '0';
  positionValue = '0';
  usdcBacked = '0';
  wethBacked = '0';
  accountValue = '0'

  mintedPerUsdc = '0';
  mintedPerWeth = '0'
  redeemableUsdc = '0'
  redeemableWeth = '0'

  minted: CollateralMap[] = []
  collateralInfo: CollateralInfo[] = []

  mintSub?: Subscription;
  redeemSub?: Subscription;

  constructor(
    private accountProxy: AccountProxyService,
    private controllerService: ControllerService,
  ) {}

  async ngOnInit() {
    await this.refresh();
    await this.registerForEvents();
  }

  async refresh() {
    const supply = await this.controllerService.xdtTotalSupply();
    this.totalSupply = ethers.utils.formatEther(supply);

    const value = await this.accountProxy.getPositionValue();
    this.positionValue = ethers.utils.formatEther(value);

    const notional = await this.accountProxy.getOpenNotional();
    this.openNotional = ethers.utils.formatEther(notional);

    this.mintedPerUsdc = ethers.utils.formatEther(
      await this.controllerService.mintedPerCollateral(environment.usdc))

    this.mintedPerWeth = ethers.utils.formatEther(
      await this.controllerService.mintedPerCollateral(environment.weth))

    this.redeemableUsdc = ethers.utils.formatUnits(
      await this.controllerService.redeemable(environment.usdc), '6'
    )

    this.redeemableWeth = ethers.utils.formatUnits(
      await this.controllerService.redeemable(environment.weth)
    )
    this.accountValue = ethers.utils.formatEther(
      await this.accountProxy.getAccountValue()
    )
  }

  async getMintedPerCollateral() {
    for (const c of environment.collateral) {
      const m = await this.controllerService.mintedPerCollateral(c.address);
      this.minted.push({
        symbol: c.symbol,
        amount: ethers.utils.formatEther(m)
      })
      console.log('mintedPerCollateral = ', this.minted)
    }
  }

  async getCollateralInfo() {
    this.collateralInfo = await this.controllerService.getCollateralInfo()

    console.log('info = ', this.collateralInfo)
    this.collateralInfo = this.collateralInfo.map(info => {
      let symbol = ''
      for (const collateral of environment.collateral) {
        if (info.token.toLocaleLowerCase() == collateral.address.toLowerCase()) {
          symbol = collateral.symbol;
        }
      }
      return {
        ...info,
        symbol: symbol 
      }
    })
    console.log('info = ', this.collateralInfo)
  }

  async registerForEvents() {
    this.mintSub = this.controllerService.mintSubject.subscribe(async res => {
      await this.refresh();
    });
    this.redeemSub = this.controllerService.redeemSubject.subscribe(async res => {
      console.log('got redeem: ', res);
      await this.refresh();
    });
  }
}
