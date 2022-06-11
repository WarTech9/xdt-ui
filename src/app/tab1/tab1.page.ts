import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WalletProviderService } from '../services/wallet-provider.service';
import { environment } from 'src/environments/environment';
import { IonInput, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GlobalAlertService } from '../services/global-alert.service';
import { CollateralToken, Config } from '../services/config';
import { UxdClientService } from '../services/uxd-client.service';
import { BigNumber, ethers } from 'ethers';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  providers: [DecimalPipe],
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
  loader?: any

  constructor(
    private wallet: WalletProviderService,
    private uxdClient: UxdClientService,
    private alertService: GlobalAlertService,
    private loadingController: LoadingController,
    private decimalPipe: DecimalPipe,
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
      this.isCollateralApproved = false
      return;
    }
    if (this.selectedCollateral.symbol == "ETH") {
      this.isCollateralApproved = true
      return
    }
    const allowance = await this.uxdClient.allowance(
      this.selectedCollateral.address,
      this.account,
      environment.controller
    );
    console.log('allowance is = ', ethers.utils.formatEther(allowance))
    this.isCollateralApproved = allowance.gt(ethers.utils.parseEther("1000000"))
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
    if (this.selectedCollateral.symbol == "ETH") {
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
        await this.wallet.getAccounts();
        await this.checkCollateralAllowance()
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
    // check balance
    try {
      const provider = await this.wallet.provider
      const amount = this.usdcInput.value.toString() || '';
      const amountBn = ethers.utils.parseUnits(amount, this.selectedCollateral.decimals);
      let tx
      if (this.selectedCollateral.symbol == 'ETH') {
        const balanceGt = await this.ethBalanceGreaterThan(amountBn)
        if (!balanceGt) {
          this.alertService.showOkayAlert("Insufficient blance", "Not enough ETH in your account");
          return;
        }
        await this.showLoading("Transaction pending")
        tx = await this.uxdClient.mintWithEth(amountBn);
        await this.hideLoading()
      } else {
        const balanceGt = await this.wethBalanceGreaterThan(amountBn)
        if (!balanceGt) {
          this.alertService.showOkayAlert("Insufficient blance", "Not enough WETH in your account");
          return;
        }
        await this.showLoading("Transaction Pending")
        tx = await this.uxdClient.mint(amountBn);
        await this.hideLoading()
      }
      console.log('mint  tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      await this.hideLoading()
      this.alertService.showErrorAlert(error);
      console.log('caught error: ', error);
    }
  }

  async addCollateral() {
    if (!this.selectedCollateral) {
      return;
    }
    if (!this.wallet.isConnected()) {
      this.alertService.showOkayAlert("No Connection", "Please click connect button to connect")
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
    if (!this.wallet.isConnected()) {
      this.alertService.showOkayAlert("No Connection", "Please click connect button to connect")
      return;
    }
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
      const balanceGt = await this.uxdBalanceGreaterThan(amountBn)
      if (!balanceGt) {
        this.alertService.showOkayAlert("Insufficient blance", "Not enough UXD in your account");
        return;
      }
      let tx;
      this.showLoading("Transaction Pending")
      if (this.selectedCollateral.symbol == 'ETH') {
        tx = await this.uxdClient.redeemEth(amountBn);
      } else {
        tx = await this.uxdClient.redeem(amountBn);
      }
      this.hideLoading()
      console.log('redeem tx = ', tx);
      if (tx && tx.hash) {
        this.alertService.showTransactionAlert(tx.hash);
      }
    } catch (error) {
      this.hideLoading()
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
      if (res && res.account && res.account.toLocaleLowerCase() == this.account.toLowerCase()) {
        this.isXdtApproved = true;
      }
    });
    this.wethApprovalSub = this.uxdClient.wethApprovalSubject.subscribe(res => {
      console.log('got weth approval: ', res);
      if (res && this.account && 
        res.account && res.account.toLocaleLowerCase() == this.account.toLowerCase() && 
        this.selectedCollateral.address === environment.weth) {
        this.isCollateralApproved = true;
      }
    });
    
    this.xdtTransferSub = this.uxdClient.uxdTransferSubject.subscribe(res => {
      console.log('UXD transfered: ', res);
    });
    this.mintSub = this.uxdClient.mintSubject.subscribe(res => {
      console.log('got mint: ', res);
      let amount = ethers.utils.formatEther(res.quote)
      this.alertService.showToast(`${this.decimalPipe.transform(amount, "1.2-4")} UXD minted`)
    });
    this.redeemSub = this.uxdClient.redeemSubject.subscribe(res => {
      console.log('got redeem: ', res);
      console.log('UXD redeemed')
      let amount = ethers.utils.formatEther(res.quote)
      this.alertService.showToast(`${this.decimalPipe.transform(amount, "1.2-4")} UXD burned`)
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

  private async ethBalanceGreaterThan(amount: BigNumber): Promise<boolean> {
    const balance = await this.wallet.provider.getBalance(this.wallet.currentAccount)
    return balance.gte(amount)
  }

  private async wethBalanceGreaterThan(amount: BigNumber): Promise<boolean> {
    const balance = await this.uxdClient.tokenBalance(environment.weth, this.wallet.currentAccount)
    return balance.gte(amount)
  }

  private async uxdBalanceGreaterThan(amount: BigNumber): Promise<boolean> {
    const balance = await this.uxdClient.tokenBalance(environment.uxd, this.wallet.currentAccount)
    return balance.gte(amount)
  }

  private async showLoading(message: string) {
    this.loader = await this.loadingController.create({
      message
    })
    await this.loader?.present()
  }

  private async hideLoading() {
    await this.loader?.dismiss()
  }
}
