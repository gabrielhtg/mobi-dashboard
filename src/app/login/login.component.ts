import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { apiUrl } from '../../assets/env';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private http: HttpClient, private router: Router) {}

  login(formLogin: NgForm) {
    console.log(formLogin.value);

    this.http.post<any>(`${apiUrl}/auth/login`, formLogin.value).subscribe({
      next: (value) => {
        sessionStorage.setItem('name', value.data.nama);
        sessionStorage.setItem('profile_picture', value.data.profile_picture);
        sessionStorage.setItem('email', value.data.email);
        sessionStorage.setItem('username', value.data.username);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
