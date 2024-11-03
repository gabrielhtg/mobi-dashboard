import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import { HttpClient } from '@angular/common/http';

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

  @ViewChild('pemilikRekeningEl', { static: false })
  pemilikRekeningElement!: any;
  @ViewChild('nomorRekeningEl', { static: false })
  nomorRekeningElement!: any;

  isRekeningValid: any = null;

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
  tipeRekening: any;
  kcp: any;
  pemilikRekeningVal: any;
  nomorRekeningVal: any;
  periode: any;
  mataUang: any;

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

  validationRemark: any = null;

  netBal: any;

  // -------------

  constructor(private router: Router, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction-data'];
    this.analyticsData = navigation?.extras.state?.['analitics-data'];
    this.tipeRekening = navigation?.extras.state?.['tipe_rekening'];
    this.kcp = navigation?.extras.state?.['kcp'];
    this.pemilikRekeningVal = navigation?.extras.state?.['pemilik_rekening'];
    this.nomorRekeningVal = navigation?.extras.state?.['nomor_rekening'];
    this.periode = navigation?.extras.state?.['periode'];
    this.mataUang = navigation?.extras.state?.['mata_uang'];
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

    this.netBal =
      parseFloat(this.analyticsData.mutasi_cr.replaceAll(',', '')) -
      parseFloat(this.analyticsData.mutasi_db.replaceAll(',', ''));

    this.netBal = this.netBal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    this.validateBankAccount(
      '014',
      this.nomorRekeningVal,
      this.pemilikRekeningVal
    );
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

  validateBankAccount(bankCode: any, bankAccountNo: any, bankAccountName: any) {
    const requestBody = [
      {
        p_bank_code: bankCode,
        p_bank_account_no: bankAccountNo,
        p_bank_account_name: bankAccountName,
      },
    ];

    this.http
      .post<any>(
        'http://147.139.136.231/api/v5_ifinrmd_api/api/BankValidator/CheckBankAccountNo',
        requestBody
      )
      .subscribe({
        next: (value) => {
          if (value.data.validation_status == 'VALID') {
            this.validationRemark = value.data.validation_remark;
            this.isRekeningValid = true;
          } else {
            this.validationRemark = value.data.validation_remark;
            this.isRekeningValid = false;
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
