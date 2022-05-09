import { Component, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../services/controller.service';
import { WalletProviderService } from '../services/wallet-provider.service';
import { environment } from 'src/environments/environment';
import { BigNumber, ethers } from 'ethers';
import { IonInput } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GlobalAlertService } from '../services/global-alert.service';
import { CollateralToken, Config } from '../services/config';

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
  isCollateralApproved = false;
  isXdtApproved = false;
  isConnected = false;
  account: any;

  // subjects
  usdcApprovalSub?: Subscription;
  xdtApprovalSub?: Subscription;
  usdcTransferSub?: Subscription;
  wethApprovalSub?: Subscription;
  xdtTransferSub?: Subscription;
  mintSub?: Subscription;
  redeemSub?: Subscription;
  accountSub?: Subscription;
  env: Config
  selectedCollateral?: CollateralToken

  constructor(
    private wallet: WalletProviderService,
    private controllerService: ControllerService,
    private alertService: GlobalAlertService,
    private zone: NgZone,
  ) {
  }

  async ngOnInit() {
    this.env = environment;
    this.selectedCollateral = environment.collateral[0]
    this.registerForEvents();
  }

  async ngOnDestroy() {
    this.usdcApprovalSub?.unsubscribe();
    this.xdtApprovalSub?.unsubscribe();
    this.wethApprovalSub?.unsubscribe();
    this.mintSub?.unsubscribe();
    this.redeemSub?.unsubscribe();
  }

  private async checkXdtAllowance() {
    if (!this.account) {
      return;
    }
    const allowance = await this.controllerService.allowance(
      environment.xdt,
      this.account,
      environment.controller
    );
    this.isXdtApproved = allowance.gt(0)
  }

  private async checkCollateralAllowance() {
    if (!this.account) {
      return;
    }
    const allowance = await this.controllerService.allowance(
      this.selectedCollateral.address,
      this.account,
      environment.controller
    );
    this.isCollateralApproved = allowance.gt(0)
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

  async approve() {
    if (!this.selectedCollateral || !this.selectedCollateral.address) {
      this.alertService.showMessageAlert("Error", "Invalid collateral");
      return;
    }
    const bigAmount = ethers.utils.parseEther('1000000000');
    const tokenAddress = this.selectedCollateral.address;
    await this.controllerService.approveToken(tokenAddress, environment.controller, bigAmount)
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
    if (!this.selectedCollateral) {
      this.alertService.showOkayAlert("Error", "Invalid collateral");
      return;
    }
    try {
      const amount = this.usdcInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, this.selectedCollateral.decimals);
      const tx = await this.controllerService.mint(environment.ethMarket, this.selectedCollateral.address, amountBn);
      console.log('mint tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      this.alertService.showErrorAlert(error);
      console.log('caught error: ', error);
    }
  }

  async addCollateral() {
    if (!this.selectedCollateral) {
      return;
    }
    try {
      await this.wallet.addToken(
        this.selectedCollateral.address, 
        this.selectedCollateral.symbol, 
        this.selectedCollateral.decimals
      );
    } catch (error) {
      this.alertService.showErrorAlert(error);
    }
  }

  async addXDT() {
    try {
      await this.wallet.addToken(environment.xdt, "XDT", 18)
    } catch (error) {
      this.alertService.showErrorAlert(error)
    }
  }

  async redeem() {
    if (!this.selectedCollateral) {
      this.alertService.showOkayAlert("Error", "Invalid collateral");
      return;
    }
    try {
      const amount = this.xdtInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, this.selectedCollateral.decimals);
      const tx = await this.controllerService.redeem(environment.ethMarket, this.selectedCollateral.address, amountBn);
      console.log('redeem tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      this.alertService.showErrorAlert(error);
      console.log('caught error: ', error);
    }
  }

  async onCollateralSelected($event) {
    const newValue = $event.target.value;
    this.changeCollateral(newValue);
  }

  private async changeCollateral(symbol: string) {
    let found = false
    for (const c of environment.collateral) {
      if (c.symbol === symbol) {
        this.selectedCollateral = c;
        found = true
        console.log('collateral selected: ', c);
        break
      }
    }
    if (found) {
      if (this.account) {
        this.checkCollateralAllowance()
      }
    } else {
      this.alertService.showToast('Invalid collateral')
    }
  }

  async registerForEvents() {
    this.usdcApprovalSub = this.controllerService.usdcApprovalSubject.subscribe(res => {
      console.log('got usdc approval', res);
      if (res.toLocaleLowerCase() == this.account.toLowerCase() && 
        this.selectedCollateral.address === environment.usdc) {
        this.isCollateralApproved = true;
      }
    });
    this.xdtApprovalSub = this.controllerService.xdtApprovalSubject.subscribe(res => {
      console.log('got xdt approval', res);
      if (res.toLocaleLowerCase() == this.account.toLowerCase()) {
        this.isXdtApproved = true;
      }
    });
    this.wethApprovalSub = this.controllerService.wethApprovalSubject.subscribe(res => {
      console.log('got weth approval: ', res);
      if (res && this.account && 
        res.toLocaleLowerCase() == this.account.toLowerCase() && 
        this.selectedCollateral.address === environment.weth) {
        this.isCollateralApproved = true;
      }
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
        if (account) {
          await this.checkXdtAllowance()
          await this.checkCollateralAllowance()
        }
      });
    });
  }
}
