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
    if (!e[3].includes('DB')) {
      const tempVal: number = parseFloat(e[3].replaceAll(',', ''));
      debitData.data.push(0);

      if (e == '') {
        creditData.data.push(0);
      } else {
        creditData.data.push(tempVal);
      }
    } else {
      const tempVal: number = parseFloat(
        e[3].replaceAll(',', '').replaceAll(' DB', '')
      );

      if (e == '') {
        debitData.data.push(0);
      } else {
        debitData.data.push(tempVal);
      }

      creditData.data.push(0);
    }
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

// export function getDateFrequency(data: any) {
//   const labelTempArr = [];
//   const freqTempArr = [];
//   let freqTemp = 0;
//   let before = data[0][0].trim();

//   for (let i = 0; i < data.length; i++) {
//     if (i == 0) {
//       freqTemp++;
//       continue;
//     }

//     if (data[i][0].trim() == before) {
//       freqTemp++;
//     } else {
//       labelTempArr.push(before);
//       freqTempArr.push(freqTemp);
//       freqTemp = 0;
//     }

//     before = data[i][0].trim();
//   }

//   return {
//     labels: labelTempArr,
//     datasets: [{ data: freqTempArr, label: 'Frequency' }],
//   };
// }

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: String) => {
    arrTemp.push(e[0]);
  });

  return arrTemp;
}

export function getSaldoMovement(data: any) {
  const tempTanggalArray: any[] = [];
  const tempSaldoArray: any[] = [];

  data.forEach((e: any) => {
    if (e[4] !== '') {
      tempSaldoArray.push(parseFloat(e[4].replaceAll(',', '')));
      tempTanggalArray.push(e[0]);
    }
  });

  return {
    labels: tempTanggalArray,
    datasets: [{ data: tempSaldoArray, label: 'Saldo' }],
  };
}
