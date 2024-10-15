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
  let currentMutasi = null;

  for (let i = 0; i < data.length; i++) {
    currentTanggal = data[i][0];
    currentMutasi = data[i][3];

    // kembalikan ke sebelumnya
    if (currentTanggal == '') {
      currentTanggal = beforeTanggal;
    }

    // set currentDebit
    if (data[i][3].includes('DB')) {
      currentDebit = data[i][3];
      freqDebit++;
    }

    // set currentKredit
    else if (!data[i][3].includes('DB') && data[i][3] !== '') {
      currentKredit = data[i][3];
      freqKredit++;
    }

    // ketika beforeTanggal masih belum ada
    if (beforeTanggal == null) {
      if (currentTanggal !== '') {
        freqTotal++;
      }
      beforeTanggal = currentTanggal;
      continue;
    }

    // ketika beforeTanggal sudah ada
    else {
      // jika tanggal sekarang sama dengan tanggal sebelumnya
      if (currentTanggal == beforeTanggal) {
        if (currentTanggal !== '') {
          freqTotal++;
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
        freqDebitArr.push(freqDebit);
        freqDebit = 0;
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

  // set currentDebit
  if (currentMutasi.includes('DB')) {
    currentDebit = currentMutasi;
    freqDebit++;
  }

  // set currentKredit
  else if (currentMutasi.includes('DB') && currentMutasi !== '') {
    currentKredit = currentMutasi;
    freqKredit++;
  }

  freqKreditArr.push(freqKredit);
  freqDebitArr.push(freqDebit);

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
    arrTemp.push(e[0]);
  });

  return arrTemp;
}

/**
 *
 * @param data
 *
 * Method ini digunakan untuk membuat data untuk tabel saldo
 */

export function getSaldoMovement(data: any) {
  const labelArr: any[] = [];
  const saldoArr: any[] = [];
  let tanggalBefore: any = null;
  let currentTanggal = null;
  let currentSaldo: any = 0;
  let goToNextTanggal = false;

  data.forEach((e: any) => {
    currentTanggal = e[0];
    currentSaldo = e[4];
    // currentSaldo = parseFloat(e[4].replaceAll(',', ''));

    // console.log(`Current tanggal : ${currentTanggal}`);
    // console.log(`Tanggal before  : ${tanggalBefore}`);
    // console.log(`goToNextTanggal : ${goToNextTanggal}`);
    // console.log(`current saldo   : ${currentSaldo}`);
    // console.log(`labelArr        : ${labelArr}`);
    // console.log(`saldoarr        : ${saldoArr}`);
    // console.log('\n');

    // ketika tanggal before belum didefenisikan
    if (tanggalBefore == null) {
      labelArr.push(currentTanggal);

      if (currentSaldo !== '') {
        saldoArr.push(parseFloat(currentSaldo.replaceAll(',', '')));
        goToNextTanggal = true;
      }
    }

    // ketika tanggal before sudah didefenisikan
    else {
      if (currentTanggal === tanggalBefore && goToNextTanggal) {
        return;
      } else if (currentTanggal != tanggalBefore && goToNextTanggal) {
        goToNextTanggal = false;

        if (currentSaldo != '') {
          labelArr.push(currentTanggal);
          saldoArr.push(parseFloat(currentSaldo.replaceAll(',', '')));
          goToNextTanggal = true;
        }
      } else if (currentTanggal == tanggalBefore && !goToNextTanggal) {
        if (currentSaldo != '') {
          labelArr.push(currentTanggal);
          saldoArr.push(parseFloat(currentSaldo.replaceAll(',', '')));
          goToNextTanggal = true;
        }
      }
    }

    tanggalBefore = currentTanggal;
  });

  // console.log(labelArr);
  // console.log(saldoArr);

  return {
    labels: labelArr,
    datasets: [{ data: saldoArr, label: 'Saldo', borderColor: '#ffaa00' }],
  };
}
