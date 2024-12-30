import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { apiUrl, apiUrlPy } from '../../env';

export default function proceedOcrDanamon(
  isZipPasswordProtected: any,
  zipPassword: any,
  selectedBankStatement: any,
  http: HttpClient,
  router: Router,
  files: any,
  dropzone: any,
  ocrData: any
) {
  const formData = new FormData();
  const fileName: string[] = [];
  let fileType = '';

  if (files[0].name.includes('.pdf')) {
    fileType = 'pdf';
  } else if (files[0].name.includes('.zip')) {
    fileType = 'zip';
  } else {
    fileType = 'image';
  }

  files.forEach((file: any, index: number) => {
    formData.append('files', file, file.name); // 'files' is the key for multiple files
    fileName.push(file.name);
  });

  if (isZipPasswordProtected) {
    formData.append('zip-password', zipPassword!);
  }

  formData.append('bank-statement-type', selectedBankStatement);

  // http.get<any>('assets/response-danamon.json').subscribe({
  //   next: (value) => {
  //     Swal.close();

  //     router
  //       .navigate(['/dashboard/ocr-danamon-result'], {
  //         state: value.data,
  //       })
  //       .then();
  //   },
  //   error: (err) => {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Upload Failed',
  //       text: err.error.data == undefined ? 'Unknown Error!' : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
  //     });
  //   },
  // });

  const headers = new HttpHeaders().set(
    'X-Username',
    localStorage.getItem('username')!
  );

  http
    .post<any>(`${apiUrlPy}/proceed-danamon`, formData, { headers })
    .subscribe({
      next: value => {
        Swal.close();

        if (
          localStorage.getItem('username') !== 'pocbfi1' ||
          localStorage.getItem('username') !== 'pocbfi2'
        ) {
          http
            .post<any>(`${apiUrl}/g-ocr-bank/save-ocr-data`, {
              result: JSON.stringify(value.data),
              uploaded_by: localStorage.getItem('username'),
              total_page: value.data.banyak_halaman,
              bank_type: 'Danamon',
              link: 'ocr-danamon-result',
              file_type: fileType,
              file_name: JSON.stringify(fileName),
            })
            .subscribe({
              next: value => {},
            });
        }

        router
          .navigate(['/dashboard/ocr-danamon-result'], {
            state: value.data,
          })
          .then();
        var audio = new Audio('assets/bell.wav');
        audio.play();
      },
      error: err => {
        http
          .post<any>(`${apiUrl}/g-ocr-bank/save-ocr-data`, {
            result: null,
            uploaded_by: localStorage.getItem('username'),
            total_page: null,
            bank_type: 'Danamon',
            link: null,
            file_type: fileType,
            file_name: JSON.stringify(fileName),
            error_message:
              err.error.data == undefined
                ? 'Please re-upload your photo with better quality because the system cannot read it or make sure the bank statement type is the same.'
                : err.error.data,
          })
          .subscribe({
            next: value => {},
          });

        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text:
            err.error.data == undefined
              ? 'Please re-upload your photo with better quality because the system cannot read it or make sure the bank statement type is the same.'
              : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
        }).then(result => {
          if (result.isConfirmed) {
            // Clear all files from Dropzone
            dropzone.removeAllFiles();
            http
              .get<any>(
                `${apiUrl}/g-ocr-bank/get-ocr-data/${localStorage.getItem(
                  'username'
                )}`
              )
              .subscribe({
                next: value => {
                  ocrData = value.data.map((item: any) => {
                    return {
                      ...item,
                      file_name: JSON.parse(item.file_name),
                    };
                  });
                },
              });
          }
        });
        var audio = new Audio('assets/bell.wav');
        audio.play();
      },
    });
}
