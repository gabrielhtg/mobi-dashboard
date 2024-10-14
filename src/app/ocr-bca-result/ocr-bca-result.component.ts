import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartConfiguration } from 'chart.js';
import {
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-bca-result.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ocr-bca-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, FormsModule],
  templateUrl: './ocr-bca-result.component.html',
})
export class OcrBcaResultComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined;

  // input form
  saldoAkhir: string = '';
  mutasiDebit: string = '';
  mutasiKredit: string = '';
  jumlahMutasiKredit: string = '';
  jumlahMutasiDebit: string = '';
  saldoAwal: string = '';

  // ----------------

  // Data Chart.js
  transactionData: any;
  analyticsData: any;
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  lineChartOptions: ChartConfiguration<
    'bar' | 'line',
    number[],
    string | number
  >['options'] = {
    responsive: true,
  };

  // Data untuk debit kredit pertanggal yang ada pada bank statement
  barChartDebitKreditLabels: (string | number)[] | undefined;
  barChartDebitKreditData:
    | ChartData<'bar', number[], string | number>
    | undefined;

  // Data untuk perbandingan debit dengan kredit (bar chart)
  barTotalDebitKreditLabels: (string | number)[] | undefined;
  barTotalDebitKreditData:
    | ChartData<'bar', number[], string | number>
    | undefined;

  // Data untuk perbandingan banyaknya transaksi per tanggal yang ada pada bank statement
  dateTransactionData: any;

  // Data pergerakan saldo
  saldoMovementData: any;

  // -------------

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction-data'];
    this.analyticsData = navigation?.extras.state?.['analitics-data'];
  }

  ngOnInit(): void {
    this.saldoAwal = this.analyticsData.saldo_awal;
    this.mutasiKredit = this.analyticsData.mutasi_cr;
    this.jumlahMutasiKredit = this.analyticsData.jumlah_mutasi_cr;
    this.mutasiDebit = this.analyticsData.mutasi_db;
    this.jumlahMutasiDebit = this.analyticsData.jumlah_mutasi_db;
    this.saldoAkhir = this.analyticsData.saldo_akhir;

    this.barChartDebitKreditLabels = getMonthlyChartLabels(
      this.transactionData
    );

    this.barChartDebitKreditData = {
      labels: this.barChartDebitKreditLabels,
      datasets: getMonthlyChartDebitData(this.transactionData),
    };

    this.barTotalDebitKreditLabels = ['Total Debit Kredit'];
    this.barTotalDebitKreditData = {
      labels: this.barTotalDebitKreditLabels,
      datasets: [
        {
          data: [parseFloat(this.analyticsData.sum_cr.replaceAll(',', ''))],
          label: 'Kredit',
        },
        {
          data: [parseFloat(this.analyticsData.sum_db.replaceAll(',', ''))],
          label: 'Debit',
        },
      ],
    };

    this.dateTransactionData = getDateFrequency(this.transactionData);

    this.saldoMovementData = getSaldoMovement(this.transactionData);
  }

  updateValue(data: any, key: any, newValue: any) {
    data[key] = newValue;

    this.barTotalDebitKreditData = {
      ...this.barTotalDebitKreditData,
      labels: this.barTotalDebitKreditLabels,
      datasets: [
        {
          data: [parseFloat(this.analyticsData.sum_cr.replaceAll(',', ''))],
          label: 'Kredit',
        },
        {
          data: [parseFloat(this.analyticsData.sum_db.replaceAll(',', ''))],
          label: 'Debit',
        },
      ],
    };
  }
}
