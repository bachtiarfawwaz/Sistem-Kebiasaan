<template>
  <div class="detail-siswa-guru">
    <!-- Header & Info Section -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Detail Laporan Jurnal</h1>
        <p class="page-subtitle">Pantau tingkat konsistensi penerapan 7 kebiasaan anak.</p>
        
        <div class="student-info">
          <div class="info-badge">
            <Icon name="ph:user-circle-duotone" class="info-icon text-blue" />
            <span class="info-text"><strong>{{ studentData.nama }}</strong> (NIS: {{ studentData.nis }})</span>
          </div>
          <div class="info-badge">
            <Icon name="ph:chalkboard-teacher-duotone" class="info-icon text-green" />
            <span class="info-text">Kelas {{ studentData.namaKelas }} | Wali: {{ studentData.waliKelas }}</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="filter-wrapper">
          <Icon name="ph:calendar-blank-duotone" class="select-icon-left" />
          <select class="btn-month-select" v-model="selectedFilter" @change="onMonthChange">
            <option v-for="(opt, index) in filterOptions" :key="index" :value="opt.value">{{ opt.label }}</option>
          </select>
          <Icon name="ph:caret-down-bold" class="select-icon-right" />
        </div>
      </div>
    </div>

    <!-- Tabel Laporan (Tingkat Pembiasaan) -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-no">No</th>
              <th rowspan="2" class="col-kegiatan">7 Kebiasaan Anak Indonesia Hebat</th>
              <th colspan="4" class="col-penerapan">Kategori Tingkat Pembiasaan</th>
            </tr>
            <tr class="sub-header">
              <th class="col-opsi opsi-belum">Belum<br>Terbiasa</th>
              <th class="col-opsi opsi-mulai">Mulai<br>Terbiasa</th>
              <th class="col-opsi opsi-terbiasa"><br>Terbiasa</th>
              <th class="col-opsi opsi-sangat">Sangat<br>Terbiasa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in kebiasaanData" :key="index" class="table-row">
              <td class="text-center text-number">{{ index + 1 }}</td>
              <td class="kegiatan-text">
                <span class="kegiatan-label">
                  {{ item.nama }} <span class="days-badge">({{ item.daysCompleted }} Hari)</span>
                </span>
              </td>
              <td class="text-center">
                <label class="custom-radio radio-belum">
                  <input type="radio" :name="'kegiatan_' + index" value="belum" :checked="getClassifiedLevel(item.daysCompleted) === 'belum'" disabled />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="text-center">
                <label class="custom-radio radio-mulai">
                  <input type="radio" :name="'kegiatan_' + index" value="mulai" :checked="getClassifiedLevel(item.daysCompleted) === 'mulai'" disabled />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="text-center">
                <label class="custom-radio radio-terbiasa">
                  <input type="radio" :name="'kegiatan_' + index" value="terbiasa" :checked="getClassifiedLevel(item.daysCompleted) === 'terbiasa'" disabled />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="text-center">
                <label class="custom-radio radio-sangat">
                  <input type="radio" :name="'kegiatan_' + index" value="sangat" :checked="getClassifiedLevel(item.daysCompleted) === 'sangat'" disabled />
                  <span class="checkmark"></span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tindak Lanjut Guru -->
    <div class="feedback-section">
      <div class="feedback-header">
        <div class="icon-box">
          <Icon name="ph:notebook-duotone" class="feedback-icon" />
        </div>
        <div>
          <h2>Tindak Lanjut Guru</h2>
          <p>Tuliskan evaluasi, arahan, atau pembinaan yang perlu diberikan kepada peserta didik.</p>
        </div>
      </div>
      
      <div class="feedback-content">
        <textarea 
          class="feedback-textarea" 
          placeholder="Belum ada catatan khusus dari guru untuk periode ini."
          rows="5"
          v-model="catatanGuru"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'siswa'
})

const route = useRoute()
const supabase = useSupabase()

const studentData = ref({
  nama: 'Memuat...',
  nis: '-',
  namaKelas: '-',
  waliKelas: '-',
  nipWali: '-',
  namaSekolah: '-',
  namaOrangTua: '-',
  agama: 'Islam'
})

const loggedInStudentId = ref(null)

onMounted(async () => {
  let { data: { user } } = await supabase.auth.getUser()
  const session = useCookie('user_session').value

  if (!user && session && session.id) {
    user = { id: session.id }
  }

  if (!user) {
    alert("Sesi login tidak ditemukan. Silakan login ulang.")
    return
  }
  
  let studentId = null
  
  // 1. Coba cari apakah user ini adalah siswa
  const { data: pdData, error: pdErr } = await supabase.from('peserta_didik').select('id').eq('user_id', user.id).maybeSingle()
  if (pdData) {
    studentId = pdData.id
  } else {
    // Jika ada error atau data kosong
    if (session && session.role === 'siswa') {
      if (pdErr) {
        console.error("Error melacak akun siswa:", pdErr)
      }
      alert("Data profil Anda belum lengkap atau belum dihubungkan. Silakan minta Orang Tua Anda untuk melengkapi Profil dan Akun Siswa.")
    }
    // 2. Jika bukan siswa, cari apakah user ini adalah orang tua
    const { data: otData } = await supabase.from('orang_tua').select('id').eq('user_id', user.id).single()
    if (otData) {
      const { data: pdData2 } = await supabase.from('peserta_didik').select('id').eq('orang_tua_id', otData.id).single()
      if (pdData2) studentId = pdData2.id
    } else {
      // 3. Fallback: Jika Admin/Guru yang sedang tes buka halaman ini
      const session = useCookie('user_session').value
      if (session && (session.role === 'admin' || session.role === 'guru')) {
        const { data: previewData } = await supabase.from('peserta_didik').select('id').limit(1).single()
        if (previewData) studentId = previewData.id
      }
    }
  }

  if (studentId) {
    loggedInStudentId.value = studentId
    const { data: s, error: sErr } = await supabase.from('peserta_didik').select('*, kelas(nama_kelas, wali_kelas_id), orang_tua(nama)').eq('id', studentId).single()
    
    if (sErr) {
       alert("Error mengambil data dari database: " + sErr.message + ". Pastikan RLS (Row Level Security) di tabel peserta_didik sudah diizinkan (Enable read access for all users).")
    }
    if (s) {
      studentData.value.nama = s.nama
      studentData.value.nis = s.nis || '-'
      studentData.value.namaKelas = s.kelas?.nama_kelas || '-'
      studentData.value.namaOrangTua = s.orang_tua?.nama || '-'
      studentData.value.agama = s.agama || 'Islam'
      
      if (s.kelas?.wali_kelas_id) {
        const { data: g } = await supabase.from('guru').select('nama, nip').eq('id', s.kelas.wali_kelas_id).single()
        if (g) {
          studentData.value.waliKelas = g.nama
          studentData.value.nipWali = g.nip || '-'
        }
      }
    }
    
    // Hitung summary awal saat halaman dimuat
    calculateSummary()
  }
})

const catatanGuru = ref('')
const currentEvaluasiId = ref(null)

const exportPDF = () => {
  window.print();
}

const monthsList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const generateFilterOptions = () => {
  const options = []
  const today = new Date()
  let m = today.getMonth()
  let y = today.getFullYear()
  for (let i = 0; i < 12; i++) {
    options.push({ label: `${monthsList[m]} ${y}`, value: `${y}-${m}`, month: m, year: y })
    m--
    if (m < 0) { m = 11; y-- }
  }
  return options
}

const filterOptions = generateFilterOptions()
const selectedFilter = ref(filterOptions[0].value)
const selectedMonth = ref(filterOptions[0].month)
const selectedYear = ref(filterOptions[0].year)

const onMonthChange = () => {
  const [y, m] = selectedFilter.value.split('-')
  selectedMonth.value = parseInt(m)
  selectedYear.value = parseInt(y)
  calculateSummary()
}

const calculateSummary = async () => {
  const studentId = loggedInStudentId.value
  if (!studentId) return

  const startDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-01`
  const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
  const endDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${daysInMonth}`

  // 1. Ambil semua jurnal_harian bulan ini
  const { data: harianData } = await supabase
    .from('jurnal_harian')
    .select('id, tanggal')
    .eq('peserta_didik_id', studentId)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)

  // Reset counters
  kebiasaanData.value.forEach(k => k.daysCompleted = 0)
  catatanGuru.value = ''
  currentEvaluasiId.value = null

  if (harianData && harianData.length > 0) {
    const harianIds = harianData.map(h => h.id)

    // Ambil Ibadah
    const { data: ibadahData } = await supabase.from('jurnal_ibadah').select('jurnal_harian_id').in('jurnal_harian_id', harianIds).eq('status', true)
    if (ibadahData) {
      const ibadahCounts = ibadahData.reduce((acc, curr) => {
        acc[curr.jurnal_harian_id] = (acc[curr.jurnal_harian_id] || 0) + 1
        return acc
      }, {})
      const isIslam = !studentData.value?.agama || studentData.value.agama.toLowerCase().trim() === 'islam'
      const requiredCount = isIslam ? 5 : 3
      const uniqueDays = Object.values(ibadahCounts).filter(count => count >= requiredCount).length
      const ibadahObj = kebiasaanData.value.find(k => k.nama === 'Beribadah')
      if (ibadahObj) ibadahObj.daysCompleted = uniqueDays
    }

    // Ambil Kebiasaan Lainnya
    const { data: masterKebiasaan } = await supabase.from('kebiasaan').select('id, nama_kebiasaan')
    const { data: kebiasaanLogs } = await supabase.from('jurnal_kebiasaan').select('jurnal_harian_id, kebiasaan_id, keterangan').in('jurnal_harian_id', harianIds).eq('status', true)
    
    if (masterKebiasaan && kebiasaanLogs) {
      kebiasaanData.value.forEach(k => {
        if (k.nama === 'Beribadah') return
        const masterK = masterKebiasaan.find(mk => mk.nama_kebiasaan.toLowerCase().includes(k.nama.toLowerCase().split(' ')[0]))
        if (masterK) {
           const validLogs = kebiasaanLogs.filter(l => l.kebiasaan_id === masterK.id)
           let count = 0

           if (k.nama === 'Bangun Pagi') {
             // Hanya dihitung "Terbiasa" jika bangun <= 06:00 pagi
             count = new Set(validLogs.filter(l => {
                if (!l.keterangan || l.keterangan === 'Lebih dari 06:00') return false
                const [h, m] = l.keterangan.split(':').map(Number)
                return (h * 60 + m) <= (6 * 60)
             }).map(l => l.jurnal_harian_id)).size
           } else if (k.nama === 'Tidur tepat waktu' || k.nama === 'Tidur Tepat Waktu') {
             // Hanya dihitung "Terbiasa" jika tidur <= 22:00 malam (berdasarkan status 'good' / 'warning')
             count = new Set(validLogs.filter(l => {
                if (!l.keterangan || l.keterangan === 'Lebih dari 22:00') return false
                const [h, m] = l.keterangan.split(':').map(Number)
                return (h * 60 + m) <= (22 * 60)
             }).map(l => l.jurnal_harian_id)).size
           } else if (k.nama === 'Berolahraga' || k.nama === 'Gemar Belajar') {
             count = new Set(validLogs.filter(l => {
                if (!l.keterangan) return false
                let text = ''
                try {
                  const parsed = JSON.parse(l.keterangan)
                  text = parsed.materi || parsed.keterangan || l.keterangan
                } catch(e) {
                  text = l.keterangan
                }
                const match = text.match(/\((\d+)\s*Menit\)/i)
                if (match) {
                  return parseInt(match[1]) >= 30
                }
                return false
             }).map(l => l.jurnal_harian_id)).size
           } else if (k.nama === 'Makan sehat & Bergizi') {
             count = new Set(validLogs.filter(l => {
                if (!l.keterangan) return false
                try {
                  const parsed = JSON.parse(l.keterangan)
                  return (parsed.nasi && parsed.nasi !== 'Tidak Konsumsi') &&
                         (parsed.lauk && parsed.lauk !== 'Tidak Konsumsi') &&
                         (parsed.sayur && parsed.sayur !== 'Tidak Konsumsi') &&
                         (parsed.buah && parsed.buah !== 'Tidak Konsumsi')
                } catch(e) {
                  return false
                }
             }).map(l => l.jurnal_harian_id)).size
           } else {
             count = new Set(validLogs.map(l => l.jurnal_harian_id)).size
           }
           
           k.daysCompleted = count
        }
      })
    }

    // Ambil Evaluasi Guru untuk bulan ini (ambil yang terbaru)
    const { data: evData } = await supabase.from('evaluasi_guru').select('*').in('jurnal_harian_id', harianIds).order('created_at', { ascending: false }).limit(1)
    if (evData && evData.length > 0) {
      catatanGuru.value = evData[0].catatan_evaluasi
      currentEvaluasiId.value = evData[0].id
    }
  }
}



// Implementasi Logika Rule-Based Classification
const getClassifiedLevel = (daysCompleted) => {
  if (daysCompleted >= 24 && daysCompleted <= 31) return 'sangat';
  if (daysCompleted >= 16 && daysCompleted <= 23) return 'terbiasa';
  if (daysCompleted >= 8 && daysCompleted <= 15) return 'mulai';
  return 'belum';
}

const kebiasaanData = ref([
  { id: 1, nama: 'Bangun Pagi', daysCompleted: 0 },
  { id: 2, nama: 'Beribadah', daysCompleted: 0 },
  { id: 3, nama: 'Berolahraga', daysCompleted: 0 },
  { id: 4, nama: 'Makan sehat & Bergizi', daysCompleted: 0 },
  { id: 5, nama: 'Gemar Belajar', daysCompleted: 0 },
  { id: 6, nama: 'Bermasyarakat', daysCompleted: 0 },
  { id: 7, nama: 'Tidur tepat waktu', daysCompleted: 0 }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

.print-template-container {
  display: none;
}

@media print {
  /* Sembunyikan elemen web utama */
  .page-header, .table-card, .feedback-section, .modal-overlay {
    display: none !important;
  }
  
  @page {
    size: A4 portrait;
    margin: 0;
  }
  
  html, body, #__nuxt, #__layout {
    height: 100% !important;
    background: white !important;
  }
  
  .detail-siswa-guru {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }
  
  /* Layout Khusus Cetak */
  .print-template-container {
    display: block !important;
    width: 100%;
    height: 100vh;
    padding: 0.8cm;
    box-sizing: border-box;
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Nunito', sans-serif;
  }

  .print-border-box {
    border: 12px solid #e1f5fe;
    border-radius: 20px;
    height: 100%;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .print-top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;
    position: relative;
  }

  .print-title-text {
    font-size: 2.8rem;
    font-weight: 900;
    color: #1e3a8a;
    margin: 0;
    letter-spacing: 2px;
    border-bottom: 4px solid #f48fb1;
    padding-bottom: 0.5rem;
    width: 60%;
  }

  .print-mascot-placeholder {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .print-mascot-icon {
    font-size: 5rem;
    color: #f48fb1;
  }

  .print-custom-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    color: #000;
  }

  .print-custom-table th, .print-custom-table td {
    border: 1px solid #000;
    padding: 0.6rem 0.4rem;
    font-size: 1rem;
    vertical-align: middle;
  }

  .print-custom-table th {
    background-color: #b3e5fc;
    font-weight: bold;
    text-align: center;
  }

  .print-custom-table td {
    font-weight: 500;
  }

  .print-custom-table .text-center {
    text-align: center;
  }

  .print-custom-table .check-mark {
    font-family: 'Comic Sans MS', cursive;
    font-weight: bold;
  }

  .print-signatures-box {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2.5rem;
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
  }

  .print-signatures-box p {
    margin: 0.3rem 0;
  }

  .print-sig-space {
    height: 70px;
  }

  .dotted-line {
    border-bottom: 1px dashed #000;
    min-width: 200px;
    display: inline-block;
    padding-bottom: 0.2rem;
  }

  .print-keterangan-box {
    font-size: 0.95rem;
    font-weight: bold;
  }

  .ket-bold {
    margin-bottom: 0.4rem;
  }

  .ket-list-custom {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }

  .ket-list-custom li {
    margin-bottom: 0.3rem;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

.print-only-section {
  display: none; /* Hidden on web, visible on PDF */
  margin-top: 3rem;
  color: #0f172a;
  font-family: 'Nunito', sans-serif;
}

.signatures {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.sig-box {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.sig-box p {
  margin: 0.3rem 0;
}

.sig-space {
  height: 80px;
}

.keterangan-box {
  font-size: 1.05rem;
  font-weight: 600;
}

.ket-title {
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.ket-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.ket-list li {
  margin-bottom: 0.3rem;
}

.detail-siswa-guru {
  font-family: 'Nunito', sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
  color: #0f172a;
}

/* Header & Info Section */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 2rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.8);
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.student-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
}

.info-icon {
  font-size: 1.4rem;
}

.text-blue { color: #3b82f6; }
.text-green { color: #10b981; }

.info-text {
  font-size: 0.95rem;
  color: #334155;
}

.header-right {
  display: flex;
  align-items: center;
}

.filter-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon-left {
  position: absolute;
  left: 1rem;
  color: #4f46e5;
  font-size: 1.2rem;
  pointer-events: none;
}

.select-icon-right {
  position: absolute;
  right: 1rem;
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
}

.btn-month-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #e0e7ff;
  border: 1px solid #c7d2fe;
  padding: 0.8rem 2.5rem 0.8rem 2.8rem;
  border-radius: 14px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: #4338ca;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  min-width: 200px;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1);
}

.btn-month-select:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(79, 70, 229, 0.15);
}

/* Table Styling */
.table-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 3rem;
  border: 1px solid #f1f5f9;
}

.table-responsive {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.report-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 800;
  padding: 1.5rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.report-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px dashed #e2e8f0;
}

.table-row:last-child td {
  border-bottom: none;
}

.report-table thead th {
  text-align: center;
  vertical-align: middle;
}

.report-table thead .sub-header th {
  vertical-align: bottom;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  border-top: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  line-height: 1.4;
}

.report-table thead .col-no { width: 5%; }
.report-table thead .col-kegiatan { width: 35%; text-align: left; font-size: 1.1rem; padding-left: 1.5rem; }
.report-table thead .col-penerapan { width: 60%; font-size: 1.1rem; padding-bottom: 0.5rem;}
.report-table thead .col-opsi { width: 15%; }

/* Row hover interaktif */
.table-row {
  transition: all 0.2s ease;
}

.table-row td.kegiatan-text {
  padding-left: 1.5rem;
}

.table-row:hover {
  background-color: #f0f9ff;
}

.text-center { text-align: center; }
.text-number { font-weight: 800; color: #94a3b8; font-size: 1.2rem; }

.kegiatan-label { 
  font-weight: 700; 
  color: #334155; 
  font-size: 1.1rem;
  background: #f8fafc;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.days-badge {
  font-size: 0.85rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  margin-left: 0.4rem;
  font-weight: 800;
}

.table-row:hover .kegiatan-label {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

/* Custom Radio Buttons yang Lembut */
.custom-radio {
  display: inline-block;
  position: relative;
  padding-left: 28px;
  cursor: not-allowed;
  user-select: none;
}

.custom-radio input {
  position: absolute;
  opacity: 0;
  cursor: not-allowed;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 24px;
  width: 24px;
  background-color: #f1f5f9;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pewarnaan Radio Khusus tiap Kategori untuk membedakan level */
.radio-sangat input:disabled:checked ~ .checkmark { background-color: #10b981; border-color: #10b981; opacity: 1; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); transform: translate(-50%, -50%) scale(1.1);}
.radio-terbiasa input:disabled:checked ~ .checkmark { background-color: #3b82f6; border-color: #3b82f6; opacity: 1; box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); transform: translate(-50%, -50%) scale(1.1);}
.radio-mulai input:disabled:checked ~ .checkmark { background-color: #f59e0b; border-color: #f59e0b; opacity: 1; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); transform: translate(-50%, -50%) scale(1.1);}
.radio-belum input:disabled:checked ~ .checkmark { background-color: #ef4444; border-color: #ef4444; opacity: 1; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); transform: translate(-50%, -50%) scale(1.1);}

.custom-radio input:checked ~ .checkmark:after {
  content: "";
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

/* Tindak Lanjut Guru Section */
.feedback-section {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.feedback-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 6px;
  background: linear-gradient(90deg, #4f46e5, #0ea5e9);
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.icon-box {
  background: #e0e7ff;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
}

.feedback-icon {
  font-size: 2rem;
  color: #4f46e5;
}

.feedback-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.2rem 0;
}

.feedback-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
}

.feedback-content {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px dashed #cbd5e1;
  transition: all 0.3s ease;
}

.feedback-content:focus-within {
  border-color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.feedback-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-family: 'Nunito', sans-serif;
  font-size: 1.1rem;
  color: #334155;
  resize: vertical;
  outline: none;
  line-height: 1.6;
}

.feedback-textarea::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #ffffff;
  color: #ef4444; /* red color for PDF to distinguish it */
  border: 1px solid #fecaca;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: #fef2f2;
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
}

.btn-icon {
  font-size: 1.4rem;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.5);
}

.btn-save:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  box-shadow: none;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsiveness */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
  }
  
  .header-right {
    width: 100%;
  }
  
  .filter-wrapper, .btn-month-select {
    width: 100%;
  }
  
  .report-table {
    min-width: 800px;
  }
  
  .report-table th, 
  .report-table td {
    padding: 1rem 0.5rem;
    font-size: 0.95rem;
  }
  
  .feedback-section {
    padding: 1.5rem;
  }
  
  .action-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-save, .btn-secondary {
    justify-content: center;
  }
}

/* Clickable Habit Label */
.kegiatan-label.clickable {
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
}

.kegiatan-label.clickable:hover {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
  transform: translateX(5px);
  box-shadow: 0 4px 10px rgba(67, 56, 202, 0.1);
}

.link-icon {
  font-size: 1.2rem;
  opacity: 0.8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 700px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon-box {
  background: #e0e7ff;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon {
  font-size: 1.8rem;
  color: #4f46e5;
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.modal-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #64748b;
  font-weight: 600;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
}

.btn-close:hover {
  color: #ef4444;
  background: #fee2e2;
}

.modal-body {
  padding: 1.5rem;
}

.table-scroll-container {
  max-height: 55vh;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* Kustomisasi scrollbar untuk tabel */
.table-scroll-container::-webkit-scrollbar {
  width: 8px;
}
.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}
.table-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}
.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  text-align: left;
  padding: 1rem;
  background: #f8fafc;
  font-weight: 800;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.history-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-weight: 500;
  vertical-align: middle;
}

.history-table tr:hover td {
  background-color: #f8fafc;
}

.history-table tr:last-child td {
  border-bottom: none;
}

.fw-bold { font-weight: 800; }
.text-slate-700 { color: #334155; }

.badge-status {
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.badge-status.success { background: #dcfce7; color: #166534; }
.badge-status.danger { background: #fee2e2; color: #991b1b; }

.log-note {
  margin: 0;
  line-height: 1.5;
}

.text-danger { color: #dc2626; font-style: italic; }

.btn-sm {
  margin-top: 0.5rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
}

.btn-sm:hover {
  background: #dbeafe;
}
</style>

<style>
@media print {
  /* Sembunyikan elemen bawaan dari Layout (Navbar, Sidebar, Footer, dll) */
  header, nav, aside, footer, .sidebar, .navbar, .topbar, .app-header, .layout-sidebar, .layout-topbar, .page-subtitle {
    display: none !important;
  }
  
  /* Pastikan kontainer utama memakan seluruh layar tanpa margin dari layout */
  main, .main-content, .page-wrapper, .layout-main, .layout-main-container {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
  }
}
/* Modal Override Settings */
.parent-note-alert {
  background: #f0fdfa;
  border-left: 4px solid #14b8a6;
  padding: 1rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.parent-note-alert .note-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #0f766e;
}
.parent-note-alert h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}
.parent-note-alert .note-icon {
  font-size: 1.3rem;
}
.parent-note-alert p {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
}
</style>
