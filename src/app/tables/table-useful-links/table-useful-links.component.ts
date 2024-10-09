import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-table-useful-links',
  standalone: true,
    imports: [
        NgForOf
    ],
  templateUrl: './table-useful-links.component.html',
  styleUrl: './table-useful-links.component.css'
})
export class TableUsefulLinksComponent {

}
