import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { apiUrl } from './env';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';

export function refreshPage(currentUrl: string, router: Router) {
  router.navigate(['/dashboard'], { skipLocationChange: true }).then(() => {
    router.navigate([currentUrl]).then();
  });
}

export function showCopyNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: text,
    showConfirmButton: false,
    timer: 800,
  });
}

export function showSuccessNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: text,
    showConfirmButton: false,
    timer: 1000,
  });
}

export function showErrorNotification(text: string) {
  Swal.fire({
    position: 'center',
    icon: 'error',
    title: text,
    showConfirmButton: false,
    timer: 1000,
  });
}

export function showDeleteConfirmationDialog(
  text: string,
  http: HttpClient,
  router: Router,
  APIurl: string,
  refreshUrl: string
) {
  Swal.fire({
    title: text,
    showDenyButton: true,
    confirmButtonText: 'Yes',
    denyButtonText: `No`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.fire(`Berhasil menghapus data!`, '', 'success');
      http.delete<any>(APIurl).subscribe({
        next: (value) => {
          refreshPage(refreshUrl, router);
        },
      });
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info');
    }
  });
}

export default function isProfilePictExist() {
  return !!sessionStorage.getItem('profile_picture');
}

export function getUsername(): string | null {
  return sessionStorage.getItem('username');
}

export function getName(): string | null {
  return sessionStorage.getItem('name');
}

export function getEmail(): string | null {
  return sessionStorage.getItem('email');
}

export function isAuthorizedByIp(http: HttpClient, router: Router): boolean {
  let result = false;

  http.get<any>('https://api.ipify.org?format=json').subscribe({
    next: (ipData) => {
      http
        .post<any>(`${apiUrl}/auth/checkIp`, {
          username: sessionStorage.getItem('username'),
          ip_address: ipData.ip,
        })
        .subscribe({
          next: (value) => {
            result = true;
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
              text: 'Other activity detected with your credentials. Come back in!',
              confirmButtonText: 'OK',
            }).then((res) => {
              if (res.isConfirmed) {
                router.navigate(['/']); // Arahkan ke halaman login
              }
            });
            sessionStorage.clear();
            result = false;
          },
        });
    },
  });
  return result;
}

export function convertToFloat(stringNum: string | null) {
  if (stringNum !== null) {
    return (
      parseFloat(
        stringNum!
          .replaceAll(',', '')
          .replaceAll('Rp ', '')
          .replaceAll('.', '')
          .replaceAll('DB', '')
      ) / 100
    );
  }

  return 0;
}

export function getUserInitials(name: string) {
  if (!name) {
    return 'FT';
  }
  const words = name.trim().split(/\s+/);

  return words.map((word) => word[0].toUpperCase()).join('');
}

function getFilteredTransaction(
  transactionData: any[],
  key: string,
  startDate: string,
  endDate: string
) {
  const tempTransactionData: any[] = [];
  let startDateDetected = false;
  let endDateDetected = false;

  transactionData.forEach((e) => {
    if (e[key] === startDate.trim()) {
      startDateDetected = true;
    }

    if (e[key] === endDate.trim()) {
      endDateDetected = true;
    }

    if (startDateDetected && !endDateDetected) {
      tempTransactionData.push(e);
    }

    if (startDateDetected && endDateDetected && e[key] === endDate.trim()) {
      tempTransactionData.push(e);
    }
  });

  return tempTransactionData;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  exportToExcel(
    data: any[],
    fileName: string,
    columnOrder: string[],
    startDate: string,
    endDate: string,
    customHeaders?: string[]
  ): void {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Transaction Data');
    let mappedData: any[];

    // Add custom headers if provided
    if (customHeaders) {
      const headerRow = worksheet.addRow(customHeaders);
      // Style the custom headers to make them bold
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: '000000' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '75a1d0' }, // Ocean Blue background
        };
      });
    }

    if (startDate !== '') {
      const filteredData = getFilteredTransaction(
        data,
        'tanggal',
        startDate,
        endDate
      );

      mappedData = filteredData.map((item) => {
        const row: any = [];
        columnOrder.forEach((key) => {
          row.push(item[key]);
        });
        return row;
      });
    } else {
      mappedData = data.map((item) => {
        const row: any = [];
        columnOrder.forEach((key) => {
          row.push(item[key]);
        });
        return row;
      });
    }

    // Add data rows
    worksheet.addRows(mappedData);

    // Adjust column widths
    const allData = [customHeaders || columnOrder, ...mappedData];
    columnOrder.forEach((_, index) => {
      const maxLength = allData.reduce((max, row) => {
        const cellValue = row[index]?.toString() || '';
        return Math.max(max, cellValue.length);
      }, 0);
      worksheet.getColumn(index + 1).width = maxLength + 2; // Add padding
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `${fileName}.xlsx`);
    });
  }
}
