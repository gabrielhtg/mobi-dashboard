import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { apiUrlPy } from '../../env';

export default function proceedOcrOcbc(
  isZipPasswordProtected: any,
  zipPassword: any,
  selectedBankStatement: any,
  http: HttpClient,
  router: Router,
  files: any
) {
  const formData = new FormData();

  files.forEach((file: any, index: number) => {
    formData.append('files', file, file.name); // 'files' is the key for multiple files
  });

  if (isZipPasswordProtected) {
    formData.append('zip-password', zipPassword!);
  }

  formData.append('bank-statement-type', selectedBankStatement);

  // http.get<any>('assets/response-ocbc.json').subscribe({
  //   next: (value) => {
  //     Swal.close();

  //     router
  //       .navigate(['/dashboard/ocr-ocbc-result'], {
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

  http.post<any>(`${apiUrlPy}/proceed-ocbc`, formData).subscribe({
    next: (value) => {
      Swal.close();

      router
        .navigate(['/dashboard/ocr-ocbc-result'], {
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
      });
      var audio = new Audio('assets/bell.wav');
      audio.play();
    },
  });
}
