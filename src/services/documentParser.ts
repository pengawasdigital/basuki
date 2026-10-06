import * as XLSX from 'xlsx';
import { api } from './api';

export type SupportedEntityType = 'guru' | 'sekolah' | 'prestasi' | 'kepalaSekolah' | 'berita' | 'pengumuman' | 'umum';

export interface ParsedDocumentResult<T = any> {
  filename: string;
  fileType: 'excel' | 'word' | 'pdf' | 'text';
  rawText: string;
  headers: string[];
  rawRows: Record<string, any>[];
  mappedItems: T[];
  warnings: string[];
}

// Normalize string for fuzzy key matching
function cleanKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Smart mapping of arbitrary row keys to Guru model
 */
export function mapRowToGuru(row: Record<string, any>, defaultSekolahId?: string) {
  const keys = Object.keys(row);
  const getVal = (candidates: string[]): string => {
    for (const cand of candidates) {
      const matchedKey = keys.find((k) => cleanKey(k) === cleanKey(cand));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const nama = getVal(['nama', 'namalengkap', 'namaguru', 'guru', 'name']);
  const nip = getVal(['nip', 'nomorindukpegawai', 'noinduk']);
  const nuptk = getVal(['nuptk', 'nomornuptk']);
  const jabatan = getVal(['jabatan', 'tugas', 'posisi', 'peran']) || 'Guru Kelas';
  const mapel = getVal(['mapel', 'matapelajaran', 'bidangstudi', 'ampu']);
  const pendidikan = getVal(['pendidikan', 'pendidikanterakhir', 'ijazah', 'lulusan']) || 'S1 PGSD';
  const statusKepegawaian = getVal(['statuskepegawaian', 'status', 'kepegawaian', 'golongan']) || 'PNS';
  const email = getVal(['email', 'surel', 'kontak']);
  const sekolahId = getVal(['sekolah', 'sekolahid', 'idsekolah', 'namasekolah']) || defaultSekolahId || '';

  return {
    nama,
    nip,
    nuptk,
    jabatan,
    mapel,
    pendidikan,
    statusKepegawaian,
    email,
    sekolahId,
    foto: '',
    tampilkanPublik: true
  };
}

/**
 * Smart mapping of arbitrary row keys to Sekolah model
 */
export function mapRowToSekolah(row: Record<string, any>) {
  const keys = Object.keys(row);
  const getVal = (candidates: string[]): string => {
    for (const cand of candidates) {
      const matchedKey = keys.find((k) => cleanKey(k) === cleanKey(cand));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const nama = getVal(['nama', 'namasekolah', 'satuanpendidikan', 'namasatpend']);
  const npsn = getVal(['npsn', 'nomorpokoksekolahnasiona', 'nonpsn']);
  let jenjang = getVal(['jenjang', 'tingkat', 'jenjangsekolah']).toUpperCase();
  if (!['TK', 'SD', 'SMP', 'PAUD'].includes(jenjang)) {
    if (nama.toLowerCase().includes('tk') || nama.toLowerCase().includes('paud')) jenjang = 'TK';
    else if (nama.toLowerCase().includes('smp')) jenjang = 'SMP';
    else jenjang = 'SD';
  }
  let status = getVal(['status', 'statussekolah']).toUpperCase();
  if (!['NEGERI', 'SWASTA'].includes(status)) {
    status = nama.toLowerCase().includes('swasta') ? 'SWASTA' : 'NEGERI';
  }
  const alamat = getVal(['alamat', 'lokasi', 'alamatsekolah']) || 'Kecamatan Perhentian Raja, Kabupaten Kampar';
  const desaKelurahan = getVal(['desa', 'kelurahan', 'desakelurahan']) || 'Hangtuah';
  const kecamatan = getVal(['kecamatan', 'wilayah']) || 'Perhentian Raja';
  const akreditasi = getVal(['akreditasi', 'nilaiakreditasi', 'grade']) || 'A';
  const kepalaSekolahNama = getVal(['kepalasekolah', 'namakepalasekolah', 'kepsek']);
  const kepalaSekolahNip = getVal(['nipkepalasekolah', 'nipkepsek']);
  const jumlahGuru = parseInt(getVal(['jumlahguru', 'guru', 'totalguru']), 10) || 12;
  const jumlahSiswa = parseInt(getVal(['jumlahsiswa', 'siswa', 'totalsiswa', 'pesertadidik']), 10) || 150;
  const noTelepon = getVal(['telepon', 'notelepon', 'hp', 'wa']);
  const email = getVal(['email', 'surel']);

  return {
    nama,
    npsn,
    jenjang,
    status,
    alamat,
    desaKelurahan,
    kecamatan,
    akreditasi,
    kepalaSekolahNama,
    kepalaSekolahNip,
    jumlahGuru,
    jumlahSiswa,
    noTelepon,
    email,
    kurikulum: 'Kurikulum Merdeka'
  };
}

/**
 * Smart mapping of arbitrary row keys to Prestasi model
 */
export function mapRowToPrestasi(row: Record<string, any>, defaultSekolahId?: string) {
  const keys = Object.keys(row);
  const getVal = (candidates: string[]): string => {
    for (const cand of candidates) {
      const matchedKey = keys.find((k) => cleanKey(k) === cleanKey(cand));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const judul = getVal(['judul', 'namaprestasi', 'kejuaraan', 'lomba', 'prestasi']);
  const penerima = getVal(['penerima', 'namasiswa', 'namaguru', 'peserta', 'juara']);
  const juara = getVal(['juara', 'peringkat', 'predikat']) || 'Juara 1';
  let tingkat = getVal(['tingkat', 'level']).toUpperCase();
  if (!['KECAMATAN', 'KABUPATEN', 'PROVINSI', 'NASIONAL', 'INTERNASIONAL'].includes(tingkat)) {
    if (tingkat.includes('NAS')) tingkat = 'NASIONAL';
    else if (tingkat.includes('PROV')) tingkat = 'PROVINSI';
    else if (tingkat.includes('KEC')) tingkat = 'KECAMATAN';
    else tingkat = 'KABUPATEN';
  }
  const tahun = parseInt(getVal(['tahun', 'thn', 'periode']), 10) || new Date().getFullYear();
  const bidang = getVal(['bidang', 'kategori']) || 'Akademik & Seni';
  const penyelenggara = getVal(['penyelenggara', 'instansi', 'dinas']) || 'Dinas Pendidikan Kepemudaan dan Olahraga';
  const deskripsi = getVal(['deskripsi', 'keterangan', 'ringkasan']) || `Meraih ${juara} tingkat ${tingkat} pada ajang ${judul}.`;
  const sekolahId = getVal(['sekolah', 'sekolahid']) || defaultSekolahId || '';

  return {
    judul,
    penerima,
    juara,
    tingkat,
    tahun,
    bidang,
    penyelenggara,
    deskripsi,
    sekolahId,
    foto: ''
  };
}

/**
 * Smart mapping of arbitrary row keys to KepalaSekolah model
 */
export function mapRowToKepalaSekolah(row: Record<string, any>, defaultSekolahId?: string) {
  const keys = Object.keys(row);
  const getVal = (candidates: string[]): string => {
    for (const cand of candidates) {
      const matchedKey = keys.find((k) => cleanKey(k) === cleanKey(cand));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const nama = getVal(['nama', 'namakepalasekolah', 'namalengkap', 'kepsek', 'name']);
  const nip = getVal(['nip', 'nomorindukpegawai', 'noinduk']);
  const periode = getVal(['periode', 'tahun', 'masajabatan', 'masabakti']) || '2022 - Sekarang';
  let status = getVal(['status', 'keaktifan', 'statusjabatan']);
  if (!status) status = 'Aktif';
  else if (
    status.toLowerCase().includes('purna') ||
    status.toLowerCase().includes('mantan') ||
    status.toLowerCase().includes('pensiun')
  ) {
    status = 'Purna Bakti';
  } else {
    status = 'Aktif';
  }
  const keterangan = getVal(['keterangan', 'catatan', 'prestasi', 'ket', 'deskripsi']);
  const sambutan = getVal(['sambutan', 'pesan', 'katapengantar']);
  const sekolahId = getVal(['sekolah', 'sekolahid', 'idsekolah', 'namasekolah']) || defaultSekolahId || '';

  return {
    nama,
    nip,
    periode,
    status,
    keterangan,
    sambutan,
    sekolahId,
    foto: ''
  };
}

/**
 * Parse uploaded file (client or server) and map to entity items
 */
export async function parseDocumentFile(
  file: File,
  entityType: SupportedEntityType = 'umum',
  defaultSekolahId?: string
): Promise<ParsedDocumentResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let rawText = '';
  let headers: string[] = [];
  let rawRows: Record<string, any>[] = [];
  let detectedFileType: 'excel' | 'word' | 'pdf' | 'text' = 'text';

  // 1. If Excel (.xlsx, .xls) or CSV: parse in-browser first using XLSX for ultra-fast response
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    detectedFileType = 'excel';
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (json.length > 0) {
        rawRows = json;
        headers = Object.keys(json[0]);
      }
      rawText = XLSX.utils.sheet_to_csv(sheet);
    } catch {
      // Fallback to server parse
      const serverRes = await api.parseDocument(file);
      rawRows = serverRes.rows;
      headers = serverRes.headers;
      rawText = serverRes.rawText;
    }
  } else {
    // 2. For Word (.docx, .doc), PDF (.pdf), or text: send to server endpoint
    const serverRes = await api.parseDocument(file);
    detectedFileType = serverRes.fileType;
    rawRows = serverRes.rows;
    headers = serverRes.headers;
    rawText = serverRes.rawText;
  }

  // Map to target entity
  let mappedItems: any[] = [];
  const warnings: string[] = [];

  if (entityType === 'guru') {
    mappedItems = rawRows
      .map((r) => mapRowToGuru(r, defaultSekolahId))
      .filter((g) => g.nama && g.nama.length > 1);
  } else if (entityType === 'sekolah') {
    mappedItems = rawRows
      .map((r) => mapRowToSekolah(r))
      .filter((s) => s.nama && s.nama.length > 2);
  } else if (entityType === 'prestasi') {
    mappedItems = rawRows
      .map((r) => mapRowToPrestasi(r, defaultSekolahId))
      .filter((p) => p.judul && p.judul.length > 2);
  } else if (entityType === 'kepalaSekolah') {
    mappedItems = rawRows
      .map((r) => mapRowToKepalaSekolah(r, defaultSekolahId))
      .filter((k) => k.nama && k.nama.length > 1);
  } else {
    mappedItems = rawRows;
  }

  return {
    filename: file.name,
    fileType: detectedFileType,
    rawText,
    headers,
    rawRows,
    mappedItems,
    warnings
  };
}

/**
 * Generate and download ready-to-use Excel template for Guru
 */
export function downloadTeacherExcelTemplate() {
  const sampleData = [
    {
      'Nama Guru': 'Hj. Siti Aminah, S.Pd.SD',
      'NIP': '19820514 200801 2 015',
      'NUPTK': '9845760662210043',
      'Jabatan': 'Guru Kelas 4',
      'Mata Pelajaran': 'Tematik / Guru Kelas',
      'Pendidikan': 'S1 PGSD',
      'Status Kepegawaian': 'PNS',
      'Email': 'siti.aminah@gmail.com'
    },
    {
      'Nama Guru': 'Ahmad Fauzi, S.Pd.',
      'NIP': '19900320 201903 1 008',
      'NUPTK': '4332768670130092',
      'Jabatan': 'Guru PJOK',
      'Mata Pelajaran': 'Pendidikan Jasmani & Olahraga',
      'Pendidikan': 'S1 Penjaskesrek',
      'Status Kepegawaian': 'PPPK',
      'Email': 'ahmad.fauzi@gmail.com'
    },
    {
      'Nama Guru': 'Nurul Hidayah, S.Pd.I',
      'NIP': '-',
      'NUPTK': '7854765666230081',
      'Jabatan': 'Guru PAI',
      'Mata Pelajaran': 'Pendidikan Agama Islam',
      'Pendidikan': 'S1 Tarbiyah PAI',
      'Status Kepegawaian': 'Honorer / GTT',
      'Email': 'nurul.hidayah@gmail.com'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
  XLSX.writeFile(wb, 'Format_Import_Data_Guru.xlsx');
}

/**
 * Generate and download ready-to-use Excel template for Sekolah
 */
export function downloadSchoolExcelTemplate() {
  const sampleData = [
    {
      'NPSN': '10400501',
      'Nama Sekolah': 'SDN 005 Hangtuah',
      'Jenjang': 'SD',
      'Status': 'NEGERI',
      'Alamat': 'Jl. Poros Perhentian Raja KM 12',
      'Desa / Kelurahan': 'Hangtuah',
      'Kecamatan': 'Perhentian Raja',
      'Akreditasi': 'A',
      'Nama Kepala Sekolah': 'Drs. H. Mulyadi, M.Pd.',
      'NIP Kepala Sekolah': '19680415 199303 1 005',
      'Jumlah Guru': 14,
      'Jumlah Siswa': 210,
      'No Telepon': '081267891234',
      'Email': 'sdn005hangtuah@kampar.sch.id'
    },
    {
      'NPSN': '10400502',
      'Nama Sekolah': 'TK Negeri Pembina Perhentian Raja',
      'Jenjang': 'TK',
      'Status': 'NEGERI',
      'Alamat': 'Jl. Pendidikan No. 4',
      'Desa / Kelurahan': 'Pantai Raja',
      'Kecamatan': 'Perhentian Raja',
      'Akreditasi': 'A',
      'Nama Kepala Sekolah': 'Hj. Rosdiana, S.Pd.AUD',
      'NIP Kepala Sekolah': '19720918 199803 2 003',
      'Jumlah Guru': 6,
      'Jumlah Siswa': 65,
      'No Telepon': '085278910022',
      'Email': 'tkn.pembina@kampar.sch.id'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Sekolah');
  XLSX.writeFile(wb, 'Format_Import_Data_Sekolah.xlsx');
}

/**
 * Generate and download ready-to-use Excel template for Prestasi
 */
export function downloadAchievementExcelTemplate() {
  const sampleData = [
    {
      'Judul Prestasi': 'Juara 1 OSN Matematika Tingkat Kabupaten',
      'Penerima': 'Rizky Pratama (Kelas V)',
      'Juara': 'Juara 1',
      'Tingkat': 'KABUPATEN',
      'Tahun': 2025,
      'Bidang': 'Sains / OSN',
      'Penyelenggara': 'Dinas Pendidikan Kab. Kampar',
      'Deskripsi': 'Meraih medali emas dan mewakili Kabupaten Kampar ke ajang Olimpiade Sains Provinsi.'
    },
    {
      'Judul Prestasi': 'Juara 2 FLS2N Seni Tari Kreasi Tradisional',
      'Penerima': 'Tim Tari SDN 001 Pantai Raja',
      'Juara': 'Juara 2',
      'Tingkat': 'KABUPATEN',
      'Tahun': 2025,
      'Bidang': 'Seni & Budaya / FLS2N',
      'Penyelenggara': 'Dinas Pendidikan Kab. Kampar',
      'Deskripsi': 'Menampilkan tarian kreasi Melayu Kampar dengan harmoni gerak dan busana terbaik.'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Prestasi');
  XLSX.writeFile(wb, 'Format_Import_Data_Prestasi.xlsx');
}

/**
 * Generate and download ready-to-use Excel template for Kepala Sekolah
 */
export function downloadPrincipalExcelTemplate() {
  const sampleData = [
    {
      'Nama Kepala Sekolah': 'Drs. H. Mulyadi, M.Pd.',
      'NIP': '19680415 199303 1 005',
      'Periode Jabatan': '2021 - Sekarang',
      'Status': 'Aktif',
      'Keterangan': 'Kepala Sekolah Penggerak Angkatan 2',
      'Sambutan': 'Assalamu alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi sekolah kami. Kami berkomitmen memberikan layanan pendidikan bermutu dan menumbuhkan karakter profil pelajar pancasila.'
    },
    {
      'Nama Kepala Sekolah': 'Hj. Rosdiana, S.Pd.AUD',
      'NIP': '19720918 199803 2 003',
      'Periode Jabatan': '2022 - Sekarang',
      'Status': 'Aktif',
      'Keterangan': 'Kepala TK Negeri Pembina',
      'Sambutan': 'Mengembangkan fondasi karakter anak usia dini yang ceria, mandiri, dan berakhlak mulia.'
    },
    {
      'Nama Kepala Sekolah': 'H. Syamsudin, S.Pd.',
      'NIP': '19590712 198203 1 003',
      'Periode Jabatan': '2015 - 2021',
      'Status': 'Purna Bakti',
      'Keterangan': 'Masa bakti 6 tahun dengan pencapaian akreditasi unggul',
      'Sambutan': ''
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Kepala Sekolah');
  XLSX.writeFile(wb, 'Format_Import_Data_Kepala_Sekolah.xlsx');
}
