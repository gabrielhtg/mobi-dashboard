import { NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  convertToFloat,
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-bni-result.service';
import { map, mean, sum } from 'lodash';
import { apiUrl } from '../env';
import { ExcelExportService } from '../allservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ocr-bni-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf, NgClass, FormsModule],
  templateUrl: './ocr-bni-result.component.html',
})
export class OcrBniResultComponent {
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
  totalDebetByOcr: string = '';
  totalCreditByOcr: string = '';
  akunRekening: string = '';
  alamat: string = '';
  nomorRekening: string = '';
  pemilikRekening: string = '';
  periodeRekening: string = '';
  tipeAkun: string = '';
  endingBalance: string = '';
  totalDebet: string = '';
  totalCredit: string = '';
  totalDebetAmount: string = '';
  totalCreditAmount: string = '';
  isPdfModified: any = null;
  startDate: string = '';
  endDate: string = '';
  startDateErrMsg = '';
  endDateErrMsg = '';

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

  saldoFraudDetection: boolean | null = null;
  transactionFraudDetection: boolean | null = null;
  susModFraudDetection: boolean | null = null;
  keteranganSaldoFraudDetection: string = '-';
  keteranganTransactionFraudDetection: string = '-';
  keteranganSusModFraudDetection: string = '-';
  indexTransaksiJanggal: number[] = [];
  isNotAllowedUsernameDetected =
    localStorage.getItem('username') === 'pocbfi1' ||
    localStorage.getItem('username') === 'pocbfi2';

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
    this.totalDebetByOcr = navigation?.extras.state?.['total_debet_by_ocr'];
    this.totalCreditByOcr = navigation?.extras.state?.['total_kredit_by_ocr'];
    this.akunRekening = navigation?.extras.state?.['akun_rekening'];
    this.alamat = navigation?.extras.state?.['alamat'];
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening'];
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening'];
    this.periodeRekening = navigation?.extras.state?.['periode_rekening'];
    this.tipeAkun = navigation?.extras.state?.['tipe_akun'];
    this.endingBalance = navigation?.extras.state?.['ending_balance'];
    this.totalDebet = navigation?.extras.state?.['total_debet'];
    this.totalCredit = navigation?.extras.state?.['total_credit'];
    this.totalDebetAmount = navigation?.extras.state?.['total_debet_amount'];
    this.totalCreditAmount = navigation?.extras.state?.['total_credit_amount'];
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
            this.totalDebetByOcr = tempResult.total_debet_by_ocr;
            this.totalCreditByOcr = tempResult.total_kredit_by_ocr;
            this.akunRekening = tempResult.akun_rekening;
            this.alamat = tempResult.alamat;
            this.nomorRekening = tempResult.nomor_rekening;
            this.pemilikRekening = tempResult.pemilik_rekening;
            this.periodeRekening = tempResult.periode_rekening;
            this.tipeAkun = tempResult.tipe_akun;
            this.endingBalance = tempResult.ending_balance;
            this.totalDebet = tempResult.total_debet;
            this.totalCredit = tempResult.total_credit;
            this.totalDebetAmount = tempResult.total_debet_amount;
            this.totalCreditAmount = tempResult.total_credit_amount;
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

            this.validateBankAccount(
              '009',
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

      this.validateBankAccount('009', this.nomorRekening, this.pemilikRekening);
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

    this.transactionData.forEach((e: any, index: number) => {
      if (e.debit_credit !== null && e.debit_credit.includes('D')) {
        if (String(e.transaction_description).toLowerCase().includes('biaya')) {
          kumpulanBiaya.push({
            index: index,
            value: convertToFloat(e.amount),
          });
        } else {
          kumpulanBiaya.push({
            index: null,
            value: 0,
          });
        }

        if (
          String(e.transaction_description)
            .toLowerCase()
            .includes('pembelian') ||
          String(e.transaction_description).toLowerCase().includes('payment')
        ) {
          kumpulanPembelian.push({
            index: index,
            value: convertToFloat(e.amount),
          });
        } else {
          kumpulanPembelian.push({
            index: null,
            value: 0,
          });
        }

        if (String(e.transaction_description).toLowerCase().includes('admin')) {
          kumpulanAdmin.push({
            index: index,
            value: convertToFloat(e.amount),
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
    let saldoAwal = convertToFloat(this.transactionData[0].balance);
    let saldoAkhir = convertToFloat(
      this.transactionData[this.transactionData.length - 1].balance
    );

    this.transactionData.forEach((e: any) => {
      if (e.debit_credit !== null) {
        if (e.debit_credit.includes('D')) {
          tempTotalDebet = tempTotalDebet + convertToFloat(e.amount);
        } else {
          tempTotalKredit = tempTotalKredit + convertToFloat(e.amount);
        }
      }
    });

    const expectedSaldoAkhir = parseFloat(
      (saldoAwal + tempTotalKredit - tempTotalDebet).toFixed(2)
    );

    console.log(expectedSaldoAkhir);
    console.log(saldoAkhir);

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
        if (e.posting_date !== null) {
          if (e.posting_date.trim() === this.startDate) {
            startDateFound = true;

            if (isEndDateFirst === false) {
              isStartDateFirst = true;
            }
          }

          if (e.posting_date.trim() === this.endDate) {
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
      'BNI_Transaction_Data_Exported',
      [
        'posting_date',
        'effective_date',
        'branch',
        'journal',
        'transaction_description',
        'amount',
        'debit_credit',
        'balance',
        'filename',
      ],
      this.startDate,
      this.endDate,
      [
        'Posting Date',
        'Effective Date',
        'Branch',
        'Journal',
        'Transaction Description',
        'Amount',
        'Debit Credit',
        'Balance',
        'File Name',
      ]
    );
  }
}
