export function getMonthlyChartDebitData(data: any) {
  const creditData: any = {
    data: [],
    label: 'Kredit',
  };

  const debitData: any = {
    data: [],
    label: 'Debit',
  };

  data.forEach((e: String) => {
    debitData.data.push(parseFloat(e[3].replaceAll(',', '')));
    creditData.data.push(parseFloat(e[4].replaceAll(',', '')));
  });

  return [creditData, debitData];
}

export function getDateFrequency(data: any) {
  const labelTempArr = [];
  const freqTempArr = [];
  let freqTemp = 0;
  // let before = data[0][0].trim().split(' ')[0];
  let before = '';

  for (let i = 0; i < data.length; i++) {
    if (i == 0) {
      freqTemp++;
      before = data[i][0].trim().split(' ')[0];
      continue;
    }

    if (before == data[i][0].trim().split(' ')[0]) {
      freqTemp++;
    } else {
      labelTempArr.push(before);
      if (freqTemp == 0) {
        freqTempArr.push(freqTemp + 1);
      } else {
        freqTempArr.push(freqTemp);
      }
      freqTemp = 0;
    }

    before = data[i][0].trim().split(' ')[0];
  }

  labelTempArr.push(before);
  if (freqTemp == 0) {
    freqTempArr.push(freqTemp + 1);
  } else {
    freqTempArr.push(freqTemp);
  }

  return {
    labels: labelTempArr,
    datasets: [{ data: freqTempArr, label: 'Frequency' }],
  };
}

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: String) => {
    arrTemp.push(e[0].trim().split(' ')[0]);
  });

  return arrTemp;
}

export function getSaldoMovement(data: any) {
  const tempTanggalArray: any[] = [];
  const tempSaldoArray: any[] = [];

  data.forEach((e: any) => {
    tempSaldoArray.push(parseFloat(e[5].replaceAll(',', '')));
    tempTanggalArray.push(e[0]);
  });

  return {
    labels: tempTanggalArray,
    datasets: [{ data: tempSaldoArray, label: 'Saldo' }],
  };
}
