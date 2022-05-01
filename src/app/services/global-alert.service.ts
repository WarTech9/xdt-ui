import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { WalletProviderService } from './wallet-provider.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalAlertService {

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private provider: WalletProviderService,
    private router: Router,
    ) { }

  async presentNoConnectionAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'No Connection',
      message: 'No Web3 wallet was detected. To continue please install Metamask or another Web3 compatible wallet.',
      buttons: [ {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Canceled');
        }
      }, {
        text: 'Go To Metamask',
        handler: () => {
          window.open('https://metamask.io/', '_blank').focus();
          console.log('Confirm Okay');
        }
      }]
    });
    alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async showConnectAlert() {
    const alert = await this.alertController.create({
      header: 'Connect!',
      message: 'Please connect your wallet to proceed.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Connect',
          handler: () => {
            console.log('Confirm Okay');
            this.connect();
          }
        }
      ]
    });

    await alert.present();
  }

  async showMessageAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: [
        {
          text: 'Okay',
          role: 'okay',
          cssClass: 'primary',
        }
      ]
    });

    await alert.present();
  }

  async showErrorAlert(error: Error) {
    const anyError = (error as any);
    const alert = await this.alertController.create({
      header: 'An Error Occured',
      message: (anyError.data && anyError.data.message)? anyError.data.message : anyError.message,
      buttons: [
        {
          text: 'Okay',
          role: 'okay',
          cssClass: 'primary',
        }
      ]
    });

    await alert.present();
  }

  async showInsufficientBalanceAlert() {
    const alert = await this.alertController.create({
      header: 'Insufficient Balance',
      message: 'The balance in your account is less than the required amount to proceed.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Get More Tokens',
          handler: () => {
            const faucet = environment.faucet;
            window.open(faucet, '_blank').focus();
          }
        }
      ]
    });

    await alert.present();
  }

  async showTransactionAlert(txHash: string) {
    const alert = await this.alertController.create({
      header: 'Transaction sent',
      message: 'Your transaction has been sent. Your balances will be updated once it is confirmed.',
      buttons: [
        {
          text: 'Okay',
          role: 'okay',
        }, {
          text: 'View transaction',
          handler: () => {
            const url = `${environment.txUrlPrefix}/${txHash}`;
            window.open(url, '_blank').focus();
          }
        }
      ]
    });

    await alert.present(); 
  }
  async showOkayAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: [
        {
          text: 'Okay',
          role: 'okay',
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, timeout: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration: timeout
    });
    await toast.present();
  }

  async connect() {
    const isConected = await this.provider.connect();
    console.log('connect clicked with result: ', isConected);
    if (isConected) {
      this.provider.getAccounts();
    } else {
      this.presentNoConnectionAlert();
    }
  }

}
