import { Component, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../services/controller.service';
import { WalletProviderService } from '../services/wallet-provider.service';
import { environment } from 'src/environments/environment';
import { BigNumber, ethers } from 'ethers';
import { IonInput } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GlobalAlertService } from '../services/global-alert.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {

  @ViewChild('usdcInput') usdcInput: IonInput;
  @ViewChild('xdtOutput') xdtOutput: IonInput;
  @ViewChild('xdtInput') xdtInput: IonInput;
  @ViewChild('usdcOutput') usdcOutput: IonInput;
  currentSegment = 'mint';
  assetSymbol = 'XDT';
  isApproved = false;
  isUsdcApproved = false;
  isXdtApproved = false;
  isConnected = false;
  account: any;

  // subjects
  usdcApprovalSub?: Subscription;
  xdtApprovalSub?: Subscription;
  usdcTransferSub?: Subscription;
  xdtTransferSub?: Subscription;
  mintSub?: Subscription;
  redeemSub?: Subscription;
  accountSub?: Subscription;

  constructor(
    private wallet: WalletProviderService,
    private controllerService: ControllerService,
    private alertService: GlobalAlertService,
    private zone: NgZone,
  ) {
  }

  async ngOnInit() {
    this.registerForEvents();
  }

  async ngOnDestroy() {
    this.usdcApprovalSub?.unsubscribe();
    this.xdtApprovalSub?.unsubscribe();
    this.mintSub?.unsubscribe();
    this.redeemSub?.unsubscribe();
  }

  onSegmentChanged(event) {
    this.currentSegment = event.target.value;
  }

  async approveUsdc() {
    const bigAmount = ethers.utils.parseEther('1000000000');
    await this.controllerService.approveUsdc(environment.controller, bigAmount);
  }

  async approveXdt() {
    const bigAmount = ethers.utils.parseEther('1000000000');
    await this.controllerService.approveXdt(environment.controller, bigAmount);
  }

  async connect() {
    try {
      const isConected = await this.wallet.connect();
      if (isConected) {
        this.wallet.getAccounts();
      } else {
        this.alertService.presentNoConnectionAlert();
      }
    } catch (error) {
      this.alertService.showErrorAlert(error);
      console.error('error connecting', error);
    }
  }

  async mint() {
    try {
      const amount = this.usdcInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, 6);
      const tx = await this.controllerService.mint(environment.ethMarket, environment.usdc, amountBn);
      console.log('mint tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      this.alertService.showErrorAlert(error);
      console.log('caught error: ', error);
    }
  }

  async redeem() {
    try {
      const amount = this.xdtInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, 6);
      const tx = await this.controllerService.redeem(environment.ethMarket, environment.usdc, amountBn);
      console.log('redeem tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      this.alertService.showErrorAlert(error);
      console.log('caught error: ', error);
    }
  }

  async registerForEvents() {
    this.usdcApprovalSub = this.controllerService.usdcApprovalSubject.subscribe(res => {
      console.log('got usdc approval', res);
      if (res) {
        this.isUsdcApproved = true;
      }
    });
    this.xdtApprovalSub = this.controllerService.xdtApprovalSubject.subscribe(res => {
      console.log('got xdt approval', res);
      this.isXdtApproved = true;
    });
    this.usdcTransferSub = this.controllerService.usdcTransferSubject.subscribe(res => {
      console.log('got usdc: ', res);
    });
    this.xdtTransferSub = this.controllerService.xdtTransferSubject.subscribe(res => {
      console.log('got xdt: ', res);
    });
    this.mintSub = this.controllerService.mintSubject.subscribe(res => {
      console.log('got mint: ', res);
    });
    this.redeemSub = this.controllerService.redeemSubject.subscribe(res => {
      console.log('got redeem: ', res);
    });
    this.accountSub = this.wallet.accountSubject.subscribe(account => {
      this.zone.run(async () => {
        this.account = account;
      });
    });
  }
}
