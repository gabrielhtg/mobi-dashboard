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
    if (e.debit_credit == 'D') {
      debitData.data.push(convertToFloat(e.balance));
    } else {
      debitData.data.push(0);
    }

    if (e.debit_credit == 'K') {
      creditData.data.push(convertToFloat(e.balance));
    } else {
      creditData.data.push(0);
    }
  });

  return [creditData, debitData];
}

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: any) => {
    if (e.posting_date !== null) {
      arrTemp.push(e.posting_date.trim().split(' ')[0]);
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
    if (e.posting_date !== null) {
      currentLabel = e.posting_date.trim().split(' ')[0];
    }

    if (before == null) {
      if (currentLabel == null) {
        return;
      }

      freqTotal += 1;

      before = currentLabel;

      if (e.debit_credit == 'D') {
        freqDebet += 1;
      }
      if (e.debit_credit == 'K') {
        freqKredit += 1;
      }
    } else {
      if (currentLabel == before) {
        freqTotal += 1;

        if (e.debit_credit == 'D') {
          freqDebet += 1;
        }
        if (e.debit_credit == 'K') {
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

        if (e.debit_credit == 'D') {
          freqDebet += 1;
        }
        if (e.debit_credit == 'K') {
          freqKredit += 1;
        }
      }
    }
  });

  labelArr.push(before);
  freqTotalArr.push(freqTotal);
  freqDebetArr.push(freqDebet);
  freqKreditArr.push(freqKredit);

  console.log({
    labels: labelArr,
    datasets: [
      { data: freqTotalArr, label: 'Frequency', borderColor: '#55aa00' },
      { data: freqKreditArr, label: 'Kredit', borderColor: '#98cdf2' },
      { data: freqDebetArr, label: 'Debit', borderColor: '#fbafbe' },
    ],
  });

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
    currentSaldo = convertToFloat(e.balance);

    if (e.posting_date !== null) {
      if (e.posting_date.trim().split(' ')[0] == labelArr[labelPointer]) {
        saldoArr.push(currentSaldo);

        if (labelPointer < labelArr.length) {
          labelPointer += 1;
        } else {
          return true;
        }
      }
    } else {
      saldoArr.push(currentSaldo);
      labelPointer += 1;
    }
  });

  return {
    labels: labelArr,
    datasets: [{ data: saldoArr, label: 'Saldo', borderColor: '#ffaa00' }],
  };
}
