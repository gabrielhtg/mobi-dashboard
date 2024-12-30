import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxTiptapModule } from 'ngx-tiptap';
import { apiUrl } from '../env';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-useful-links',
  standalone: true,
  imports: [FormsModule, NgxTiptapModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-useful-links.component.html',
})
export class AddUsefulLinksComponent implements OnInit {
  private id: any;
  data: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    if (this.id) {
      this.loadData();
    }
  }

  submit(addUsefullLink: NgForm) {
    const data = addUsefullLink.value;

    if (this.id) {
      this.http
        .patch<any>(`${apiUrl}/usefull-link/${this.id}`, data)
        .subscribe({
          next: value => {
            this.router.navigate(['/dashboard/usefull-links']);
          },
        });
    } else {
      this.http.post<any>(`${apiUrl}/usefull-link`, data).subscribe({
        next: value => {
          this.router.navigate(['/dashboard/usefull-links']);
        },
      });
    }
  }

  loadData() {
    this.http.get<any>(`${apiUrl}/usefull-link/${this.id}`).subscribe({
      next: value => {
        this.data = value.data;
      },
    });
  }
}
