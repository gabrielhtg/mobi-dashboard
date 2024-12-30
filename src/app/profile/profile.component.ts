import { Component, OnInit } from '@angular/core';
import isProfilePictExist, {
  getEmail,
  getName,
  getUsername,
  showErrorNotification,
  showSuccessNotification,
} from '../allservice';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  hideProfilePicturePlaceholder = false;
  name = new FormControl();
  username = new FormControl();
  email = new FormControl();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (isProfilePictExist()) {
      this.hideProfilePicturePlaceholder = true;
    }

    this.name.setValue(getName());
    this.username.setValue(getUsername());
    this.email.setValue(getEmail());
  }

  editProfileSubmit() {
    const postData = {
      nama: this.name.value,
      email: this.email.value,
      username: this.username.value,
    };
    this.http
      .patch<any>(apiUrl + '/users/' + getUsername(), postData)
      .subscribe({
        next: value => {
          showSuccessNotification(value.msg);
          sessionStorage.setItem('username', value.data.username);
          sessionStorage.setItem('email', value.data.email);
          sessionStorage.setItem('name', value.data.nama);
        },
        error: error => {
          showErrorNotification(error.msg);
        },
      });
  }

  protected readonly getUsername = getUsername;
  protected readonly getName = getName;
  protected readonly getEmail = getEmail;
}
