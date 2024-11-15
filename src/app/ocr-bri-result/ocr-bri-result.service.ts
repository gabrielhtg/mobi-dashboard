export function convertToFloat(stringNum: string | null) {
  if (stringNum !== null) {
    return (
      parseFloat(
        stringNum!.replaceAll(',', '').replaceAll('Rp ', '').replaceAll('.', '')
      ) / 100
    );
  }

  return 0;
}

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
    debitData.data.push(convertToFloat(e.debit));
    creditData.data.push(convertToFloat(e.kredit));
  });

  return [creditData, debitData];
}

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: any) => {
    if (e.tanggal_transaksi !== null) {
      arrTemp.push(e.tanggal_transaksi.trim().split(' ')[0]);
    }
  });

  return arrTemp;
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
    if (e.tanggal_transaksi == null) {
      return;
    }

    currentLabel = e.tanggal_transaksi.trim().split(' ')[0];

    if (before == null) {
      freqTotal += 1;

      before = currentLabel;

      if (convertToFloat(e.debit) != 0) {
        freqDebet += 1;
      }

      if (convertToFloat(e.kredit) != 0) {
        freqKredit += 1;
      }
    } else {
      if (currentLabel == before) {
        freqTotal += 1;

        if (convertToFloat(e.debit) != 0) {
          freqDebet += 1;
        }

        if (convertToFloat(e.kredit) != 0) {
          freqKredit += 1;
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

        if (convertToFloat(e.debit) != 0) {
          freqDebet += 1;
        }

        if (convertToFloat(e.kredit) != 0) {
          freqKredit += 1;
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

export function getSaldoMovement(transactionData: any, labelArr: any) {
  let currentSaldo: number | null = null;
  let labelPointer = 0;
  const saldoArr: any = [];

  transactionData.forEach((e: any): any => {
    currentSaldo = convertToFloat(e.saldo);

    if (e.tanggal_transaksi != null) {
      if (e.tanggal_transaksi.trim().split(' ')[0] == labelArr[labelPointer]) {
        saldoArr.push(currentSaldo);

        if (labelPointer < labelArr.length) {
          labelPointer += 1;
        } else {
          return true;
        }
      }
    }
  });

  return {
    labels: labelArr,
    datasets: [{ data: saldoArr, label: 'Saldo', borderColor: '#ffaa00' }],
  };
}
