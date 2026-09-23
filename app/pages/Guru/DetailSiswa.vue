<template>
  <div class="detail-siswa-guru">
    <!-- Header & Info Section -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="router.push('/Guru/Dashboard')" style="display: flex; align-items: center; gap: 8px; background: none; border: none; color: #64748b; font-weight: 700; cursor: pointer; padding: 0; margin-bottom: 12px; font-size: 0.9rem; transition: color 0.2s;" onmouseover="this.style.color='#1e293b'" onmouseout="this.style.color='#64748b'">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </button>
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
          <Icon name="ph:calendar-blank-duotone" class="select-icon" />
          <select class="btn-month-select" v-model="selectedMonth" @change="onFilterChange">
            <option v-for="(m, i) in monthsList" :key="i" :value="i">{{ m }}</option>
          </select>
          <select class="btn-month-select" v-model="selectedYear" @change="onFilterChange">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
          <Icon name="ph:caret-down-bold" class="select-icon" style="color: #64748b; font-size: 1rem; margin-left: 4px;" />
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
                <button class="kegiatan-label clickable" @click="openModal(item.nama)">
                  {{ item.nama }} <span class="days-badge">({{ item.daysCompleted }} Hari)</span> <Icon name="ph:arrow-square-out-bold" class="link-icon" />
                </button>
              </td>
              <td class="text-center">
                <Icon v-if="item.daysCompleted < 8" name="ph:check-circle-fill" class="status-icon text-red-500" />
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="text-center">
                <Icon v-if="item.daysCompleted >= 8 && item.daysCompleted <= 15" name="ph:check-circle-fill" class="status-icon text-yellow-500" />
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="text-center">
                <Icon v-if="item.daysCompleted >= 16 && item.daysCompleted <= 23" name="ph:check-circle-fill" class="status-icon text-blue-500" />
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="text-center">
                <Icon v-if="item.daysCompleted >= 24" name="ph:check-circle-fill" class="status-icon text-green-500" />
                <span v-else class="text-slate-300">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Catatan Orang Tua -->
    <div class="parent-notes-section" v-if="catatanOrangTuaList && catatanOrangTuaList.length > 0">
      <div class="feedback-header parent-header">
        <div class="icon-box parent-icon-box">
          <Icon name="ph:users-three-duotone" class="feedback-icon" />
        </div>
        <div>
          <h2 class="parent-title">Catatan Orang Tua Bulan Ini</h2>
          <p>Catatan atau observasi yang ditulis orang tua terkait kebiasaan anak.</p>
        </div>
      </div>
      <div class="notes-grid">
        <div class="note-card" v-for="(note, idx) in catatanOrangTuaList" :key="idx">
          <div class="note-badge">
            <Icon name="ph:bookmark-simple-duotone" /> {{ note.jenis_jurnal }}
          </div>
          <p class="note-text">{{ note.catatan }}</p>
        </div>
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
          placeholder="Tuliskan catatan pembinaan ananda di sini..."
          rows="5"
          v-model="catatanGuru"
        ></textarea>
      </div>
      
      <div class="action-footer">
        <button class="btn-secondary" @click="exportPDF">
          <Icon name="ph:file-pdf-duotone" class="btn-icon" />
          Cetak PDF
        </button>
        <button class="btn-save" @click="saveEvaluasi" :disabled="isSaving">
          <Icon :name="isSaving ? 'ph:spinner-gap-bold' : 'ph:floppy-disk-back-duotone'" class="btn-icon" :class="{ 'spin-icon': isSaving }" />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Evaluasi' }}
        </button>
      </div>
    </div>

    <!-- Template Khusus Print (Desain Custom Sesuai Request) -->
    <div class="print-template-container">
      <div class="print-border-box">
        
        <div class="print-top-header">
          <h1 class="print-title-text">KESIMPULAN</h1>
          <div class="print-mascot-placeholder">
            <!-- Icon pengganti jika tidak ada gambar boy-thinking -->
            <Icon name="ph:student-fill" class="print-mascot-icon" />
          </div>
        </div>

        <table class="print-custom-table">
          <thead>
            <tr>
              <th rowspan="2" class="w-no">No.</th>
              <th rowspan="2" class="w-kegiatan">Tujuh Kebiasaan<br>Anak Indonesia Hebat</th>
              <th colspan="4" class="w-penerapan">Penerapan</th>
            </tr>
            <tr class="sub-th">
              <th>Belum<br>Terbiasa</th>
              <th>Mulai<br>Terbiasa</th>
              <th>Terbiasa</th>
              <th>Sangat<br>Terbiasa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in kebiasaanData" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ item.nama }}</td>
              <td class="text-center check-mark">{{ getClassifiedLevel(item.daysCompleted) === 'belum' ? 'v' : '' }}</td>
              <td class="text-center check-mark">{{ getClassifiedLevel(item.daysCompleted) === 'mulai' ? 'v' : '' }}</td>
              <td class="text-center check-mark">{{ getClassifiedLevel(item.daysCompleted) === 'terbiasa' ? 'v' : '' }}</td>
              <td class="text-center check-mark">{{ getClassifiedLevel(item.daysCompleted) === 'sangat' ? 'v' : '' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="print-catatan-box" v-if="catatanGuru">
          <p class="ket-bold">Tindak Lanjut Guru :</p>
          <div class="catatan-text">{{ catatanGuru }}</div>
        </div>

        <div class="print-signatures-box">
          <div class="sig-left">
            <p>Mengetahui,</p>
            <p>Guru Wali</p>
            <div class="print-sig-space"></div>
            <p class="dotted-line">{{ studentData.waliKelas !== '-' ? studentData.waliKelas : '' }}</p>
            <p>NIP. {{ studentData.nipWali !== '-' ? studentData.nipWali : '........................................' }}</p>
          </div>
          <div class="sig-right">
            <p>Kota Magelang, {{ currentPrintDate }}</p>
            <p>Orangtua</p>
            <div class="print-sig-space"></div>
            <p class="dotted-line">{{ studentData.namaOrangTua !== '-' ? studentData.namaOrangTua : '' }}</p>
          </div>
        </div>

        <div class="print-keterangan-box">
          <p class="ket-bold">Keterangan :</p>
          <ul class="ket-list-custom">
            <li>• Beri tanda cek (v) sesuai pilihan</li>
            <li>• sangat terbiasa, jika anak melakukan kebiasaan 24-31 hari dalam sebulan</li>
            <li>• terbiasa, jika anak melakukan kebiasaan 16-23 hari dalam sebulan</li>
            <li>• mulai terbiasa, jika anak melakukan kebiasaan 8-15 hari dalam sebulan</li>
            <li>• belum terbiasa, jika anak melakukan kebiasaan di bawah 7 hari dalam sebulan</li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Modal Detail Riwayat Harian -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <div class="modal-icon-box">
              <Icon name="ph:calendar-check-duotone" class="modal-icon" />
            </div>
            <div>
              <h3 class="modal-title">Riwayat Harian</h3>
              <p class="modal-subtitle">{{ selectedHabit }} - {{ studentData.nama }}</p>
            </div>
          </div>
          <button class="btn-close" @click="closeModal">
            <Icon name="ph:x-bold" />
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="parentNote" class="parent-note-alert">
            <div class="note-header">
              <Icon name="ph:notebook-duotone" class="note-icon" />
              <h4>Catatan Orang Tua (Bulan Ini)</h4>
            </div>
            <p>{{ parentNote }}</p>
          </div>
          <!-- Grafik Tren Mingguan -->
          <div class="chart-container" style="height: 300px; width: 100%; margin-top: 10px; margin-bottom: 20px;">
            <ClientOnly>
              <Line v-if="!isModalLoading && chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
              <div v-else-if="isModalLoading" class="text-center p-4">Memuat grafik riwayat...</div>
            </ClientOnly>
          </div>

          <!-- Tabel Riwayat Harian (Dikembalikan agar detail bisa dibaca) -->
          <div class="table-scroll-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th width="20%">Tanggal</th>
                  <th width="20%">Status</th>
                  <th width="60%">Catatan Harian / Bukti</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isModalLoading">
                  <td colspan="3" class="text-center">Memuat riwayat...</td>
                </tr>
                <tr v-else v-for="day in modalLogs" :key="day.day">
                  <td class="fw-bold text-slate-700">{{ day.dateString }}</td>
                  <td>
                    <span v-if="day.isFuture" class="badge-status" style="background: #e2e8f0; color: #64748b;">
                      <Icon name="ph:clock" /> Belum
                    </span>
                    <span v-else-if="day.isComplete" class="badge-status success">
                      <Icon name="ph:check-circle-fill" /> Tuntas
                    </span>
                    <span v-else-if="day.hasLog" class="badge-status warning" style="background: #fef08a; color: #854d0e;">
                      <Icon name="ph:warning-circle-fill" /> Tidak Tuntas
                    </span>
                    <span v-else class="badge-status danger">
                      <Icon name="ph:warning-circle-fill" /> Kosong
                    </span>
                  </td>
                  <td>
                    <div v-if="day.hasLog" class="log-note-wrapper">
                      <p v-if="day.isComplete" class="log-note text-success fw-bold">Jurnal harian tuntas.</p>
                      <p v-else class="log-note text-warning fw-bold" style="color: #ca8a04;">Jurnal diisi namun belum tuntas.</p>
                      <p v-if="day.note" class="log-note" style="margin-top: 8px; font-weight: 600; color: #334155;">{{ day.note }}</p>
                    </div>
                    <div v-else-if="!day.isFuture" class="log-note-wrapper">
                      <p class="log-note text-danger">Orang tua tidak mengisi jurnal pada hari ini.</p>
                    </div>
                    <div v-else class="log-note-wrapper">
                      <p class="log-note" style="color: #94a3b8;">-</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Success Alert -->
    <div v-if="showSuccessModal" class="modal-overlay" style="z-index: 1000;" @click.self="showSuccessModal = false">
      <div class="modal-content" style="max-width: 400px; text-align: center; padding: 2rem;">
        <div style="background: #dcfce7; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
          <Icon name="ph:check-circle-fill" style="font-size: 3rem; color: #166534;" />
        </div>
        <h3 style="margin-bottom: 1rem; color: #0f172a; font-weight: 800; font-size: 1.5rem;">Berhasil Terkirim!</h3>
        <p style="color: #475569; margin-bottom: 2rem; line-height: 1.5;">Catatan tindak lanjut telah berhasil disimpan dan dikirimkan kepada orang tua.</p>
        <button class="btn-save" style="width: 100%; justify-content: center;" @click="showSuccessModal = false">Tutup</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, Filler, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, Filler, CategoryScale, LinearScale)

definePageMeta({
  layout: 'guru'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabase()

const currentPrintDate = computed(() => {
  const d = new Date()
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

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

onMounted(async () => {
  const studentId = route.query.id
  if (studentId) {
    const { data: s } = await supabase.from('peserta_didik').select('*, kelas(nama_kelas, wali_kelas_id), orang_tua(nama)').eq('id', studentId).single()
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
const isSaving = ref(false)
const showSuccessModal = ref(false)
const catatanOrangTuaList = ref([])

const saveEvaluasi = async () => {
  if (!catatanGuru.value.trim()) {
    alert('Catatan tidak boleh kosong')
    return
  }

  isSaving.value = true
  try {
    const studentId = route.query.id
    const startDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-01`
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
    const endDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${daysInMonth}`

    // Cari jurnal harian terbaru di bulan ini untuk menempelkan evaluasi (karena skema menautkan evaluasi ke jurnal harian)
    let { data: harianData, error: harianErr } = await supabase
      .from('jurnal_harian')
      .select('id')
      .eq('peserta_didik_id', studentId)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false })
      .limit(1)
    
    let targetHarianId = harianData && harianData.length > 0 ? harianData[0].id : null
    
    if (!targetHarianId) {
      // Jika murid belum pernah isi jurnal sama sekali bulan ini, buat satu entri harian kosong sebagai wadah evaluasi
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      const { data: newHarian, error: hError } = await supabase.from('jurnal_harian').insert({
        peserta_didik_id: studentId,
        tanggal: `${year}-${month}-${date}`
      }).select('id')
      if (hError) throw hError
      if (newHarian && newHarian.length > 0) targetHarianId = newHarian[0].id
    }

    if (targetHarianId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Pengguna tidak terautentikasi')
      
      const { data: guruData, error: gError } = await supabase.from('guru')
        .select('id, users!inner(email)')
        .eq('users.email', user.email)
      if (gError) throw gError
      
      if (guruData && guruData.length > 0) {
        if (currentEvaluasiId.value) {
          const { error: updErr } = await supabase.from('evaluasi_guru').update({ catatan_evaluasi: catatanGuru.value }).eq('id', currentEvaluasiId.value)
          if (updErr) throw updErr
        } else {
          const { data: newEv, error: insErr } = await supabase.from('evaluasi_guru').insert({
            jurnal_harian_id: targetHarianId,
            guru_id: guruData[0].id,
            catatan_evaluasi: catatanGuru.value
          }).select('id')
          if (insErr) throw insErr
          if (newEv && newEv.length > 0) currentEvaluasiId.value = newEv[0].id
        }
        showSuccessModal.value = true
      } else {
         throw new Error('Data guru tidak ditemukan untuk user ini. Pastikan Anda login sebagai guru.')
      }
    } else {
       throw new Error('Gagal mendapatkan atau membuat Jurnal Harian')
    }
  } catch (err) {
    console.error('Error saving evaluasi:', err)
    alert('Terjadi kesalahan saat menyimpan evaluasi: ' + (err.message || err.details || 'Silakan cek console.'))
  } finally {
    isSaving.value = false
  }
}

const exportPDF = () => {
  window.print();
}

const monthsList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const currentYear = new Date().getFullYear()
const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(currentYear)

const onFilterChange = () => {
  calculateSummary()
}

const calculateSummary = async () => {
  const studentId = route.query.id
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
             // Hanya dihitung "Terbiasa" jika tidur <= 22:00 malam
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

  // Fetch Catatan Bulanan Orang Tua
  const { data: catData } = await supabase.from('catatan_orang_tua')
    .select('jenis_jurnal, catatan')
    .eq('peserta_didik_id', studentId)
    .eq('bulan', selectedMonth.value + 1)
    .eq('tahun', selectedYear.value)
  
  if (catData) {
    catatanOrangTuaList.value = catData.filter(c => c.catatan && c.catatan.trim() !== '')
  } else {
    catatanOrangTuaList.value = []
  }
}

const showModal = ref(false)
const selectedHabit = ref('')
const isModalLoading = ref(false)
const modalLogs = ref([])
const parentNote = ref('')

const chartData = ref({ labels: [], datasets: [] })
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 7,
      ticks: {
        stepSize: 1
      },
      title: {
        display: true,
        text: 'Jumlah Hari Tuntas'
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `Tuntas: ${context.raw} Hari`
        }
      }
    }
  }
})

const openModal = async (habit) => {
  selectedHabit.value = habit
  showModal.value = true
  isModalLoading.value = true
  modalLogs.value = []

  const studentId = route.query.id
  if (studentId) {
    const today = new Date()
    const currentMonth = selectedMonth.value
    const currentYear = selectedYear.value
    
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${daysInMonth}`

    const { data } = await supabase
      .from('jurnal_harian')
      .select('*')
      .eq('peserta_didik_id', studentId)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)

    const logsMap = {}
    if (data) {
      data.forEach(log => {
        const d = new Date(log.tanggal).getDate()
        logsMap[d] = log
      })
    }

    const harianIds = (data || []).map(h => h.id)
    let completedHarianIds = new Map()
    let interactedHarianIds = new Set()

    if (harianIds.length > 0) {
      if (habit === 'Beribadah') {
        const { data: ibadahLogs } = await supabase.from('jurnal_ibadah').select('jurnal_harian_id, status, ibadah(nama_ibadah)').in('jurnal_harian_id', harianIds)
        if (ibadahLogs) {
          const isIslam = !studentData.value?.agama || studentData.value.agama.toLowerCase().trim() === 'islam'
          const requiredPrayers = isIslam ? ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] : ['doa pagi', 'membaca alkitab', 'doa malam']
          
          const grouped = ibadahLogs.reduce((acc, curr) => {
            acc[curr.jurnal_harian_id] = acc[curr.jurnal_harian_id] || []
            interactedHarianIds.add(curr.jurnal_harian_id)
            if (curr.status) {
              acc[curr.jurnal_harian_id].push(curr.ibadah?.nama_ibadah?.toLowerCase() || '')
            }
            return acc
          }, {})

          for (const [hId, donePrayers] of Object.entries(grouped)) {
            const missing = requiredPrayers.filter(p => {
               const cleanP = p.replace(/[^a-z]/g, '')
               return !donePrayers.some(dp => {
                  const cleanDp = dp.replace(/[^a-z]/g, '')
                  return cleanDp.includes(cleanP) || cleanP.includes(cleanDp)
               })
            })
            if (missing.length === 0) {
              completedHarianIds.set(hId, { isComplete: true, note: 'Lengkap (Seluruh Ibadah Terlaksana)' })
            } else {
              completedHarianIds.set(hId, { isComplete: false, note: `Belum Tuntas. Kurang: ${missing.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}` })
            }
          }
        }
      } else {
        const { data: masterKebiasaan } = await supabase.from('kebiasaan').select('id, nama_kebiasaan')
        const masterK = masterKebiasaan?.find(mk => mk.nama_kebiasaan.toLowerCase().includes(habit.split(' ')[0].toLowerCase()))
        if (masterK) {
           const { data: kLogs } = await supabase.from('jurnal_kebiasaan').select('jurnal_harian_id, keterangan, status').in('jurnal_harian_id', harianIds).eq('kebiasaan_id', masterK.id)
           if (kLogs) {
             kLogs.forEach(l => {
               interactedHarianIds.add(l.jurnal_harian_id)
               if (!l.status && habit !== 'Makan sehat & Bergizi') return
               
               if (habit === 'Berolahraga' || habit === 'Gemar Belajar') {
                 let text = ''
                 try {
                   const parsed = JSON.parse(l.keterangan)
                   text = parsed.materi || parsed.keterangan || l.keterangan
                 } catch(e) {
                   text = l.keterangan
                 }
                 const match = text.match(/\((\d+)\s*Menit\)/i)
                 if (!match || parseInt(match[1]) < 30) {
                   return // skip adding to completed if less than 30 mins
                 }
               }
               
               if (habit === 'Makan sehat & Bergizi') {
                 let isComplete = false
                 let note = ''
                 try {
                   const parsed = JSON.parse(l.keterangan)
                   const missing = []
                   if (!parsed.nasi || parsed.nasi === 'Tidak Konsumsi') missing.push('Karbohidrat')
                   if (!parsed.lauk || parsed.lauk === 'Tidak Konsumsi') missing.push('Lauk Pauk')
                   if (!parsed.sayur || parsed.sayur === 'Tidak Konsumsi') missing.push('Sayur')
                   if (!parsed.buah || parsed.buah === 'Tidak Konsumsi') missing.push('Buah')
                   
                   isComplete = missing.length === 0
                   note = isComplete ? 'Lengkap (Nasi, Lauk, Sayur, Buah)' : `Tidak makan: ${missing.join(', ')}`
                 } catch(e) {
                   note = l.keterangan
                 }
                 completedHarianIds.set(l.jurnal_harian_id, { isComplete, note })
                 return
               }
               
               completedHarianIds.set(l.jurnal_harian_id, l.keterangan)
             })
           }
        }
      }
    }

    const generatedDays = []
    
    parentNote.value = ''
    try {
      const { data: noteData } = await supabase.from('catatan_orang_tua')
        .select('catatan')
        .eq('peserta_didik_id', studentId)
        .eq('jenis_jurnal', habit)
        .eq('bulan', currentMonth + 1)
        .eq('tahun', currentYear)
        .maybeSingle()
      if (noteData && noteData.catatan) parentNote.value = noteData.catatan
    } catch (e) {
      console.error(e)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      // Cek apakah jurnal_harian untuk hari ini memiliki record status = true untuk kebiasaan spesifik ini
      const harianId = logsMap[i]?.id
      let hasLog = harianId ? interactedHarianIds.has(harianId) : false
      let isComplete = false
      let note = ''
      let fotoUrl = null
      
      if (hasLog) {
        if (completedHarianIds.has(harianId)) {
          const rawData = completedHarianIds.get(harianId)
          if (typeof rawData === 'object' && rawData !== null && rawData.isComplete !== undefined) {
            isComplete = rawData.isComplete
            note = rawData.note
          } else {
            isComplete = true
            if (rawData) {
              try {
                const parsed = JSON.parse(rawData)
                fotoUrl = parsed.foto_url || null
                
                if (habit === 'Gemar Belajar') {
                   note = `${parsed.materi || ''} - ${parsed.informasi || ''}`
                } else {
                   note = parsed.keterangan || rawData
                }
              } catch(e) {
                note = rawData
              }
            }
          }
        } else {
          isComplete = false
          if (habit === 'Beribadah') note = 'Belum Tuntas. Tidak ada data / ibadah yang dikerjakan.'
          else if (habit === 'Makan sehat & Bergizi') note = 'Belum Tuntas. Tidak ada data komponen makanan.'
          else note = 'Catatan tidak memenuhi syarat tuntas (misal: durasi kurang).'
        }
      }

      // Tentukan apakah hari ini di masa depan
      const isFuture = (currentYear > today.getFullYear()) || 
                       (currentYear === today.getFullYear() && currentMonth > today.getMonth()) ||
                       (currentYear === today.getFullYear() && currentMonth === today.getMonth() && i > today.getDate())

      generatedDays.push({
        day: i,
        dateString: `${i} ${monthsList[currentMonth]} ${currentYear}`,
        hasLog,
        isComplete,
        logData: logsMap[i] || null,
        isFuture,
        note,
        fotoUrl
      })
    }
    
    // Untuk tabel riwayat harian tetap menggunakan modalLogs (semua hari)
    modalLogs.value = generatedDays

    // Agregasi mingguan untuk grafik Line
    const weeklyData = [0, 0, 0, 0] // M1, M2, M3, M4
    generatedDays.forEach(d => {
      if (d.isComplete) {
        if (d.day <= 7) weeklyData[0]++
        else if (d.day <= 14) weeklyData[1]++
        else if (d.day <= 21) weeklyData[2]++
        else weeklyData[3]++
      }
    })

    // Siapkan data untuk grafik
    chartData.value = {
      labels: ['Minggu 1 (Tgl 1-7)', 'Minggu 2 (Tgl 8-14)', 'Minggu 3 (Tgl 15-21)', 'Minggu 4 (Tgl 22+)'],
      datasets: [
        {
          label: 'Jumlah Tuntas',
          data: weeklyData,
          borderColor: '#2563eb', // blue
          backgroundColor: 'rgba(37, 99, 235, 0.2)', // light blue fill
          borderWidth: 3,
          pointBackgroundColor: '#2563eb',
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4 // Curved line
        }
      ]
    }
  }
  
  isModalLoading.value = false
}

const closeModal = () => {
  showModal.value = false
}

// Implementasi Logika Rule-Based Classification untuk Print Template
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

.status-icon {
  font-size: 1.3rem;
}
.text-red-500 { color: #ef4444; }
.text-yellow-500 { color: #f59e0b; }
.text-blue-500 { color: #3b82f6; }
.text-green-500 { color: #10b981; }
.text-slate-300 { color: #cbd5e1; font-weight: 500; font-size: 1.2rem; }

.print-template-container {
  display: none;
}

@media print {
  /* Sembunyikan elemen web utama */
  .page-header, .table-card, .feedback-section, .parent-notes-section, .modal-overlay {
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
    min-height: 100vh;
    height: auto;
    padding: 0.8cm;
    box-sizing: border-box;
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Nunito', sans-serif;
  }

  .print-border-box {
    border: 12px solid #e1f5fe;
    border-radius: 20px;
    min-height: calc(100vh - 1.6cm);
    height: auto;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
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
    page-break-inside: avoid;
    break-inside: avoid;
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
    page-break-inside: avoid;
    break-inside: avoid;
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
  display: flex;
  align-items: center;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  gap: 0.2rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-wrapper:hover {
  background-color: #e2e8f0;
}

.select-icon {
  color: #4f46e5;
  font-size: 1.2rem;
}

.btn-month-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: #334155;
  cursor: pointer;
  outline: none;
  padding: 0 0.2rem;
}

.btn-month-select:hover {
  color: #4f46e5;
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
  background-color: transparent;
  color: #475569;
  font-weight: 800;
  padding: 1.2rem 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.report-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f1f5f9;
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
  background: transparent;
  padding: 0.2rem 0;
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
  color: #3b82f6;
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
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
}

/* Parent Notes Section */
.parent-notes-section {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.parent-header {
  border-bottom: none;
  margin-bottom: 1.5rem;
  padding-bottom: 0;
}

.parent-icon-box {
  background: #e0f2fe;
  color: #0284c7;
}

.parent-title {
  color: #0369a1;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  border-color: #cbd5e1;
}

.note-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #dbeafe;
  color: #1e40af;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.note-text {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

body.dark-theme .parent-notes-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.5);
}

body.dark-theme .parent-icon-box {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

body.dark-theme .parent-title {
  color: #38bdf8;
}

body.dark-theme .note-card {
  background: #0f172a;
  border-color: #334155;
}

body.dark-theme .note-badge {
  background: rgba(30, 64, 175, 0.3);
  color: #93c5fd;
}

body.dark-theme .note-text {
  color: #cbd5e1;
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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
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
  overflow-y: auto;
  flex-grow: 1;
}

.table-scroll-container {
  overflow: hidden;
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

/* --- Dark Mode Styles --- */
body.dark-theme .detail-siswa-guru {
  color: #f1f5f9;
}

body.dark-theme .page-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

body.dark-theme .page-title {
  background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.dark-theme .page-subtitle {
  color: #94a3b8;
}

body.dark-theme .info-badge {
  background: #334155;
  border-color: #475569;
}

body.dark-theme .info-text {
  color: #e2e8f0;
}

body.dark-theme .btn-month-select {
  background-color: #1e293b;
  border-color: #334155;
  color: #818cf8;
}

body.dark-theme .table-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.5);
}

body.dark-theme .report-table th {
  background-color: #0f172a;
  color: #e2e8f0;
  border-bottom-color: #334155;
}

body.dark-theme .report-table td {
  border-bottom-color: #334155;
}

body.dark-theme .table-row:hover {
  background-color: #0f172a;
}

body.dark-theme .kegiatan-label {
  background: #0f172a;
  color: #e2e8f0;
}

body.dark-theme .kegiatan-label.clickable:hover {
  background: #334155;
  color: #818cf8;
  border-color: #475569;
}

body.dark-theme .days-badge {
  background: #1e293b;
  color: #60a5fa;
}

body.dark-theme .custom-radio .checkmark {
  background-color: #334155;
  border-color: #475569;
}

body.dark-theme .feedback-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.5);
}

body.dark-theme .feedback-header h2 {
  color: #f1f5f9;
}

body.dark-theme .icon-box {
  background: #334155;
  box-shadow: none;
}

body.dark-theme .feedback-icon {
  color: #818cf8;
}

body.dark-theme .feedback-content {
  background: #0f172a;
  border-color: #475569;
}

body.dark-theme .feedback-content:focus-within {
  border-color: #818cf8;
  background: #1e293b;
}

body.dark-theme .feedback-textarea {
  color: #f1f5f9;
}

body.dark-theme .feedback-textarea::placeholder {
  color: #64748b;
}

body.dark-theme .btn-secondary {
  background: #1e293b;
  border-color: #7f1d1d;
  color: #f87171;
}

body.dark-theme .btn-secondary:hover {
  background: #450a0a;
}

body.dark-theme .modal-content {
  background: #1e293b;
}

body.dark-theme .modal-header {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-bottom-color: #334155;
}

body.dark-theme .modal-title {
  color: #f1f5f9;
}

body.dark-theme .modal-subtitle {
  color: #94a3b8;
}

body.dark-theme .modal-icon-box {
  background: #334155;
}

body.dark-theme .modal-icon {
  color: #818cf8;
}

body.dark-theme .table-scroll-container {
  border-color: #334155;
}

body.dark-theme .table-scroll-container::-webkit-scrollbar-track {
  background: #0f172a;
}

body.dark-theme .table-scroll-container::-webkit-scrollbar-thumb {
  background: #475569;
}

body.dark-theme .history-table th {
  background: #0f172a;
  color: #e2e8f0;
  border-bottom-color: #334155;
}

body.dark-theme .history-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

body.dark-theme .history-table tr:hover td {
  background-color: #0f172a;
}

body.dark-theme .text-slate-700 {
  color: #e2e8f0;
}

body.dark-theme .parent-note-alert {
  background: #134e4a;
  border-left-color: #2dd4bf;
}

body.dark-theme .parent-note-alert h4 {
  color: #5eead4;
}

body.dark-theme .parent-note-alert p {
  color: #ccfbf1;
}

body.dark-theme .parent-note-alert .note-header {
  color: #5eead4;
}

/* Print Catatan Guru */
.print-catatan-box {
  display: none;
}
@media print {
  .print-catatan-box {
    display: block;
    margin-bottom: 20px;
    border: 1px dashed #94a3b8;
    padding: 10px;
    border-radius: 8px;
    background: #f8fafc;
  }
  .print-catatan-box .ket-bold {
    font-weight: 800;
    margin-bottom: 8px;
    font-size: 14px;
    color: #1e293b;
  }
  .print-catatan-box .catatan-text {
    white-space: pre-line;
    line-height: 1.5;
    font-size: 14px;
    color: #334155;
  }
}
</style>
