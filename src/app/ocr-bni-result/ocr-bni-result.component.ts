import { NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-ocr-bni-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective],
  templateUrl: './ocr-bni-result.component.html',
})
export class OcrBniResultComponent {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined;

  @ViewChild('pemilikRekening', { static: false })
  pemilikRekeningElement!: any;
  @ViewChild('nomorRekening', { static: false })
  nomorRekeningElement!: any;

  validationRemark: any = null;
  isRekeningValid: any = null;

  transactionData: any;
  summaryData: any;
  analysisData: any;
  totalDebit: string = '';
  totalKredit: string = '';
  akunRekening: string = '';
  alamat: string = '';
  nomorRekening: string = '';
  pemilikRekening: string = '';
  periodeRekening: string = '';
  tipeAkun: string = '';

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

  constructor(private http: HttpClient, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction_data'];
    this.summaryData = navigation?.extras.state?.['summary_data'];
    this.analysisData = navigation?.extras.state?.['analytics_data'];
    this.totalDebit = navigation?.extras.state?.['total_debet'];
    this.totalKredit = navigation?.extras.state?.['total_kredit'];
    this.akunRekening = navigation?.extras.state?.['akun_rekening'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.periodeRekening = navigation?.extras.state?.['periode_rekening'];
    this.tipeAkun = navigation?.extras.state?.['tipe_akun'];
  }

  ngOnInit(): void {
    // this.barChartDebitKreditLabels = getMonthlyChartLabels(
    //   this.transactionData
    // );

    // this.barChartDebitKreditData = {
    //   labels: this.barChartDebitKreditLabels,
    //   datasets: getMonthlyChartDebitData(this.transactionData),
    // };

    // this.barTotalDebitKreditLabels = ['Total Debit Kredit'];
    // this.barTotalDebitKreditData = {
    //   labels: this.barTotalDebitKreditLabels,
    //   datasets: [
    //     {
    //       data: [convertToFloat(this.analysisData.sum_kredit)],
    //       label: 'Kredit',
    //     },
    //     {
    //       data: [convertToFloat(this.analysisData.sum_debit)],
    //       label: 'Debit',
    //     },
    //   ],
    // };

    // this.dateTransactionData = getDateFrequency(this.transactionData);

    // this.saldoMovementData = getSaldoMovement(
    //   this.transactionData,
    //   this.dateTransactionData.labels
    // );

    this.validateBankAccount('009', this.nomorRekening, this.pemilikRekening);
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
