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

function getDateOnly(text: string) {
  return text.trim().split(' ')[0];
}

export function getDateFrequency(data: any) {
  const labelArr = [];
  const freqTotalArr = [];
  const freqKreditArr = [];
  const freqDebitArr = [];
  let freqTotal = 0;
  let freqKredit = 0;
  let freqDebit = 0;
  let currentDebit = '';
  let currentKredit = '';
  let currentTanggal = null;
  let beforeTanggal = null;

  for (let i = 0; i < data.length; i++) {
    currentTanggal = getDateOnly(data[i][0]);
    currentDebit = data[i][3].trim();
    currentKredit = data[i][4].trim();

    // ketika beforeTanggal masih belum ada
    if (beforeTanggal == null) {
      freqTotal++;

      // jika ini adalah debit maka tambahkan freq debit
      if (currentDebit !== '0.00') {
        freqDebit++;
      }

      // jika ini adalah kredit maka tambahkan freq kredit
      if (currentKredit !== '0.00') {
        freqKredit++;
      }

      beforeTanggal = currentTanggal;
      continue;
    }

    // ketika beforeTanggal sudah ada
    else {
      // jika tanggal sekarang sama dengan tanggal sebelumnya
      if (currentTanggal == beforeTanggal) {
        freqTotal++;

        // jika ini adalah debit maka tambahkan freq debit
        if (currentDebit !== '0.00') {
          freqDebit++;
        }

        // jika ini adalah kredit maka tambahkan freq kredit
        if (currentKredit !== '0.00') {
          freqKredit++;
        }
      }

      // jika tanggal sekarang berbeda dengan tanggal sebelumnya,
      // artinya kita sudah saatnya untuk reset frequensi
      else {
        // tambahkan label dengan tanggal sebelumnya
        labelArr.push(beforeTanggal);
        beforeTanggal = currentTanggal;

        freqTotalArr.push(freqTotal);
        freqTotal = 1;

        freqKreditArr.push(freqKredit);
        freqKredit = 0;
        // jika ini adalah kredit maka tambahkan freq kredit
        if (currentKredit !== '0.00') {
          freqKredit++;
        }

        freqDebitArr.push(freqDebit);
        freqDebit = 0;
        // jika ini adalah debit maka tambahkan freq debit
        if (currentDebit !== '0.00') {
          freqDebit++;
        }
      }
    }
  }

  // jika tanggal sekarang berbeda dengan tanggal sebelumnya,
  // artinya kita sudah saatnya untuk reset frequensi
  // tambahkan label dengan tanggal sebelumnya
  labelArr.push(beforeTanggal);
  beforeTanggal = currentTanggal;

  freqTotalArr.push(freqTotal);
  freqTotal = 1;

  freqKreditArr.push(freqKredit);
  freqKredit = 0;
  // jika ini adalah kredit maka tambahkan freq kredit
  if (currentKredit !== '0.00') {
    freqKredit++;
  }

  freqDebitArr.push(freqDebit);
  freqDebit = 0;
  // jika ini adalah debit maka tambahkan freq debit
  if (currentDebit !== '0.00') {
    freqDebit++;
  }

  return {
    labels: labelArr,
    datasets: [
      { data: freqTotalArr, label: 'Frequency', borderColor: '#55aa00' },
      { data: freqKreditArr, label: 'Kredit', borderColor: '#98cdf2' },
      { data: freqDebitArr, label: 'Debit', borderColor: '#fbafbe' },
    ],
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
  const labelArr: any[] = [];
  const saldoArr: any[] = [];
  let tanggalBefore: any = null;
  let currentTanggal = null;
  let currentSaldo = 0;

  data.forEach((e: any) => {
    currentTanggal = getDateOnly(e[0]);
    currentSaldo = parseFloat(e[5].replaceAll(',', ''));

    // ketika tanggalBefore masih null
    if (tanggalBefore == null) {
      tanggalBefore = currentTanggal;
      saldoArr.push(currentSaldo);
      labelArr.push(currentTanggal);
    }

    // saat tanggalBefore sudah ada
    else {
      if (tanggalBefore !== currentTanggal) {
        saldoArr.push(currentSaldo);
        labelArr.push(currentTanggal);
      }
    }

    tanggalBefore = currentTanggal;
  });

  return {
    labels: labelArr,
    datasets: [{ data: saldoArr, label: 'Saldo', borderColor: '#ffaa00' }],
  };
}
