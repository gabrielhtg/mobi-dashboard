import { Component } from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {NavbarComponent} from "../navbar/navbar.component";
import {TableLogActivityComponent} from "../tables/table-log-activity/table-log-activity.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    TableLogActivityComponent,
    RouterOutlet
  ],
  templateUrl: './main-dashboard.component.html'
})
export class MainDashboardComponent {

}
