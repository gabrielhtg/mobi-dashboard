import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { apiUrlPy } from '../../env';

export default function proceedOcrMandiri(
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

  // http.get<any>('assets/response-mandiri.json').subscribe({
  //   next: (value) => {
  //     Swal.close();

  //     router
  //       .navigate(['/dashboard/ocr-mandiri-result'], {
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

  http.post<any>(`${apiUrlPy}/proceed-mandiri`, formData).subscribe({
    next: (value) => {
      Swal.close();

      router
        .navigate(['/dashboard/ocr-mandiri-result'], {
          state: value.data,
        })
        .then();
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text:
          err.error.data == undefined
            ? 'Please re-upload your photo with better quality because the system cannot read it.'
            : err.error.data, // Bisa disesuaikan dengan pesan yang lebih jelas
      });
    },
  });
}
