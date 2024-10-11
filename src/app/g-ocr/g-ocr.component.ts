import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';
import { NgOptimizedImage } from '@angular/common';
import { AngularCropperjsModule, CropperComponent } from 'angular-cropperjs';
import { TableLogActivityComponent } from '../tables/table-log-activity/table-log-activity.component';
import { Router } from '@angular/router';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-g-ocr',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    AngularCropperjsModule,
    TableLogActivityComponent,
  ],
  templateUrl: './g-ocr.component.html',
})
export class GOcrComponent implements OnInit {
  file: any;
  hideTakeAll = false;
  dataKTP: any = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  cropData: any = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  canvasData: any = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  selectedData = -1;
  imageUrl: string | null = 'assets/placeholder.jpg';
  rawData: string = 'No Selected Test';

  cropperConfig: Cropper.Options = {
    rotatable: true,
    autoCrop: false,
  };

  @ViewChild('angularCropper') public angularCropper!: CropperComponent;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      this.dataKTP[this.selectedData] = '-';
      this.selectedData++;
    } else if (event.key === 'Enter') {
      this.doOcr();
    }
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onChange(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.file = file;
    }

    this.convertFileToImageUrl(this.file);

    this.angularCropper.cropper.replace(this.imageUrl!);
  }

  convertFileToImageUrl(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  doOcr() {
    this.angularCropper.cropper
      .getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })
      .toBlob((blob) => {
        const fd = new FormData();
        fd.append('file', blob!);
        this.http.post<any>(apiUrl + '/g-ocr', fd).subscribe({
          next: (value) => {
            this.dataKTP[this.selectedData] = value.data;
            this.cropData[this.selectedData] =
              this.angularCropper.cropper.getCropBoxData();
            this.canvasData[this.selectedData] =
              this.angularCropper.cropper.getCanvasData();
            this.selectedData++;
            this.rawData = value.rawData;
          },
          error: (error) => {
            console.log(error);
          },
        });
      });
  }

  doOcrAll() {
    this.hideTakeAll = true;
    this.angularCropper.cropper
      .getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })
      .toBlob((blob) => {
        const fd = new FormData();
        fd.append('file', blob!);
        this.http.post<any>(apiUrl + '/g-ocr/all', fd).subscribe({
          next: (value) => {
            this.dataKTP = value.data;

            this.hideTakeAll = false;
          },
          error: (error) => {
            console.log(error);
            this.hideTakeAll = false;
          },
        });
      });
  }

  setSelectedData(index: number): void {
    this.selectedData = index;
    this.angularCropper.cropper.setCropBoxData(
      this.cropData[this.selectedData]
    );
    this.angularCropper.cropper.setCanvasData(
      this.canvasData[this.selectedData]
    );
  }

  rotateLeft() {
    this.angularCropper.cropper.rotate(-1);
  }

  rotateRight() {
    this.angularCropper.cropper.rotate(1);
  }

  exportPDF() {
    this.angularCropper.cropper.getCroppedCanvas().toBlob((blob) => {
      const fd = new FormData();
      fd.append('file', blob!);
      this.http.post<any>(apiUrl + '/g-ocr/export', fd).subscribe({
        next: (value) => {
          FileSaver.saveAs(value.data, 'ocr-result.pdf');
        },
        error: (error) => {
          console.log(error);
          this.hideTakeAll = false;
        },
      });
    });
  }
}
