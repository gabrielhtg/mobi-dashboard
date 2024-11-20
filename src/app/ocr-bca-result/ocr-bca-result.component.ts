import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
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
import { convertToFloat } from '../ocr-permata-result/ocr-permata-result.service';

@Component({
  selector: 'app-ocr-bca-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, FormsModule, NgIf],
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

  // Data Chart.js
  transactionData: any;
  analyticsData: any;

  alamat: string = '';
  kcp: string = '';
  mataUang: string = '';
  mutasiDebit: string = '';
  mutasiKredit: string = '';
  nomorRekening: string = '';
  pemilikRekening: string = '';
  periode: string = '';
  saldoAkhir: string = '';
  saldoAwal: string = '';
  totalDebet: string = '';
  totalKredit: string = '';
  totalMutasiDebit: string = '';
  totalMutasiKredit: string = '';
  isPdfModified: any = null;

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

  constructor(private router: Router, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction_data'];
    this.analyticsData = navigation?.extras.state?.['analytics_data'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.kcp = navigation?.extras.state?.['kcp'];
    this.mataUang = navigation?.extras.state?.['mata_uang'];
    this.mutasiDebit = navigation?.extras.state?.['mutasi_debit'];
    this.mutasiKredit = navigation?.extras.state?.['mutasi_kredit'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.periode = navigation?.extras.state?.['periode'];
    this.saldoAkhir = navigation?.extras.state?.['saldo_akhir'];
    this.saldoAwal = navigation?.extras.state?.['saldo_awal'];
    this.totalDebet = navigation?.extras.state?.['total_debet'];
    this.totalKredit = navigation?.extras.state?.['total_kredit'];
    this.totalMutasiDebit = navigation?.extras.state?.['total_mutasi_debit'];
    this.totalMutasiKredit = navigation?.extras.state?.['total_mutasi_kredit'];
    this.isPdfModified = navigation?.extras.state?.['is_pdf_modified'];
  }

  ngOnInit(): void {
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
          data: [convertToFloat(this.analyticsData.sum_kredit)],
          label: 'Kredit',
        },
        {
          data: [convertToFloat(this.analyticsData.sum_debit)],
          label: 'Debit',
        },
      ],
    };

    this.dateTransactionData = getDateFrequency(this.transactionData);
    this.saldoMovementData = getSaldoMovement(
      this.transactionData,
      this.dateTransactionData.labels
    );

    console.log(this.saldoMovementData);

    this.validateBankAccount('014', this.nomorRekening, this.pemilikRekening);
  }

  // updateValue(data: any, key: any, newValue: any) {
  //   data[key] = newValue;

  //   this.barTotalDebitKreditData = {
  //     ...this.barTotalDebitKreditData,
  //     labels: this.barTotalDebitKreditLabels,
  //     datasets: [
  //       {
  //         data: [parseFloat(this.analyticsData.sum_cr.replaceAll(',', ''))],
  //         label: 'Kredit',
  //       },
  //       {
  //         data: [parseFloat(this.analyticsData.sum_db.replaceAll(',', ''))],
  //         label: 'Debit',
  //       },
  //     ],
  //   };
  // }

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
