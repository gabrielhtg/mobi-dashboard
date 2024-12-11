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
import { isAuthorizedByIp } from '../allservice';

@Component({
  selector: 'app-ocr-bank-py',
  standalone: true,
  imports: [AngularCropperjsModule, FormsModule, NgForOf],
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
          files
        );
      }

      if (this.selectedBankStatement == '3') {
        proceedOcrBri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '4') {
        proceedOcrOcbc(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '5') {
        proceedOcrBni(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '6') {
        proceedOcrPermata(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '7') {
        proceedOcrDanamon(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '8') {
        proceedOcrCimb(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
        );
      }

      if (this.selectedBankStatement == '9') {
        proceedOcrMandiri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          files
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
      alert('Please select a file first!');
      return;
    }

    if (selectedBankStatement == '') {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Determine the type of bank statement!',
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
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '3') {
        proceedOcrBri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '4') {
        proceedOcrOcbc(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '5') {
        proceedOcrBni(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '6') {
        proceedOcrPermata(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '7') {
        proceedOcrDanamon(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '8') {
        proceedOcrCimb(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
        );
      }

      if (this.selectedBankStatement == '9') {
        proceedOcrMandiri(
          this.isZipPasswordProtected,
          this.zipPassword,
          this.selectedBankStatement,
          this.http,
          this.router,
          [this.selectedFile]
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
    const invalidFiles = this.element.dropzone.files.filter(
      (file: any) => !allowedExtensions.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: `Invalid file detected! Only images (JPEG, PNG) and ZIP files are allowed.`,
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

  // uploadFileMultiple(selectedBankStatement: string) {
  //   if (selectedBankStatement == '') {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Upload Failed',
  //       text: 'Determine the type of bank statement!',
  //     });

  //     return;
  //   }

  //   if (
  //     !this.element.dropzone.files ||
  //     this.element.dropzone.files.length === 0
  //   ) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Upload Failed',
  //       text: 'Please add at least one file before processing!',
  //     });
  //     return;
  //   }

  //   Swal.fire({
  //     title: 'Processing',
  //     text: 'Processing is underway. Please wait ... ',
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     allowEnterKey: false,
  //     didOpen: () => {
  //       Swal.showLoading();
  //     },
  //   });
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Upload Failed',
  //     text: 'Invalid file type detected. Only images (JPEG, PNG) and ZIP files are allowed.',
  //   });
  //   this.element.dropzone.processQueue();
  // }
}
