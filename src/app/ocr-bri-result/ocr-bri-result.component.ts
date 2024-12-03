import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartConfiguration } from 'chart.js';
import {
  convertToFloat,
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-bri-result.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-ocr-bri-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf],
  templateUrl: './ocr-bri-result.component.html',
})
export class OcrBriResultComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined;

  @ViewChild('pemilikRekeningEl', { static: false })
  pemilikRekeningElement!: any;
  @ViewChild('nomorRekeningEl', { static: false })
  nomorRekeningElement!: any;

  pemilikRekening: string = '';
  alamat: string = '';
  nomorRekening: string = '';
  namaProduk: string = '';
  valuta: string = '';
  tanggalLaporan: string = '';
  periodeTransaksi: string = '';
  transactionData: any;
  totalDebit: string = '';
  totalKredit: string = '';
  analyticsData: any;
  saldoAwal: string = '';
  saldoAkhir: string = '';
  totalTransaksiDebit: string = '';
  totalTransaksiKredit: string = '';
  unitKerja: string = '';
  alamatUnitKerja: string = '';
  isPdfModified: any = null;
  saldoFraudDetection: boolean | null = null;
  transactionFraudDetection: boolean | null = null;
  susModFraudDetection: boolean | null = null;
  keteranganSaldoFraudDetection: string = '-';
  keteranganTransactionFraudDetection: string = '-';
  keteranganSusModFraudDetection: string = '-';

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
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.namaProduk = navigation?.extras.state?.['nama_produk'];
    this.valuta = navigation?.extras.state?.['valuta'];
    this.tanggalLaporan = navigation?.extras.state?.['tanggal_laporan'];
    this.transactionData = navigation?.extras.state?.['transaction_data'];
    this.totalDebit = navigation?.extras.state?.['total_debit'];
    this.totalKredit = navigation?.extras.state?.['total_kredit'];
    this.analyticsData = navigation?.extras.state?.['analytics_data'];
    this.saldoAwal = navigation?.extras.state?.['saldo_awal'];
    this.periodeTransaksi = navigation?.extras.state?.['periode_transaksi'];
    this.saldoAkhir = navigation?.extras.state?.['saldo_akhir'];
    this.unitKerja = navigation?.extras.state?.['unit_kerja'];
    this.alamatUnitKerja = navigation?.extras.state?.['alamat_unit_kerja'];
    this.isPdfModified = navigation?.extras.state?.['is_pdf_modified'];
    this.totalTransaksiDebit =
      navigation?.extras.state?.['total_transaksi_debit'];
    this.totalTransaksiKredit =
      navigation?.extras.state?.['total_transaksi_kredit'];
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

    this.validateBankAccount('002', this.nomorRekening, this.pemilikRekening);
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

  checkPotentialFraud() {
    let tempTotalDebet = 0;
    let tempTotalKredit = 0;
    let tempSaldoAwal = convertToFloat(this.saldoAwal);
    let saldoAkhir = convertToFloat(
      this.transactionData[this.transactionData.length - 1].saldo
    );

    this.transactionData.forEach((e: any) => {
      if (e.debit !== null) {
        tempTotalDebet = tempTotalDebet + convertToFloat(e.debit);
      }

      if (e.kredit !== null) {
        tempTotalKredit = tempTotalKredit + convertToFloat(e.kredit);
      }
    });

    const expectedSaldoAkhir = parseFloat(
      (tempSaldoAwal + tempTotalKredit - tempTotalDebet).toFixed(2)
    );

    console.log(expectedSaldoAkhir);
    console.log(saldoAkhir);
    console.log(tempTotalDebet);
    console.log(tempTotalKredit);

    if (expectedSaldoAkhir === saldoAkhir) {
      this.saldoFraudDetection = true;
      this.keteranganSaldoFraudDetection =
        'The total balance match based on the transaction report';
    } else {
      this.saldoFraudDetection = false;
      this.keteranganSaldoFraudDetection =
        'The total balance does not match based on the transaction report. Please check back!';
    }

    if (this.isPdfModified) {
      this.susModFraudDetection = false;
      this.keteranganSusModFraudDetection =
        'The document indicates it has been modified.';
    } else {
      this.susModFraudDetection = true;
      this.keteranganSusModFraudDetection =
        'The document does not indicate it has been modified.';
    }

    return {
      saldoFraudDetection: this.saldoFraudDetection,
      transactionFraudDetection: this.transactionFraudDetection,
      susModFraudDetection: this.susModFraudDetection,
    };
  }
}
