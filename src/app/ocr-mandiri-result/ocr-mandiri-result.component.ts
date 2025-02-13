import { HttpClient, HttpHeaders } from '@angular/common/http'
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NgClass, NgForOf, NgIf } from '@angular/common'
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'
import {
  convertToFloat,
  getDateFrequency,
  getMonthlyChartDebitData,
  getMonthlyChartLabels,
  getSaldoMovement,
} from './ocr-mandiri-result.service'
import { map, mean, sum } from 'lodash'
import { apiUrl } from '../env'
import { ExcelExportService, formatRupiah } from '../allservice'
import { FormsModule } from '@angular/forms'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-ocr-mandiri-result',
  standalone: true,
  imports: [NgForOf, BaseChartDirective, NgIf, NgClass, FormsModule],
  templateUrl: './ocr-mandiri-result.component.html',
})
export class OcrMandiriResultComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts:
    | QueryList<BaseChartDirective>
    | undefined

  @ViewChild('pemilikRekeningEl', { static: false })
  pemilikRekeningElement!: any
  @ViewChild('nomorRekeningEl', { static: false })
  nomorRekeningElement!: any

  validationRemark: any = null
  isRekeningValid: any = null

  transactionData: any
  analysisData: any
  totalDebit: string = ''
  totalKredit: string = ''
  periode: string = ''
  nomorRekening: string = ''
  pemilikRekening: string = ''
  currency: string = ''
  branch: string = ''
  totalTransaction: number = 0
  isPdfModified: any
  indexTransaksiJanggal: number[] = []
  startDateErrMsg = ''
  holidayFraudDetection: boolean | null = null
  keteranganHolidayFraudDetection: string = '-'
  endDateErrMsg = ''
  isNotAllowedUsernameDetected =
    localStorage.getItem('username') === 'pocbfi1' ||
    localStorage.getItem('username') === 'pocbfi2'

  barChartOptions: ChartOptions = {
    responsive: true,
  }
  lineChartOptions: ChartConfiguration<
    'bar' | 'line',
    number[],
    string | number
  >['options'] = {
    responsive: true,
  }

  barChartDebitKreditLabels: (string | number)[] | undefined
  barChartDebitKreditData:
    | ChartData<'bar', number[], string | number>
    | undefined

  // Data untuk perbandingan debit dengan kredit (bar chart)
  barTotalDebitKreditLabels: (string | number)[] | undefined
  barTotalDebitKreditData:
    | ChartData<'bar', number[], string | number>
    | undefined

  // Data untuk perbandingan banyaknya transaksi per tanggal yang ada pada bank statement
  dateTransactionData: any

  // Data pergerakan saldo
  saldoMovementData: any

  saldoFraudDetection: boolean | null = null
  transactionFraudDetection: boolean | null = null
  susModFraudDetection: boolean | null = null
  keteranganSaldoFraudDetection: string = '-'
  keteranganTransactionFraudDetection: string = '-'
  keteranganSusModFraudDetection: string = '-'
  startDate = ''
  endDate = ''
  id: string = ''

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private excelExportService: ExcelExportService
  ) {
    const navigation = this.router.getCurrentNavigation()
    this.transactionData = navigation?.extras.state?.['transaction_data']
    this.analysisData = navigation?.extras.state?.['analytics_data']
    this.totalDebit = navigation?.extras.state?.['total_debet']
    this.totalKredit = navigation?.extras.state?.['total_kredit']
    this.periode = navigation?.extras.state?.['period']
    this.nomorRekening = navigation?.extras.state?.['nomor_rekening']
    this.pemilikRekening = navigation?.extras.state?.['pemilik_rekening']
    this.currency = navigation?.extras.state?.['currency']
    this.branch = navigation?.extras.state?.['branch']
    this.isPdfModified = navigation?.extras.state?.['is_pdf_modified']

    if (this.analysisData) {
      this.totalTransaction = this.analysisData.total_transaction
    }
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!

    if (this.id !== null) {
      this.http
        .get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data-by-id/${this.id}`)
        .subscribe({
          next: (value) => {
            const tempResult = JSON.parse(value.data.result)

            this.transactionData = tempResult.transaction_data
            this.analysisData = tempResult.analytics_data
            this.totalDebit = tempResult.total_debet
            this.totalKredit = tempResult.total_kredit
            this.periode = tempResult.period
            this.nomorRekening = tempResult.nomor_rekening
            this.pemilikRekening = tempResult.pemilik_rekening
            this.currency = tempResult.currency
            this.branch = tempResult.branch
            this.isPdfModified = tempResult.is_pdf_modified
            this.totalTransaction = this.analysisData.total_transaction

            this.barChartDebitKreditLabels = getMonthlyChartLabels(
              this.transactionData
            )

            this.barChartDebitKreditData = {
              labels: this.barChartDebitKreditLabels,
              datasets: getMonthlyChartDebitData(this.transactionData),
            }

            console.log(this.barChartDebitKreditData)

            this.barTotalDebitKreditLabels = ['Total Debit Kredit']
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
            }

            this.dateTransactionData = getDateFrequency(this.transactionData)

            this.saldoMovementData = getSaldoMovement(
              this.transactionData,
              this.dateTransactionData.labels
            )

            console.log(this.saldoMovementData)

            this.validateBankAccount(
              '008',
              this.nomorRekening,
              this.pemilikRekening
            )
            this.checkPotentialFraud()
          },
        })
    } else {
      this.barChartDebitKreditLabels = getMonthlyChartLabels(
        this.transactionData
      )

      this.barChartDebitKreditData = {
        labels: this.barChartDebitKreditLabels,
        datasets: getMonthlyChartDebitData(this.transactionData),
      }

      console.log(this.barChartDebitKreditData)

      this.barTotalDebitKreditLabels = ['Total Debit Kredit']
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
      }

      this.dateTransactionData = getDateFrequency(this.transactionData)

      this.saldoMovementData = getSaldoMovement(
        this.transactionData,
        this.dateTransactionData.labels
      )

      console.log(this.saldoMovementData)

      this.validateBankAccount('008', this.nomorRekening, this.pemilikRekening)
    }
  }

  validateBankAccount(bankCode: any, bankAccountNo: any, bankAccountName: any) {
    const requestBody = [
      {
        p_bank_code: bankCode,
        p_bank_account_no: bankAccountNo,
        p_bank_account_name: bankAccountName,
      },
    ]

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
            this.validationRemark = value.data.validation_remark
            this.isRekeningValid = true
          } else {
            this.validationRemark = value.data.validation_remark
            this.isRekeningValid = false
          }
        },
        error: (error) => {
          console.log(error)
        },
      })
  }

  stdev(array: any[]) {
    var avg = sum(array) / array.length
    return Math.sqrt(
      sum(map(array, (i) => Math.pow(i - avg, 2))) / array.length
    )
  }

  cekTransaksiJanggal(transactionData: any) {
    const kumpulanBiaya: any[] = []
    const kumpulanPembelian: any[] = []
    const kumpulanAdmin: any[] = []
    const indexTransaksiMencurigakan: number[] = []

    let banyakTransaksiMencurigakan = 0

    transactionData.forEach((e: any, index: number) => {
      if (e.debit !== null) {
        if (String(e.description).toLowerCase().includes('biaya')) {
          kumpulanBiaya.push({
            index: index,
            value: convertToFloat(e.debit),
          })
        } else {
          kumpulanBiaya.push({
            index: null,
            value: 0,
          })
        }

        if (
          String(e.description).toLowerCase().includes('pembelian') ||
          String(e.description).toLowerCase().includes('payment')
        ) {
          kumpulanPembelian.push({
            index: index,
            value: convertToFloat(e.debit),
          })
        } else {
          kumpulanBiaya.push({
            index: null,
            value: 0,
          })
        }

        if (String(e.description).toLowerCase().includes('admin')) {
          kumpulanAdmin.push({
            index: index,
            value: convertToFloat(e.debit),
          })
        } else {
          kumpulanAdmin.push({
            index: null,
            value: 0,
          })
        }
      }
    })

    const avgBiaya = mean(kumpulanBiaya.map((item) => item.value))
    const stdDevBiaya = this.stdev(kumpulanBiaya.map((item) => item.value))

    const avgPembelian = mean(kumpulanPembelian.map((item) => item.value))
    const stdDevPembelian = this.stdev(
      kumpulanPembelian.map((item) => item.value)
    )

    const avgAdmin = mean(kumpulanAdmin.map((item) => item.value))
    const stdDevAdmin = this.stdev(kumpulanAdmin.map((item) => item.value))

    kumpulanBiaya.forEach((e: any) => {
      if (e.value > stdDevBiaya * 2) {
        banyakTransaksiMencurigakan++
        indexTransaksiMencurigakan.push(e.index)
      }
    })

    kumpulanPembelian.forEach((e: any) => {
      if (e.value > stdDevPembelian * 2) {
        banyakTransaksiMencurigakan++
        indexTransaksiMencurigakan.push(e.index)
      }
    })

    kumpulanAdmin.forEach((e: any) => {
      if (e.value > stdDevAdmin * 2) {
        banyakTransaksiMencurigakan++
        indexTransaksiMencurigakan.push(e.index)
      }
    })

    return {
      avgBiaya: avgBiaya,
      stdDevBiaya: stdDevBiaya,
      avgPembelian: avgPembelian,
      stdDevPembelian: stdDevPembelian,
      avgAdmin: avgAdmin,
      stdDevAdmin: stdDevAdmin,
      banyakTransaksiMencurigakan: banyakTransaksiMencurigakan,
      indexTransaksiMencurigakan: indexTransaksiMencurigakan,
    }
  }

  isHolidayTransaction() {
    let holidayData: any[] = []
    const susDate: any[] = []

    this.http.get<any>(`${apiUrl}/g-ocr-bank/get-holiday`).subscribe({
      next: (value) => {
        holidayData = value.data

        this.transactionData.forEach((data: any, index: number) => {
          for (let i = 0; i < holidayData.length; i++) {
            const formattedDate = new Date(
              holidayData[i].HOLIDAY_DATE
            ).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })

            if (data.date_and_time !== null) {
              if (formattedDate === data.date_and_time.split(' ')[0].trim()) {
                susDate.push({
                  holiday_data: holidayData[i],
                  sus_date: formattedDate,
                })
              }
            }
          }

          if (susDate.length > 0) {
            this.holidayFraudDetection = false
            const tempDate: any[] = []

            susDate.forEach((e) => {
              tempDate.push(e.sus_date)
            })

            this.keteranganHolidayFraudDetection = `Suspicious transaction date detected at ${[
              ...new Set(tempDate),
            ].join(', ')}`
          } else {
            this.holidayFraudDetection = true
            this.keteranganHolidayFraudDetection = `No suspicious transaction date detected.`
          }
        })
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text:
            err.error.data == undefined
              ? 'Failed to connect with SYS_HOLIDAY.'
              : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
        })

        return
      },
    })
  }

  checkPotentialFraud() {
    let tempTotalDebet = 0
    let tempTotalKredit = 0
    let saldoAwal = convertToFloat(this.transactionData[0].saldo)
    let saldoAkhir = convertToFloat(
      this.transactionData[this.transactionData.length - 1].saldo
    )

    this.transactionData.forEach((e: any) => {
      if (e.debit !== null) {
        tempTotalDebet = tempTotalDebet + convertToFloat(e.debit)
      }

      if (e.kredit !== null) {
        tempTotalKredit = tempTotalKredit + convertToFloat(e.kredit)
      }
    })

    const expectedSaldoAkhir = parseFloat(
      (saldoAwal + tempTotalKredit - tempTotalDebet).toFixed(2)
    )

    if (expectedSaldoAkhir === saldoAkhir) {
      this.saldoFraudDetection = true
      this.keteranganSaldoFraudDetection =
        'The total balance match based on the transaction report'
    } else {
      this.saldoFraudDetection = false
      this.keteranganSaldoFraudDetection = `The total balance does not match based on the transaction report. Expected : ${formatRupiah(expectedSaldoAkhir)}, Actual : ${formatRupiah(saldoAkhir)}. Please check back!`
    }

    if (this.isPdfModified) {
      this.susModFraudDetection = false
      this.keteranganSusModFraudDetection =
        'The document indicates it has been modified.'
    } else {
      this.susModFraudDetection = true
      this.keteranganSusModFraudDetection =
        'The document does not indicate it has been modified.'
    }

    const dataTransaksiMencurigakan = this.cekTransaksiJanggal(
      this.transactionData
    )

    if (dataTransaksiMencurigakan.banyakTransaksiMencurigakan > 0) {
      this.transactionFraudDetection = false
      this.indexTransaksiJanggal =
        dataTransaksiMencurigakan.indexTransaksiMencurigakan
      this.keteranganTransactionFraudDetection = `${dataTransaksiMencurigakan.banyakTransaksiMencurigakan} suspicious transactions were found in this transaction report. The transactions are marked in red in the table above.`
    } else {
      this.transactionFraudDetection = true
      this.indexTransaksiJanggal = []
      this.keteranganTransactionFraudDetection = `No suspicious transactions were found in this transaction report.`
    }

    this.isHolidayTransaction()

    return {
      saldoFraudDetection: this.saldoFraudDetection,
      transactionFraudDetection: this.transactionFraudDetection,
      susModFraudDetection: this.susModFraudDetection,
    }
  }

  updateField(index: number, field: string, event: Event): void {
    const target = event.target as HTMLInputElement
    if (target) {
      this.transactionData[index][field] = target.value
    }
  }

  exportData() {
    let startDateFound = false
    let endDateFound = false
    let isStartDateFirst = false
    let isEndDateFirst = false

    if (this.startDate !== '' && this.endDate !== '') {
      this.transactionData.forEach((e: any) => {
        if (e.date_and_time !== null) {
          if (e.date_and_time.trim() === this.startDate) {
            startDateFound = true

            if (!isEndDateFirst) {
              isStartDateFirst = true
            }
          }

          if (e.date_and_time.trim() === this.endDate) {
            endDateFound = true

            if (!isStartDateFirst) {
              isEndDateFirst = true
            }
          }
        }
      })

      this.startDateErrMsg = ''
      this.endDateErrMsg = ''

      if (!startDateFound) {
        this.startDateErrMsg = `Transaction dated ${this.startDate} not found.`
      }

      if (!endDateFound) {
        this.endDateErrMsg = `Transaction dated ${this.endDate} not found.`
        return
      }

      if (isEndDateFirst) {
        this.endDateErrMsg =
          'The end date cannot be earlier than the start date.'
        return
      }

      if (!startDateFound || !endDateFound || isEndDateFirst) {
        return
      }
    }

    this.excelExportService.exportToExcel(
      this.transactionData,
      'Mandiri_Transaction_Data_Exported',
      [
        'date_and_time',
        'value_date',
        'description',
        'refference_no',
        'debit',
        'kredit',
        'saldo',
        'filename',
      ],
      this.startDate,
      this.endDate,
      [
        'Date and Time',
        'Value Date',
        'Description',
        'Refference No',
        'Debit',
        'Kredit',
        'Saldo',
        'File Name',
      ]
    )
  }
}
