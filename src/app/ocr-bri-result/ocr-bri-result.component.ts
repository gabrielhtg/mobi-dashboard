import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ocr-bri-result',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './ocr-bri-result.component.html',
})
export class OcrBriResultComponent {
  transactionData: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['data'];
  }
}
