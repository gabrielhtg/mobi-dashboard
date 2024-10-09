import { Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';
import { formatWaktu } from './table-log-activity.service';

@Component({
  selector: 'app-table-log-activity',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './table-log-activity.component.html',
})
export class TableLogActivityComponent {
  @Input() data: any;
  protected readonly formatWaktu = formatWaktu;
}
