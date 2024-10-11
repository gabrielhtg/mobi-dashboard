import { AfterViewInit, Component } from '@angular/core';
import { AngularCropperjsModule, CropperComponent } from 'angular-cropperjs';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import HSFileUpload from '@preline/file-upload';
import { HSStaticMethods } from 'preline/preline';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { apiUrlPy } from '../env';

@Component({
  selector: 'app-ocr-bank-py',
  standalone: true,
  imports: [AngularCropperjsModule, FormsModule, NgForOf, NgIf],
  templateUrl: './ocr-bank-py.component.html',
})
export class OcrBankPyComponent implements AfterViewInit {
  element: HSFileUpload | any;
  selectedBankStatement = '';

  // menyimpan value dari checkbox untuk memeriksa apakah zip yang diupload password protected
  isZipPasswordProtected = false;

  // model untuk menyimpan input password zip yang dimasukkan oleh user
  zipPassword: string | undefined;

  constructor(private router: Router, private http: HttpClient) {}

  ngAfterViewInit() {
    HSFileUpload.autoInit();
    this.tampilkanPesanError();

    /**
     * ! Penting untuk diketahui
     *
     *  @var selectedBankStatement memiliki value antara lain sebagai berikut ini.
     *      1 = bca corporate
     *      2 = bca personal
     *
     *  on sending disini berarti ketika si dropzone disend
     */

    this.element.dropzone.on('sendingmultiple', (files: any) => {
      const formData = new FormData();

      files.forEach((file: any, index: number) => {
        formData.append('files', file, file.name); // 'files' is the key for multiple files
      });

      /*
        ! Jenis-jenis tipe bank statement

        1 = BCA Corporate
        2 = BCA Personal
        3 = BRI
       */

      // Untuk bank BCA CORP ataupun BCA PERSONAL
      if (
        this.selectedBankStatement == '1' ||
        this.selectedBankStatement == '2'
      ) {
        formData.append('bank-statement-type', this.selectedBankStatement);

        if (this.isZipPasswordProtected) {
          formData.append('zip-password', this.zipPassword!);
        }

        this.http.post<any>(`${apiUrlPy}/proceed-bca`, formData).subscribe({
          next: (value) => {
            Swal.close();

            this.router
              .navigate(['/dashboard/ocr-bca-result'], {
                state: value,
              })
              .then();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text:
                err.error.data == undefined ? 'Unknown Error!' : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
            });
          },
        });
      }

      if (this.selectedBankStatement == '3') {
        if (this.isZipPasswordProtected) {
          formData.append('zip-password', this.zipPassword!);
        }

        formData.append('bank-statement-type', this.selectedBankStatement);

        this.http.post<any>(`${apiUrlPy}/proceed-bri`, formData).subscribe({
          next: (value) => {
            Swal.close();

            this.router
              .navigate(['/dashboard/ocr-bri-result'], {
                state: value,
              })
              .then();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text:
                err.error.data == undefined ? 'Unknown Error!' : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
            });
          },
        });
      }
    });
  }

  tampilkanPesanError() {
    const { element }: any = HSFileUpload.getInstance(
      '#hs-file-upload-with-limited-file-size',
      true
    );
    this.element = element;

    this.element.dropzone.on('error', (file: any, response: any) => {
      if (file.size > this.element.concatOptions.maxFilesize * 1024 * 1024) {
        const successEls = document.querySelectorAll(
          '[data-hs-file-upload-file-success]'
        );
        const errorEls = document.querySelectorAll(
          '[data-hs-file-upload-file-error]'
        );

        successEls.forEach((el: any) => (el.style.display = 'none'));
        errorEls.forEach((el: any) => (el.style.display = ''));
        HSStaticMethods.autoInit(['tooltip']);
      }
    });
  }

  uploadFile() {
    Swal.fire({
      title: 'Processing',
      text: 'Sedang melakukan processing. Mohon tunggu ...',
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.element.dropzone.processQueue();
  }
}
