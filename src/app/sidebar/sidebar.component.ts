import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  activeIndex: number = 1

  changeActiveIndex (index: number) {
    this.activeIndex = index
  }
}
