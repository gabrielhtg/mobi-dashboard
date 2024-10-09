import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import isProfilePictExist from "../allservice";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  loginData: any = {}
  hideProfilePicturePlaceholder = false

  constructor(
  ) {
  }

  ngOnInit() {
    this.loginData.username = sessionStorage.getItem('username')
    this.loginData.name = sessionStorage.getItem('name')
    this.loginData.profile_picture = sessionStorage.getItem('profile_picture')
    this.loginData.email = sessionStorage.getItem('email')

    if (isProfilePictExist()) {
      this.hideProfilePicturePlaceholder = true
    }
  }
}
