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
    const loginData = {
      ...formLogin.value,
      token: localStorage.getItem('login_token'),
    };

    this.http.post<any>(`${apiUrl}/auth/login`, loginData).subscribe({
      next: (value) => {
        sessionStorage.setItem('name', value.data.user.nama);
        sessionStorage.setItem(
          'profile_picture',
          value.data.user.profile_picture
        );
        sessionStorage.setItem('email', value.data.user.email);
        sessionStorage.setItem('username', value.data.user.username);
        localStorage.setItem('login_token', value.data.login_token);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.log(err);

        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: `${err.error.msg}`,
        });
      },
    });
  }
}
