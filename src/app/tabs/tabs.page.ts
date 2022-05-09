import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalAlertService } from '../services/global-alert.service';
import { WalletProviderService } from '../services/wallet-provider.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  isCorrectNetwork = true;
  account: any;
  networkSubscription?: Subscription;
  accountSubscription?: Subscription;
  constructor(
    private wallet: WalletProviderService,
    private alertService: GlobalAlertService,
    private zone: NgZone,
    ) {}

  ngOnInit(): void {
    this.setupListeners();
  }

  ngOnDestroy(): void {
    this.networkSubscription?.unsubscribe();
  }

  async switchNetwork() {
    await this.wallet.addNetwork();
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

  setupListeners() {
    this.networkSubscription = this.wallet.networkSubject.subscribe(async chainId => {
      await this.wallet.getAccounts();
      if (chainId) {
        this.zone.run(() => {
          this.isCorrectNetwork = chainId.toString(16).toLowerCase() === environment.chainId.toLocaleLowerCase();
          console.log(`Networks: ${chainId} <=> ${environment.chainId}`);
        });
      }
    });

    this.accountSubscription = this.wallet.accountSubject.subscribe(account => {
      this.account = account;
    });
  }
}
