import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  currentSegment = 'mint';
  assetSymbol = 'XDT';
  isApproved = false;
  constructor() {}

  onSegmentChanged(event) {
    this.currentSegment = event.target.value;
  }

  approve() {}

  connect() {}

  mint() {}

  redeem() {}
}
