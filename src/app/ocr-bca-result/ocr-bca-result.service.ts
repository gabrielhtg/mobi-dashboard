import { convertToFloat } from '../ocr-permata-result/ocr-permata-result.service';

export function getMonthlyChartDebitData(data: any) {
  const creditData: any = {
    data: [],
    label: 'Kredit',
  };

  const debitData: any = {
    data: [],
    label: 'Debit',
  };

  data.forEach((e: any) => {
    if (e.mutasi == null) {
      creditData.data.push(0);
      debitData.data.push(0);
      return;
    }

    if (e.mutasi.includes('DB')) {
      creditData.data.push(0);
      debitData.data.push(convertToFloat(e.mutasi));
    } else {
      debitData.data.push(0);
      creditData.data.push(convertToFloat(e.mutasi));
    }
  });

  return [creditData, debitData];
}

export function getDateFrequency(transactionData: any) {
  let before: string | null = null;
  const labelArr: any = [];
  const freqTotalArr: any = [];
  const freqKreditArr: any = [];
  const freqDebetArr: any = [];

  let freqTotal = 0;
  let freqDebet = 0;
  let freqKredit = 0;
  let currentLabel = '';

  transactionData.forEach((e: any) => {
    currentLabel = e.tanggal;

    if (before == null) {
      if (currentLabel == null) {
        return;
      }

      freqTotal += 1;

      before = currentLabel;

      if (e.mutasi != null) {
        if (e.mutasi.includes('DB')) {
          freqDebet += 1;
        } else {
          freqKredit += 1;
        }
      }
    } else {
      if (currentLabel == before) {
        freqTotal += 1;

        if (e.mutasi != null) {
          if (e.mutasi.includes('DB')) {
            freqDebet += 1;
          } else {
            freqKredit += 1;
          }
        }
      } else {
        // simpan data sebelumnya
        labelArr.push(before);
        freqTotalArr.push(freqTotal);
        freqDebetArr.push(freqDebet);
        freqKreditArr.push(freqKredit);

        before = currentLabel;
        freqTotal = 1;
        freqDebet = 0;
        freqKredit = 0;

        if (e.mutasi != null) {
          if (e.mutasi.includes('DB')) {
            freqDebet += 1;
          } else {
            freqKredit += 1;
          }
        }
      }
    }
  });

  labelArr.push(before);
  freqTotalArr.push(freqTotal);
  freqDebetArr.push(freqDebet);
  freqKreditArr.push(freqKredit);

  return {
    labels: labelArr,
    datasets: [
      { data: freqTotalArr, label: 'Frequency', borderColor: '#55aa00' },
      { data: freqKreditArr, label: 'Kredit', borderColor: '#98cdf2' },
      { data: freqDebetArr, label: 'Debit', borderColor: '#fbafbe' },
    ],
  };
}

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: any) => {
    arrTemp.push(e.tanggal);
  });

  return arrTemp;
}

/**
 *
 * @param data
 *
 * Method ini digunakan untuk membuat data untuk tabel saldo
 */

export function getSaldoMovement(transactionData: any, labelArr: any) {
  let currentSaldo: number | null = null;
  let labelPointer = 0;
  const saldoArr: any = [];

  transactionData.forEach((e: any): any => {
    currentSaldo = convertToFloat(e.saldo);

    if (e.tanggal == labelArr[labelPointer]) {
      saldoArr.push(currentSaldo);

      if (labelPointer < labelArr.length) {
        labelPointer += 1;
      } else {
        return true;
      }
    }
  });

  return {
    labels: labelArr,
    datasets: [{ data: saldoArr, label: 'Saldo', borderColor: '#ffaa00' }],
  };
}
