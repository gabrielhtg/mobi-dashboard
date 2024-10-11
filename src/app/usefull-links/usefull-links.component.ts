import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TableLogActivityComponent } from '../tables/table-log-activity/table-log-activity.component';
import { NgForOf } from '@angular/common';
import { apiUrl } from '../env';
import { HttpClient } from '@angular/common/http';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { FormsModule, NgForm } from '@angular/forms';
import {
  refreshPage,
  showCopyNotification,
  showDeleteConfirmationDialog,
} from '../allservice';

@Component({
  selector: 'app-usefull-links',
  standalone: true,
  imports: [
    NavbarComponent,
    SidebarComponent,
    TableLogActivityComponent,
    NgForOf,
    RouterLink,
    CdkCopyToClipboard,
    FormsModule,
  ],
  templateUrl: './usefull-links.component.html',
})
export class UsefullLinksComponent implements OnInit {
  links: any = [];
  keywords: any = this.activatedRoute.snapshot.paramMap.get('keywords');

  @ViewChild(SidebarComponent) sidebarComponent: SidebarComponent | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
    console.log(this.keywords);
  }

  loadData() {
    if (this.keywords === null) {
      this.http.get<any>(`${apiUrl}/usefull-link`).subscribe({
        next: (value) => {
          this.links = value.data;
        },
      });
    } else {
      this.http
        .get<any>(`${apiUrl}/usefull-link/search/${this.keywords}`)
        .subscribe({
          next: (value) => {
            this.links = value.data;
          },
        });
    }
  }

  search(form: NgForm) {
    const formValue = form.value;

    this.router
      .navigate(['/dashboard'], { skipLocationChange: true })
      .then(() => {
        this.router
          .navigate([`/dashboard/usefull-links/${formValue.keyword}`])
          .then();
      });
  }

  remove(id: string, title: string) {
    showDeleteConfirmationDialog(
      `Apakah kamu yakin ingin menghapus data ${title}?`,
      this.http,
      this.router,
      `${apiUrl}/usefull-link/${id}`,
      '/dashboard/usefull-links'
    );
  }

  protected readonly showCopyNotification = showCopyNotification;
}
