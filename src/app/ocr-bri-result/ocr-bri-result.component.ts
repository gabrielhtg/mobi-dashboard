import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartConfiguration } from 'chart.js';
import {
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-bri-result.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ocr-bri-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective],
  templateUrl: './ocr-bri-result.component.html',
})
export class OcrBriResultComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined;

  @ViewChild('pemilikRekening', { static: false })
  pemilikRekeningElement!: any;
  @ViewChild('nomorRekening', { static: false })
  nomorRekeningElement!: any;

  transactionData: any;
  summaryData: any;
  analysisData: any;
  alamat: string = '';
  alamatUnitKerja: string = '';
  namaProduk: string = '';
  nomorRekening: string = '';
  pemilikRekening: string = '';
  periodeTransaksi: string = '';
  tanggalLaporan: string = '';
  valuta: string = '';
  unitKerja: string = '';

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

  validationRemark: any = null;
  isRekeningValid: any = null;

  constructor(private router: Router, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction_data'];
    this.summaryData = navigation?.extras.state?.['summary_data'];
    this.analysisData = navigation?.extras.state?.['analysis_data'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.alamatUnitKerja = navigation?.extras.state?.['alamat_unit_kerja'];
    this.namaProduk = navigation?.extras.state?.['nama_produk'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.periodeTransaksi = navigation?.extras.state?.['periode_transaksi'];
    this.tanggalLaporan = navigation?.extras.state?.['tanggal_laporan'];
    this.unitKerja = navigation?.extras.state?.['unit_kerja'];
    this.valuta = navigation?.extras.state?.['valuta'];
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
          data: [parseFloat(this.analysisData.sum_kredit.replaceAll(',', ''))],
          label: 'Kredit',
        },
        {
          data: [parseFloat(this.analysisData.sum_debit.replaceAll(',', ''))],
          label: 'Debit',
        },
      ],
    };

    this.dateTransactionData = getDateFrequency(this.transactionData);

    this.saldoMovementData = getSaldoMovement(this.transactionData);

    this.validateBankAccount('014', this.nomorRekening, this.pemilikRekening);
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
