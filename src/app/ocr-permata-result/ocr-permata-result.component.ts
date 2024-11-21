import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-permata-result.service';

@Component({
  selector: 'app-ocr-permata-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf],
  templateUrl: './ocr-permata-result.component.html',
})
export class OcrPermataResultComponent {
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
  alamat: string = '';
  cabang: string = '';
  mataUang: string = '';
  namaProduk: string = '';
  nomorCif: string = '';
  nomorRekening: string = '';
  pemilikRekening: string = '';
  periodeLaporan: string = '';
  tanggalLaporan: string = '';
  totalDebet: string = '';
  totalKredit: string = '';
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
    this.alamat = navigation?.extras.state?.['alamat'];
    this.cabang = navigation?.extras.state?.['cabang'];
    this.mataUang = navigation?.extras.state?.['mata_uang'];
    this.namaProduk = navigation?.extras.state?.['nama_produk'];
    this.nomorCif = navigation?.extras.state?.['no_cif'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.periodeLaporan = navigation?.extras.state?.['periode_laporan'];
    this.tanggalLaporan = navigation?.extras.state?.['tanggal_laporan'];
    this.isPdfModified = navigation?.extras.state?.['is_pdf_modified'];
    this.totalDebet = String(navigation?.extras.state?.['total_debet']);
    this.totalKredit = String(navigation?.extras.state?.['total_kredit']);
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
          data: [
            parseFloat(
              this.analysisData.sum_kredit
                .replaceAll(',', '')
                .replaceAll('Rp ', '')
                .replaceAll('.', '')
            ) / 100,
          ],
          label: 'Kredit',
        },
        {
          data: [
            parseFloat(
              this.analysisData.sum_debit
                .replaceAll(',', '')
                .replaceAll('Rp ', '')
                .replaceAll('.', '')
            ) / 100,
          ],
          label: 'Debit',
        },
      ],
    };

    this.dateTransactionData = getDateFrequency(this.transactionData);

    console.log(this.dateTransactionData);

    this.saldoMovementData = getSaldoMovement(
      this.transactionData,
      this.dateTransactionData.labels
    );

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
        requestBody,
        {
          headers: new HttpHeaders({
            UserId: 'bmltZEE%3D',
          }),
        }
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
