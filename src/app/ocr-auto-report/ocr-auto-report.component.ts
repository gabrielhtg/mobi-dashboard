import { NgForOf, NgIf } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { apiUrl } from '../env'
import { formatWaktu } from '../tables/table-log-activity/table-log-activity.service'
import Swal from 'sweetalert2'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-ocr-auto-report',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule],
  templateUrl: './ocr-auto-report.component.html',
})
export class OcrAutoReportComponent implements OnInit {
  ocrData: any[] = []
  fromDate: string = ''
  toDate: string = ''
  bankType: string = ''
  fileType: string = ''
  ocrStatus: string = ''

  constructor(private http: HttpClient) {}

  getReportData() {
    console.log(this.bankType)

    let params = new HttpParams()
    params = params.set('bank_type', this.bankType)
    params = params.set('file_type', this.fileType)
    params = params.set('ocr_status', this.ocrStatus)
    params = params.set('from_date', this.fromDate)
    params = params.set('to_date', this.toDate)

    this.http
      .get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data`, { params })
      .subscribe({
        next: (value) => {
          this.ocrData = value.data.map((item: any) => {
            return {
              ...item,
              file_name: JSON.parse(item.file_name),
            }
          })
        },
      })
  }

  showError(errorMsg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: errorMsg,
    })
  }

  ngOnInit(): void {
    this.getReportData()
  }

  protected readonly formatWaktu = formatWaktu
}
