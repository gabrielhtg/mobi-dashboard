import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { apiUrlPy } from '../../env';
import Swal from 'sweetalert2';

export default function proceedOcrBri(
  isZipPasswordProtected: any,
  zipPassword: any,
  selectedBankStatement: any,
  http: HttpClient,
  router: Router,
  files: any,
  dropzone: any
) {
  const formData = new FormData();

  files.forEach((file: any, index: number) => {
    formData.append('files', file, file.name); // 'files' is the key for multiple files
  });

  if (isZipPasswordProtected) {
    formData.append('zip-password', zipPassword!);
  }

  formData.append('bank-statement-type', selectedBankStatement);

  // http.get<any>('assets/response-bri.json').subscribe({
  //   next: (value) => {
  //     Swal.close();

  //     router
  //       .navigate(['/dashboard/ocr-bri-result'], {
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

  http.post<any>(`${apiUrlPy}/proceed-bri`, formData, { headers }).subscribe({
    next: (value) => {
      Swal.close();

      router
        .navigate(['/dashboard/ocr-bri-result'], {
          state: value.data,
        })
        .then();
      var audio = new Audio('assets/bell.wav');
      audio.play();
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text:
          err.error.data == undefined
            ? 'Please re-upload your photo with better quality because the system cannot read it or make sure the bank statement type is the same.'
            : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear all files from Dropzone
          dropzone.removeAllFiles();
        }
      });
      var audio = new Audio('assets/bell.wav');
      audio.play();
    },
  });
}
