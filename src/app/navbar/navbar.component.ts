import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import isProfilePictExist, { getUserInitials } from '../allservice';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  loginData: any = {};
  hideProfilePicturePlaceholder = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loginData.username = sessionStorage.getItem('username');
    this.loginData.name = sessionStorage.getItem('name');
    this.loginData.profile_picture = sessionStorage.getItem('profile_picture');
    this.loginData.email = sessionStorage.getItem('email');
    this.loginData.initial = getUserInitials(this.loginData.name);

    if (isProfilePictExist()) {
      this.hideProfilePicturePlaceholder = true;
    }
  }

  logout() {
    this.http
      .post<any>(`${apiUrl}/auth/logout`, {
        username: this.loginData.username,
      })
      .subscribe({
        next: (value) => {
          this.router.navigate(['/']);
          localStorage.clear();
          sessionStorage.clear();
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
