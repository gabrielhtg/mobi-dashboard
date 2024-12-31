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
  usersData: any[] = []
  fromDate: string = ''
  toDate: string = ''
  bankType: string = ''
  fileType: string = ''
  uploader: string = ''
  ocrStatus: string = ''
  show: boolean = false

  constructor(private http: HttpClient) {}

  getReportData() {
    let params = new HttpParams()
    params = params.set('bank_type', this.bankType)
    params = params.set('file_type', this.fileType)
    params = params.set('ocr_status', this.ocrStatus)
    params = params.set('from_date', this.fromDate)
    params = params.set('to_date', this.toDate)
    params = params.set('uploader', this.uploader)

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

  getUsers() {
    this.http.get<any>(`${apiUrl}/users`).subscribe({
      next: (value) => {
        this.usersData = value.data.map((item: any) => {
          return {
            ...item,
          }
        })
        console.log(this.usersData)
        this.show = true
        console.log(this.show)
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
    this.getUsers()
  }

  protected readonly formatWaktu = formatWaktu
  protected readonly apiUrl = apiUrl
  protected readonly JSON = JSON
}
