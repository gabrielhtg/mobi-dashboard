import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.css',
})
export class CreateAccountComponent {
  hideSuccessAlert: boolean = true;
  alertMessage: string = '';

  constructor(private http: HttpClient) {}

  submit(createAccountForm: NgForm) {
    this.http.post<any>(`${apiUrl}/users`, createAccountForm.value).subscribe({
      next: value => {
        this.alertMessage = value.msg;
        this.hideSuccessAlert = false;
      },
      error: error => {
        this.alertMessage = error;
        this.hideSuccessAlert = false;
      },
    });
  }
}
