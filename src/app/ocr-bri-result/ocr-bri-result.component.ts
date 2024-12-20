import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { map, mean, sum } from 'lodash';
import { apiUrl } from '../env';
import { ExcelExportService } from '../allservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ocr-bri-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf, NgClass, FormsModule],
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
  indexTransaksiJanggal: number[] = [];
  startDate: string = '';
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

  validationRemark: any = null;
  isRekeningValid: any = null;
  startDateErrMsg = '';
  endDateErrMsg = '';
  isNotAllowedUsernameDetected =
    localStorage.getItem('username') === 'pocbfi1' ||
    localStorage.getItem('username') === 'pocbfi2';

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private excelExportService: ExcelExportService
  ) {
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
    const id = this.route.snapshot.paramMap.get('id')!;

    if (id !== null) {
      this.http
        .get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data-by-id/${id}`)
        .subscribe({
          next: (value) => {
            const tempResult = JSON.parse(value.data.result);

            this.pemilikRekening = tempResult.pemilik_rekening;
            this.alamat = tempResult.alamat;
            this.nomorRekening = tempResult.nomor_rekening;
            this.namaProduk = tempResult.nama_produk;
            this.valuta = tempResult.valuta;
            this.tanggalLaporan = tempResult.tanggal_laporan;
            this.transactionData = tempResult.transaction_data;
            this.totalDebit = tempResult.total_debit;
            this.totalKredit = tempResult.total_kredit;
            this.analyticsData = tempResult.analytics_data;
            this.saldoAwal = tempResult.saldo_awal;
            this.periodeTransaksi = tempResult.periode_transaksi;
            this.saldoAkhir = tempResult.saldo_akhir;
            this.unitKerja = tempResult.unit_kerja;
            this.alamatUnitKerja = tempResult.alamat_unit_kerja;
            this.isPdfModified = tempResult.is_pdf_modified;
            this.totalTransaksiDebit = tempResult.total_transaksi_debit;
            this.totalTransaksiKredit = tempResult.total_transaksi_kredit;

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

            this.validateBankAccount(
              '002',
              this.nomorRekening,
              this.pemilikRekening
            );
          },
        });
    } else {
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
      if (e.debit !== null) {
        if (String(e.uraian_transaksi).toLowerCase().includes('biaya')) {
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
          String(e.uraian_transaksi).toLowerCase().includes('pembelian') ||
          String(e.uraian_transaksi).toLowerCase().includes('payment')
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

        if (String(e.uraian_transaksi).toLowerCase().includes('admin')) {
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

  updateField(index: number, field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.transactionData[index][field] = target.value;
    }
  }

  exportData() {
    let startDateFound = false;
    let endDateFound = false;
    let isStartDateFirst = false;
    let isEndDateFirst = false;

    if (this.startDate !== '' && this.endDate !== '') {
      this.transactionData.forEach((e: any) => {
        if (e.tanggal_transaksi !== null) {
          if (e.tanggal_transaksi.trim() === this.startDate) {
            startDateFound = true;

            if (isEndDateFirst === false) {
              isStartDateFirst = true;
            }
          }

          if (e.tanggal_transaksi.trim() === this.endDate) {
            endDateFound = true;

            if (isStartDateFirst === false) {
              isEndDateFirst = true;
            }
          }
        }
      });

      this.startDateErrMsg = '';
      this.endDateErrMsg = '';

      if (!startDateFound) {
        this.startDateErrMsg = `Transaction dated ${this.startDate} not found.`;
      }

      if (!endDateFound) {
        this.endDateErrMsg = `Transaction dated ${this.endDate} not found.`;
        return;
      }

      if (isEndDateFirst) {
        this.endDateErrMsg =
          'The end date cannot be earlier than the start date.';
        return;
      }

      if (!startDateFound || !endDateFound || isEndDateFirst) {
        return;
      }
    }

    this.excelExportService.exportToExcel(
      this.transactionData,
      'BRI_Transaction_Data_Exported',
      [
        'tanggal_transaksi',
        'uraian_transaksi',
        'teller',
        'debit',
        'kredit',
        'saldo',
        'filename',
      ],
      this.startDate,
      this.endDate,
      [
        'Tanggal Transaksi',
        'Uraian Transaksi',
        'Teller',
        'Debit',
        'Kredit',
        'Saldo',
        'File Name',
      ]
    );
  }
}
