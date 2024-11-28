import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { apiUrl } from './env';
import { HttpClient } from '@angular/common/http';

export function refreshPage(currentUrl: string, router: Router) {
  router.navigate(['/dashboard'], { skipLocationChange: true }).then(() => {
    router.navigate([currentUrl]).then();
  });
}

export function showCopyNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: text,
    showConfirmButton: false,
    timer: 800,
  });
}

export function showSuccessNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: text,
    showConfirmButton: false,
    timer: 1000,
  });
}

export function showErrorNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'error',
    title: text,
    showConfirmButton: false,
    timer: 1000,
  });
}

export function showDeleteConfirmationDialog(
  text: string,
  http: HttpClient,
  router: Router,
  APIurl: string,
  refreshUrl: string
) {
  Swal.fire({
    title: text,
    showDenyButton: true,
    confirmButtonText: 'Yes',
    denyButtonText: `No`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.fire(`Berhasil menghapus data!`, '', 'success');
      http.delete<any>(APIurl).subscribe({
        next: (value) => {
          refreshPage(refreshUrl, router);
        },
      });
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info');
    }
  });
}

export default function isProfilePictExist() {
  return !!sessionStorage.getItem('profile_picture');
}

export function getUsername(): string | null {
  return sessionStorage.getItem('username');
}

export function getName(): string | null {
  return sessionStorage.getItem('name');
}

export function getEmail(): string | null {
  return sessionStorage.getItem('email');
}

export function isAuthorizedByIp(http: HttpClient, router: Router) {
  http
    .get<any>(`${apiUrl}/auth/checkIp/${sessionStorage.getItem('username')}`)
    .subscribe({
      next: (value) => {
        return true;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          text: 'Other activity detected with your credentials. Come back in!',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            router.navigate(['/']); // Arahkan ke halaman login
          }
        });
        sessionStorage.clear();
        return false;
      },
    });
}
