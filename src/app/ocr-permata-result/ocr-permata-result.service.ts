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
    debitData.data.push(convertToFloat(e.debet));
    creditData.data.push(convertToFloat(e.kredit));
  });

  return [creditData, debitData];
}

export function getMonthlyChartLabels(data: any) {
  const arrTemp: any[] = [];

  data.forEach((e: any) => {
    if (e.tanggal_transaksi !== null) {
      arrTemp.push(e.tanggal_transaksi.trim());
    }
  });

  return arrTemp;
}

export function getDateFrequency(transactionData: any) {
  let before: string | null = null;
  const labelArr: any = [];
  const freqTotalArr: any = [];
  const freqKreditArr: any = [];
  const freqDebitArr: any = [];

  transactionData.forEach((e: any) => {
    if (before == null) {
      before = e.tanggal_transaksi;
    }
  });

  return {
    labels: labelArr,
    datasets: [
      { data: freqTotalArr, label: 'Frequency', borderColor: '#55aa00' },
      { data: freqKreditArr, label: 'Kredit', borderColor: '#98cdf2' },
      { data: freqDebitArr, label: 'Debit', borderColor: '#fbafbe' },
    ],
  };
}
