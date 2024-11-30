import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { apiUrl } from '../env';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private http: HttpClient, private router: Router) {}

  login(formLogin: NgForm) {
    this.http.get<any>('https://api.ipify.org?format=json').subscribe({
      next: (ipData) => {
        const loginData = {
          ...formLogin.value,
          ip_address: ipData.ip,
        };

        this.http.post<any>(`${apiUrl}/auth/login`, loginData).subscribe({
          next: (value) => {
            sessionStorage.setItem('name', value.data.nama);
            sessionStorage.setItem(
              'profile_picture',
              value.data.profile_picture
            );
            sessionStorage.setItem('email', value.data.email);
            sessionStorage.setItem('username', value.data.username);
            this.router.navigate(['dashboard']);
          },
          error: (err) => {
            console.log(err);

            Swal.fire({
              icon: 'error',
              title: 'Unauthorized',
              text: 'Pastikan username dan password kamu sudah tepat!',
            });
          },
        });
      },
    });
  }
}
