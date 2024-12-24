import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartConfiguration } from 'chart.js';
import {
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-bca-result.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mean, sum, map } from 'lodash';
import { convertToFloat, ExcelExportService } from '../allservice';
import { apiUrl } from '../env';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ocr-bca-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, FormsModule, NgIf, NgClass],
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

  id: string | null = '';
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
  saldoFraudDetection: boolean | null = null;
  transactionFraudDetection: boolean | null = null;
  susModFraudDetection: boolean | null = null;
  holidayFraudDetection: boolean | null = null;
  keteranganHolidayFraudDetection: string = '-';
  keteranganSaldoFraudDetection: string = '-';
  keteranganTransactionFraudDetection: string = '-';
  keteranganSusModFraudDetection: string = '-';
  indexTransaksiJanggal: number[] = [];
  startDate = '';
  endDate = '';
  startDateErrMsg = '';
  endDateErrMsg = '';
  isNotAllowedUsernameDetected =
    localStorage.getItem('username') === 'pocbfi1' ||
    localStorage.getItem('username') === 'pocbfi2';

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

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private excelExportService: ExcelExportService
  ) {
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
    this.id = this.route.snapshot.paramMap.get('id')!;

    if (this.id !== null) {
      this.http
        .get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data-by-id/${this.id}`)
        .subscribe({
          next: (value) => {
            const tempResult = JSON.parse(value.data.result);

            this.transactionData = tempResult.transaction_data;
            this.analyticsData = tempResult.analytics_data;
            this.alamat = tempResult.alamat;
            this.kcp = tempResult.kcp;
            this.mataUang = tempResult.mata_uang;
            this.mutasiDebit = tempResult.mutasi_debit;
            this.mutasiKredit = tempResult.mutasi_kredit;
            this.nomorRekening = tempResult.nomor_rekening;
            this.pemilikRekening = tempResult.pemilik_rekening;
            this.periode = tempResult.periode;
            this.saldoAkhir = tempResult.saldo_akhir;
            this.saldoAwal = tempResult.saldo_awal;
            this.totalDebet = tempResult.total_debet;
            this.totalKredit = tempResult.total_kredit;
            this.totalMutasiDebit = tempResult.total_mutasi_debit;
            this.totalMutasiKredit = tempResult.total_mutasi_kredit;
            this.isPdfModified = tempResult.is_pdf_modified;

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
              '014',
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

      this.validateBankAccount('014', this.nomorRekening, this.pemilikRekening);
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
      if (String(e.mutasi).includes('DB')) {
        if (String(e.keterangan).toLowerCase().includes('biaya')) {
          kumpulanBiaya.push({
            index: index,
            value: convertToFloat(e.mutasi),
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
            value: convertToFloat(e.mutasi),
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
            value: convertToFloat(e.mutasi),
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

  isHolidayTransaction() {
    let holidayData: any[] = [];
    const susDate: any[] = [];

    this.http.get<any>(`${apiUrl}/g-ocr-bank/get-holiday`).subscribe({
      next: (value) => {
        holidayData = value.data;

        this.transactionData.forEach((data: any, index: number) => {
          for (let i = 0; i < holidayData.length; i++) {
            const formattedDate = new Date(
              holidayData[i].HOLIDAY_DATE
            ).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
            });

            if (data.tanggal !== null) {
              if (formattedDate === data.tanggal.trim()) {
                susDate.push({
                  holiday_data: holidayData[i],
                  sus_date: formattedDate,
                });
              }
            }
          }

          if (susDate.length > 0) {
            this.holidayFraudDetection = false;
            const tempDate: any[] = [];

            susDate.forEach((e) => {
              tempDate.push(e.sus_date);
            });

            this.keteranganHolidayFraudDetection = `Suspicious transaction date detected at ${[
              ...new Set(tempDate),
            ].join(', ')}`;
          } else {
            this.holidayFraudDetection = true;
            this.keteranganHolidayFraudDetection = `No suspicious transaction date detected.`;
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text:
            err.error.data == undefined
              ? 'Failed to connect with SYS_HOLIDAY.'
              : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
        });

        return;
      },
    });
  }

  checkPotentialFraud() {
    let tempTotalDebet = 0;
    let tempTotalKredit = 0;
    let saldoAwal = convertToFloat(this.transactionData[0].saldo);
    let saldoAkhir = convertToFloat(
      this.transactionData[this.transactionData.length - 1].saldo
    );

    this.transactionData.forEach((e: any) => {
      if (e.mutasi !== null) {
        if (e.mutasi.includes('DB')) {
          tempTotalDebet = tempTotalDebet + convertToFloat(e.mutasi);
        } else {
          tempTotalKredit = tempTotalKredit + convertToFloat(e.mutasi);
        }
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

    this.isHolidayTransaction();

    return {
      saldoFraudDetection: this.saldoFraudDetection,
      transactionFraudDetection: this.transactionFraudDetection,
      susModFraudDetection: this.susModFraudDetection,
    };
  }

  exportData() {
    let startDateFound = false;
    let endDateFound = false;
    let isStartDateFirst = false;
    let isEndDateFirst = false;

    if (this.startDate !== '' && this.endDate !== '') {
      this.transactionData.forEach((e: any) => {
        if (e.tanggal !== null) {
          if (e.tanggal.trim() === this.startDate) {
            startDateFound = true;

            if (isEndDateFirst === false) {
              isStartDateFirst = true;
            }
          }

          if (e.tanggal.trim() === this.endDate) {
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
      'BCA_Transaction_Data_Exported',
      ['tanggal', 'keterangan', 'cbg', 'mutasi', 'saldo', 'filename'],
      this.startDate,
      this.endDate,
      ['Tanggal', 'Keterangan', 'Cabang', 'Mutasi', 'Saldo', 'File Name']
    );
  }
}
