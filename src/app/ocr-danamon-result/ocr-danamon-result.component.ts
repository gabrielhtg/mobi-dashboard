import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  convertToFloat,
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-danamon-result.service';
import { map, mean, sum } from 'lodash';
import { apiUrl } from '../env';
import { ExcelExportService } from '../allservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ocr-danamon-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf, NgClass, FormsModule],
  templateUrl: './ocr-danamon-result.component.html',
})
export class OcrDanamonResultComponent {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined;

  @ViewChild('pemilikRekeningEl', { static: false })
  pemilikRekeningElement!: any;
  @ViewChild('nomorRekeningEl', { static: false })
  nomorRekeningElement!: any;

  validationRemark: any = null;
  isRekeningValid: any = null;

  transactionData: any;
  summaryData: any;
  analysisData: any;
  totalDebit: string = '';
  totalKredit: string = '';
  alamat: string = '';
  cabang: string = '';
  nomorNasabah: string = '';
  pemilikRekening: string = '';
  periodeLaporan: string = '';
  isPdfModified: any;
  saldoFraudDetection: boolean | null = null;
  transactionFraudDetection: boolean | null = null;
  susModFraudDetection: boolean | null = null;
  keteranganSaldoFraudDetection: string = '-';
  keteranganTransactionFraudDetection: string = '-';
  keteranganSusModFraudDetection: string = '-';
  indexTransaksiJanggal: number[] = [];
  startDate = '';
  endDate = '';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private excelExportService: ExcelExportService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.transactionData = navigation?.extras.state?.['transaction_data'];
    this.summaryData = navigation?.extras.state?.['summary_data'];
    this.analysisData = navigation?.extras.state?.['analytics_data'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.cabang = navigation?.extras.state?.['cabang'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.nomorNasabah = navigation?.extras.state?.['nomor_nasabah'];
    this.totalDebit = navigation?.extras.state?.['total_debet'];
    this.totalKredit = navigation?.extras.state?.['total_kredit'];
    this.periodeLaporan = navigation?.extras.state?.['periode_laporan'];
    this.isPdfModified = navigation?.extras.state?.['is_pdf_modified'];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    if (id !== null) {
      this.http
        .get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data-by-id/${id}`)
        .subscribe({
          next: (value) => {
            const tempResult = JSON.parse(value.data.result);

            this.transactionData = tempResult.transaction_data;
            this.summaryData = tempResult.summary_data;
            this.analysisData = tempResult.analytics_data;
            this.alamat = tempResult.alamat;
            this.cabang = tempResult.cabang;
            this.pemilikRekening = tempResult.pemilik_rekening;
            this.nomorNasabah = tempResult.nomor_nasabah;
            this.totalDebit = tempResult.total_debet;
            this.totalKredit = tempResult.total_kredit;
            this.periodeLaporan = tempResult.periode_laporan;
            this.isPdfModified = tempResult.is_pdf_modified;
          },
        });
    }

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
          data: [convertToFloat(this.analysisData.sum_kredit)],
          label: 'Kredit',
        },
        {
          data: [convertToFloat(this.analysisData.sum_debit)],
          label: 'Debit',
        },
      ],
    };

    this.dateTransactionData = getDateFrequency(this.transactionData);

    this.saldoMovementData = getSaldoMovement(
      this.transactionData,
      this.dateTransactionData.labels
    );

    this.validateBankAccount('011', this.nomorNasabah, this.pemilikRekening);
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

  updateField(index: number, field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.transactionData[index][field] = target.value;
    }
  }

  stdev(array: any[]) {
    var avg = sum(array) / array.length;
    return Math.sqrt(
      sum(map(array, (i) => Math.pow(i - avg, 2))) / array.length
    );
  }

  cekTransaksiJanggal(transactionData: any) {
    const kumpulanBiaya: any[] = [];
    const kumpulanPembelian: any[] = [];
    const kumpulanAdmin: any[] = [];
    const indexTransaksiMencurigakan: number[] = [];

    let banyakTransaksiMencurigakan = 0;

    transactionData.forEach((e: any, index: number) => {
      if (e.debit != null) {
        if (String(e.keterangan).toLowerCase().includes('biaya')) {
          kumpulanBiaya.push({
            index: index,
            value: convertToFloat(e.debit),
          });
        } else {
          kumpulanBiaya.push({
            index: null,
            value: 0,
          });
        }

        if (
          String(e.keterangan).toLowerCase().includes('pembelian') ||
          String(e.keterangan).toLowerCase().includes('payment')
        ) {
          kumpulanPembelian.push({
            index: index,
            value: convertToFloat(e.debit),
          });
        } else {
          kumpulanPembelian.push({
            index: null,
            value: 0,
          });
        }

        if (String(e.keterangan).toLowerCase().includes('admin')) {
          kumpulanAdmin.push({
            index: index,
            value: convertToFloat(e.debit),
          });
        } else {
          kumpulanAdmin.push({
            index: null,
            value: 0,
          });
        }
      }
    });

    const avgBiaya = mean(kumpulanBiaya.map((item) => item.value));
    const stdDevBiaya = this.stdev(kumpulanBiaya.map((item) => item.value));

    const avgPembelian = mean(kumpulanPembelian.map((item) => item.value));
    const stdDevPembelian = this.stdev(
      kumpulanPembelian.map((item) => item.value)
    );

    const avgAdmin = mean(kumpulanAdmin.map((item) => item.value));
    const stdDevAdmin = this.stdev(kumpulanAdmin.map((item) => item.value));

    kumpulanBiaya.forEach((e: any) => {
      if (e.value > stdDevBiaya * 2) {
        banyakTransaksiMencurigakan++;
        indexTransaksiMencurigakan.push(e.index);
      }
    });

    kumpulanPembelian.forEach((e: any) => {
      if (e.value > stdDevPembelian * 2) {
        banyakTransaksiMencurigakan++;
        indexTransaksiMencurigakan.push(e.index);
      }
    });

    kumpulanAdmin.forEach((e: any) => {
      if (e.value > stdDevAdmin * 2) {
        banyakTransaksiMencurigakan++;
        indexTransaksiMencurigakan.push(e.index);
      }
    });

    return {
      avgBiaya: avgBiaya,
      stdDevBiaya: stdDevBiaya,
      avgPembelian: avgPembelian,
      stdDevPembelian: stdDevPembelian,
      avgAdmin: avgAdmin,
      stdDevAdmin: stdDevAdmin,
      banyakTransaksiMencurigakan: banyakTransaksiMencurigakan,
      indexTransaksiMencurigakan: indexTransaksiMencurigakan,
    };
  }

  checkPotentialFraud() {
    let tempTotalDebet = 0;
    let tempTotalKredit = 0;
    let saldoAwal = convertToFloat(this.transactionData[0].saldo);
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
      (saldoAwal + tempTotalKredit - tempTotalDebet).toFixed(2)
    );

    if (expectedSaldoAkhir === saldoAkhir) {
      this.saldoFraudDetection = true;
      this.keteranganSaldoFraudDetection =
        'The total balance match based on the transaction report';
    } else {
      this.saldoFraudDetection = false;
      this.keteranganSaldoFraudDetection = `The total balance does not match based on the transaction report. Expected : ${expectedSaldoAkhir}, Actual : ${saldoAkhir}. Please check back!`;
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

    const dataTransaksiMencurigakan = this.cekTransaksiJanggal(
      this.transactionData
    );

    if (dataTransaksiMencurigakan.banyakTransaksiMencurigakan > 0) {
      this.transactionFraudDetection = false;
      this.indexTransaksiJanggal =
        dataTransaksiMencurigakan.indexTransaksiMencurigakan;
      this.keteranganTransactionFraudDetection = `${dataTransaksiMencurigakan.banyakTransaksiMencurigakan} suspicious transactions were found in this transaction report. The transactions are marked in red in the table above.`;
    } else {
      this.transactionFraudDetection = true;
      this.indexTransaksiJanggal = [];
      this.keteranganTransactionFraudDetection = `No suspicious transactions were found in this transaction report.`;
    }

    return {
      saldoFraudDetection: this.saldoFraudDetection,
      transactionFraudDetection: this.transactionFraudDetection,
      susModFraudDetection: this.susModFraudDetection,
    };
  }

  exportData() {
    this.excelExportService.exportToExcel(
      this.transactionData,
      'Danamon_Transaction_Data_Exported',
      [
        'tanggal_transaksi',
        'tanggal_valuta',
        'keterangan',
        'reff',
        'debit',
        'kredit',
        'saldo',
        'filename',
      ],
      this.startDate,
      this.endDate,
      [
        'Tanggal Transaksi',
        'Tanggal Valuta',
        'Keterangan',
        'Reff',
        'Debit',
        'Kredit',
        'Saldo',
        'File Name',
      ]
    );
  }
}
