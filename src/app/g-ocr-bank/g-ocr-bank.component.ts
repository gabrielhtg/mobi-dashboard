import { Component, HostListener, ViewChild } from '@angular/core';
import { AngularCropperjsModule, CropperComponent } from 'angular-cropperjs';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../env';
import { NgForOf, NgIf } from '@angular/common';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-g-ocr-bank',
  standalone: true,
  imports: [AngularCropperjsModule, FormsModule, NgForOf, NgIf],
  templateUrl: './g-ocr-bank.component.html',
})
export class GOcrBankComponent {
  file: any;
  hideTakeAll = false;
  dataTransaksi: any = [];
  dataBankStatement: any = [null, null, null, null, null, null, null];

  selectedData = 0;
  selectedDataTable1 = -1;
  selectedDataTable2 = -1;

  halamanTransaksi: any;

  imageUrl: string | null = 'assets/placeholder.jpg';
  rawData: string = 'No Selected Text';

  cropperConfig: Cropper.Options = {
    rotatable: true,
    autoCrop: false,
  };

  @ViewChild('angularCropper') public angularCropper!: CropperComponent;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'p') {
      // alert('fine')
      window.location.reload();
    }

    if (event.key === 'Enter' && event.shiftKey) {
      this.dataTransaksi[this.selectedDataTable1][this.selectedDataTable2] = {
        value: '-',
        canvasData: null,
        cropData: null,
      };
      this.selectedDataTable2++;

      if (this.selectedDataTable2 > 4) {
        this.selectedDataTable2 = 0;
        this.selectedDataTable1++;
        this.addRow();
      }
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.doOcr(true);
    } else if (event.key === 'Enter') {
      this.doOcr(false);
    }
  }

  constructor(private http: HttpClient) {}

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

  doOcr(page: boolean) {
    this.angularCropper.cropper.getCroppedCanvas().toBlob((blob) => {
      const fd = new FormData();
      fd.append('file', blob!);
      this.http.post<any>(apiUrl + '/g-ocr-bank', fd).subscribe({
        next: (value) => {
          if (page) {
            this.halamanTransaksi = value.data;
          } else {
            if (this.selectedData !== -1) {
              this.dataBankStatement[this.selectedData] = {
                value: value.data,
                canvasData: this.angularCropper.cropper.getCanvasData(),
                cropData: this.angularCropper.cropper.getCropBoxData(),
              };
              this.selectedData++;

              if (this.selectedData > 6) {
                this.selectedData = -1;
                this.addRow();
                this.selectedDataTable1 = 0;
                this.selectedDataTable2 = 0;
              }
            } else {
              this.dataTransaksi[this.selectedDataTable1][
                this.selectedDataTable2
              ] = {
                value: value.data,
                canvasData: this.angularCropper.cropper.getCanvasData(),
                cropData: this.angularCropper.cropper.getCropBoxData(),
              };
              this.selectedDataTable2++;

              if (this.selectedDataTable2 > 4) {
                this.selectedDataTable2 = 0;
                this.selectedDataTable1++;
                this.addRow();
              }
            }
          }
          this.rawData = value.rawData;
        },
        error: (error) => {
          console.log(error);
        },
      });
    });
  }

  // doOcrAll () {
  //   this.hideTakeAll = true
  //   this.angularCropper.cropper.getCroppedCanvas().toBlob((blob) => {
  //     const fd = new FormData();
  //     fd.append('file', blob!);
  //     this.http.post<any>(apiUrl + '/g-ocr-bank/all', fd).subscribe({
  //       next: value => {
  //         this.dataBankStatement = value.data
  //
  //         this.hideTakeAll = false
  //       },
  //       error: error => {
  //         console.log(error)
  //         this.hideTakeAll = false
  //       }
  //     })
  //   })
  // }

  setSelectedData(index: number): void {
    this.selectedData = index;
    this.angularCropper.cropper.setCropBoxData(
      this.dataBankStatement[index].cropData
    );
    this.angularCropper.cropper.setCanvasData(
      this.dataBankStatement[index].canvasData
    );
  }

  rotateLeft() {
    this.angularCropper.cropper.rotate(-1);
  }

  rotateRight() {
    this.angularCropper.cropper.rotate(1);
  }

  addRow() {
    this.dataTransaksi.push([
      null,
      null,
      null,
      null,
      null,
      this.halamanTransaksi,
    ]);

    console.log(this.dataTransaksi[0]);
  }

  setSelectedDataTable(index1: number, index2: number): void {
    this.selectedData = -1;
    this.selectedDataTable1 = index1;
    this.selectedDataTable2 = index2;
    this.angularCropper.cropper.setCropBoxData(
      this.dataTransaksi[index1][index2].cropData
    );
    this.angularCropper.cropper.setCanvasData(
      this.dataTransaksi[index1][index2].canvasData
    );
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
