import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WalletProviderService } from '../services/wallet-provider.service';
import { environment } from 'src/environments/environment';
import { IonInput } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GlobalAlertService } from '../services/global-alert.service';
import { CollateralToken, Config } from '../services/config';
import { UxdClientService } from '../services/uxd-client.service';
import { ethers } from 'ethers';

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
  assetSymbol = 'UXD';
  isApproved = false;
  isCollateralApproved = false;
  isXdtApproved = false;
  isConnected = false;
  account: any;

  // subjects
  xdtApprovalSub?: Subscription;
  wethApprovalSub?: Subscription;
  xdtTransferSub?: Subscription;
  mintSub?: Subscription;
  redeemSub?: Subscription;
  accountSub?: Subscription;
  env: Config
  selectedCollateral?: CollateralToken

  constructor(
    private wallet: WalletProviderService,
    private uxdClient: UxdClientService,
    private alertService: GlobalAlertService,
    private zone: NgZone,
  ) {
  }

  async ngOnInit() {
    this.env = environment;
    this.selectedCollateral = environment.collateral[0]
    this.registerForEvents();
    this.logTotalSupply()
  }

  async ngOnDestroy() {
    this.xdtApprovalSub?.unsubscribe();
    this.wethApprovalSub?.unsubscribe();
    this.mintSub?.unsubscribe();
    this.redeemSub?.unsubscribe();
  }

  private async checkUXDAllowance() {
    if (!this.account) {
      return;
    }
    const allowance = await this.uxdClient.allowance(
      environment.uxd,
      this.account,
      environment.controller
    );
    this.isXdtApproved = allowance.gt(0)
  }

  private async checkCollateralAllowance() {
    if (!this.account) {
      return;
    }
    const allowance = await this.uxdClient.allowance(
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
    await this.uxdClient.approve(environment.weth, environment.controller, bigAmount)
  }

  async approveUXD() {
    const bigAmount = ethers.utils.parseEther('1000000000');
    await this.uxdClient.approve(environment.uxd, environment.controller, bigAmount)
  }

  async approve() {
    if (!this.selectedCollateral || !this.selectedCollateral.address) {
      this.alertService.showMessageAlert("Error", "Invalid collateral");
      return;
    }
    const bigAmount = ethers.utils.parseEther('1000000000');
    const tokenAddress = this.selectedCollateral.address;
    await this.uxdClient.approve(tokenAddress, environment.controller, bigAmount)
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
      const provider = await this.wallet.provider
      const amount = this.usdcInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, this.selectedCollateral.decimals);
      const tx = await this.uxdClient.mint(amountBn)
      console.log('mint  tx = ', tx);
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
      await this.wallet.addToken(environment.uxd, "UXD", 18)
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
      const tx = await this.uxdClient.redeem(amountBn);
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

  private async logTotalSupply() {
    const totalSupply = await this.uxdClient.uxdTotalSupply()
    console.log("totalSupply = ", ethers.utils.formatEther(totalSupply));
  }

  async registerForEvents() {
    this.xdtApprovalSub = this.uxdClient.uxdApprovalSubject.subscribe(res => {
      console.log('got uxd approval', res);
      if (res.toLocaleLowerCase() == this.account.toLowerCase()) {
        this.isXdtApproved = true;
      }
    });
    this.wethApprovalSub = this.uxdClient.wethApprovalSubject.subscribe(res => {
      console.log('got weth approval: ', res);
      if (res && this.account && 
        res.toLocaleLowerCase() == this.account.toLowerCase() && 
        this.selectedCollateral.address === environment.weth) {
        this.isCollateralApproved = true;
      }
    });
    
    this.xdtTransferSub = this.uxdClient.uxdTransferSubject.subscribe(res => {
      console.log('got uxd: ', res);
    });
    this.mintSub = this.uxdClient.mintSubject.subscribe(res => {
      console.log('got mint: ', res);
    });
    this.redeemSub = this.uxdClient.redeemSubject.subscribe(res => {
      console.log('got redeem: ', res);
    });
    this.accountSub = this.wallet.accountSubject.subscribe(account => {
      this.zone.run(async () => {
        this.account = account;
        if (account) {
          await this.checkUXDAllowance()
          await this.checkCollateralAllowance()
        }
      });
    });
  }
}
