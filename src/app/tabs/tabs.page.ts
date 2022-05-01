import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
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

  setupListeners() {
    this.networkSubscription = this.wallet.networkSubject.subscribe(async chainId => {
      console.log('got chainId = ', chainId);
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
