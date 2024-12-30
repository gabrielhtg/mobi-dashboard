import { AfterViewInit, Component } from '@angular/core';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import HSFileUpload from '@preline/file-upload';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { proceedOcrBca } from './services/bca.services';
import proceedOcrBri from './services/bri.services';
import proceedOcrPermata from './services/permata.services';
import proceedOcrDanamon from './services/danamon.services';
import proceedOcrBni from './services/bni.services';
import proceedOcrCimb from './services/cimb.services';
import proceedOcrOcbc from './services/ocbc.services';
import proceedOcrMandiri from './services/mandiri.services';
import { HSStaticMethods } from 'preline/preline';
import { apiUrl } from '../env';

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

  isSingle: string = 'true';

  selectedFile: File | null = null;

  isNotAllowedUsernameDetected =
    localStorage.getItem('username') === 'pocbfi1' ||
    localStorage.getItem('username') === 'pocbfi2';

  ocrData: any[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  getRecentOcrData() {
    this.http.get<any>(`${apiUrl}/g-ocr-bank/get-ocr-data}`).subscribe({
      next: (value) => {
        this.ocrData = value.data.map((item: any) => {
          return {
            ...item,
            file_name: JSON.parse(item.file_name),
          };
        });
      },
    });
  }

  ngAfterViewInit() {
    HSFileUpload.autoInit();
    this.tampilkanPesanError();
    this.getRecentOcrData();

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
      /*
        ! Jenis-jenis tipe bank statement

        1 = BCA Corporate
        2 = BCA Personal
        3 = BRI
        4 = OCBC
        5 = BNI
        6 = Permata
        7 = Danamon
        8 = CIMB
        9 = Mandiri
       */

      // Untuk bank BCA CORP ataupun BCA PERSONAL

      if (
        this.selectedBankStatement == '1' ||
        this.selectedBankStatement == '2'
      ) {
        proceedOcrBca(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone.ocrData,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '3') {
        proceedOcrBri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '4') {
        proceedOcrOcbc(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '5') {
        proceedOcrBni(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '6') {
        proceedOcrPermata(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '7') {
        proceedOcrDanamon(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '8') {
        proceedOcrCimb(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '9') {
        proceedOcrMandiri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files,
          this.element.dropzone,
          this.ocrData
        );
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Ambil file pertama
    }
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

  uploadFileSingle(selectedBankStatement: string) {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Please select a file first!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });
      return;
    }

    const allowedExtensions = ['application/pdf'];

    if (!allowedExtensions.includes(this.selectedFile.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Invalid file detected! Only PDF files are allowed.',
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });
      return;
    }

    if (selectedBankStatement == '') {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Determine the type of bank statement!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });
    } else {
      Swal.fire({
        title: 'Processing',
        text: 'Processing is underway. Please wait ... ',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (
        this.selectedBankStatement == '1' ||
        this.selectedBankStatement == '2'
      ) {
        proceedOcrBca(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '3') {
        proceedOcrBri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '4') {
        proceedOcrOcbc(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '5') {
        proceedOcrBni(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '6') {
        proceedOcrPermata(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '7') {
        proceedOcrDanamon(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '8') {
        proceedOcrCimb(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }

      if (this.selectedBankStatement == '9') {
        proceedOcrMandiri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile],
          this.element.dropzone,
          this.ocrData
        );
      }
    }
  }

  uploadFileMultiple(selectedBankStatement: string) {
    if (selectedBankStatement == '') {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Determine the type of bank statement!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });

      return;
    }

    if (
      !this.element.dropzone.files ||
      this.element.dropzone.files.length === 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Please add at least one file before processing!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });
      return;
    }

    // Validasi tipe file
    const allowedExtensions = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/zip',
    ];

    const invalidFiles: File[] = [];
    this.element.dropzone.files.forEach((element: File) => {
      if (!allowedExtensions.includes(element.type)) {
        invalidFiles.push(element);
      }
    });

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: `Invalid file detected! Only images (JPEG, PNG) and ZIP files are allowed.`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.element.dropzone.removeAllFiles();
        }
      });
      return;
    }

    Swal.fire({
      title: 'Processing',
      text: 'Processing is underway. Please wait ... ',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.element.dropzone.processQueue();
  }

  formatWaktu(date: string) {
    // Buat objek Date dari string input
    const dateObj = new Date(date);

    // Daftar nama bulan dalam Bahasa Inggris
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Ambil tanggal, bulan, tahun, jam, menit, dan detik dari objek Date
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = dateObj.getSeconds();

    // Format ulang sesuai kebutuhan
    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  }

  showError(errorMsg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: errorMsg,
    });
  }
}
