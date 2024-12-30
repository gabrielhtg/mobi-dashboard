import { Component, OnInit } from '@angular/core';
import { TableLogActivityComponent } from '../tables/table-log-activity/table-log-activity.component';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';
import { data } from 'autoprefixer';

@Component({
  selector: 'app-log-activity',
  standalone: true,
  imports: [TableLogActivityComponent],
  templateUrl: './log-activity.component.html',
})
export class LogActivityComponent implements OnInit {
  logActivityData: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData(0, 12);
  }

  loadData(skip: number, take: number) {
    const data = {
      skip: skip,
      take: take,
    };

    this.http.post<any>(`${apiUrl}/log-activity/get-all`, data).subscribe({
      next: (value: any) => {
        this.logActivityData = value.data;
      },
    });
  }
}
