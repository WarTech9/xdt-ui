import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { Subscription } from 'rxjs';
import { AccountProxyService } from '../services/account-proxy.service';
import { ControllerService } from '../services/controller.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  totalSupply = '0';
  openNotional = '0';
  positionValue = '0';
  mintSub?: Subscription;
  redeemSub?: Subscription;

  constructor(
    private accountProxy: AccountProxyService,
    private controllerService: ControllerService,
  ) {

  }

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
