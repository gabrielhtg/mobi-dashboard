export function formatWaktu(date: string) {
  // Buat objek Date dari string input
  const dateObj = new Date(date);

  // Daftar nama bulan dalam Bahasa Inggris
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Ambil tanggal, bulan, tahun, jam, menit, dan detik dari objek Date
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();

  // Format ulang sesuai kebutuhan
  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}
