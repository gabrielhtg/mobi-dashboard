import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TableLogActivityComponent } from '../tables/table-log-activity/table-log-activity.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgForOf } from '@angular/common';
import { apiUrl } from '../env';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {
  refreshPage,
  showCopyNotification,
  showDeleteConfirmationDialog,
} from '../allservice';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-code-snippets',
  standalone: true,
  imports: [
    NavbarComponent,
    SidebarComponent,
    TableLogActivityComponent,
    RouterLink,
    NgForOf,
    CdkCopyToClipboard,
    FormsModule,
  ],
  templateUrl: './code-snippets.component.html',
})
export class CodeSnippetsComponent implements OnInit {
  codes: any;
  param = this.activatedRoute.snapshot.paramMap.get('keywords');

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (this.param !== null) {
      this.http
        .get<any>(`${apiUrl}/code-snippets/search/${this.param}`)
        .subscribe({
          next: value => {
            this.codes = value.data;
          },
        });
    } else {
      this.http.get<any>(`${apiUrl}/code-snippets`).subscribe({
        next: value => {
          this.codes = value.data;
        },
      });
    }
  }

  remove(id: string, title: string) {
    showDeleteConfirmationDialog(
      `Apakah kamu yakin untuk menghapus code snippet ${title}?`,
      this.http,
      this.router,
      `${apiUrl}/code-snippets/${id}`,
      '/dashboard/code-snippets'
    );
  }

  search(form: NgForm) {
    const formValue = form.value;

    this.router
      .navigate(['/dashboard'], { skipLocationChange: true })
      .then(() => {
        this.router
          .navigate([`/dashboard/code-snippets/${formValue.keyword}`])
          .then();
      });
  }
}
