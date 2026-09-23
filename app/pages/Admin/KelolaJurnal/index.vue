<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/Admin/Dashboard" class="btn-back" v-if="!selectedClass">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </NuxtLink>
        <button class="btn-back" @click="selectedClass = null" v-else>
          <Icon name="ph:arrow-left-bold" /> Kembali ke Daftar Kelas
        </button>
        <div>
          <h1 class="page-title">{{ selectedClass ? `Jurnal ${selectedClass.name}` : 'Kelola Jurnal' }}</h1>
          <p class="page-subtitle">{{ selectedClass ? `Wali Kelas: ${selectedClass.waliKelas}` : 'Pantau aktivitas pengisian jurnal siswa per kelas' }}</p>
        </div>
      </div>
      <button class="btn-primary" @click="eksporData">
        <Icon name="ph:export-bold" /> Ekspor Data
      </button>
    </div>

    <div class="content-card">
      <!-- VIEW 1: DAFTAR KELAS -->
      <div v-if="!selectedClass">
        <div class="table-toolbar mb-4">
          <div class="search-box">
            <Icon name="ph:magnifying-glass" class="search-icon" />
            <input type="text" placeholder="Cari kelas..." class="search-input" v-model="searchClass" />
          </div>
        </div>

        <div class="class-grid">
          <div class="class-card" v-for="cls in filteredClasses" :key="cls.id" @click="pilihKelas(cls)">
            <div class="class-card-header">
              <div class="class-icon"><Icon name="ph:users-three-duotone" /></div>
              <h3>{{ cls.name }}</h3>
            </div>
            <div class="class-card-body">
              <p><strong>Wali Kelas:</strong> {{ cls.waliKelas }}</p>
              <p><strong>Jumlah Siswa:</strong> {{ cls.totalSiswa }} Siswa</p>
            </div>
            <div class="class-card-footer">
              <span class="view-text">Lihat Jurnal Siswa <Icon name="ph:arrow-right-bold" /></span>
            </div>
          </div>
          <div v-if="filteredClasses.length === 0" class="text-center py-8 text-gray" style="grid-column: 1 / -1;">
            Tidak ada kelas yang ditemukan.
          </div>
        </div>
      </div>

      <!-- VIEW 2: DAFTAR SISWA DALAM KELAS -->
      <div v-else>
        <div class="table-toolbar mb-4">
          <div class="search-box">
            <Icon name="ph:magnifying-glass" class="search-icon" />
            <input type="text" placeholder="Cari nama siswa..." class="search-input" v-model="searchStudent" />
          </div>
          <div class="filter-group">
            <select class="modern-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Lengkap">Lengkap</option>
              <option value="Belum Lengkap">Belum Lengkap</option>
              <option value="Belum Mengisi">Belum Mengisi</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Status Hari Ini</th>
                <th>Progress (7 Habits)</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="siswa in filteredStudents" :key="siswa.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar-small">{{ siswa.name.charAt(0) }}</div>
                    <strong>{{ siswa.name }}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="getStatusClass(siswa.status)">
                    {{ siswa.status }}
                  </span>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-bar" :style="{ width: (siswa.submitted / siswa.totalJurnal * 100) + '%' }" :class="getProgressColor(siswa.status)"></div>
                  </div>
                  <span class="progress-text">{{ siswa.submitted }} dari {{ siswa.totalJurnal }} aktivitas terisi</span>
                </td>
                <td class="text-right">
                  <button class="btn-detail" @click="lihatDetailSiswa(siswa)">Lihat Detail</button>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="4" class="text-center py-8 text-gray">Tidak ada data siswa yang sesuai.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Export Data -->
    <div v-if="showExportModal" class="modal-overlay">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>Ekspor Data Jurnal</h2>
          <button class="btn-close" @click="showExportModal = false"><Icon name="ph:x-bold" /></button>
        </div>
        <div class="modal-body text-center">
          <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"><Icon name="ph:file-xls-duotone" /></div>
          <p style="font-size: 1.1rem; color: #475569;">Apakah Anda ingin mengunduh data jurnal {{ selectedClass ? selectedClass.name : 'Semua Kelas' }} dalam format Excel?</p>
        </div>
        <div class="modal-actions" style="justify-content: center;">
          <button class="btn-secondary" @click="showExportModal = false">Batal</button>
          <button class="btn-primary" @click="prosesEkspor">Unduh Excel</button>
        </div>
      </div>
    </div>

    <!-- Modal Detail Jurnal Siswa -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detail Jurnal: {{ selectedStudent?.name }}</h2>
          <button class="btn-close" @click="showDetailModal = false"><Icon name="ph:x-bold" /></button>
        </div>
        <div class="modal-body">
          <div class="student-info-card mb-4">
            <p><strong>Kelas:</strong> {{ selectedClass?.name }}</p>
            <p><strong>Tanggal:</strong> {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            <p style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
              <strong>Status:</strong> 
              <span class="badge" :class="getStatusClass(selectedStudent?.status)">{{ selectedStudent?.status }}</span>
            </p>
          </div>
          
          <h3 class="section-title">Pencapaian 7 Habits Hari Ini</h3>
          <div class="jurnal-items-grid">
            <div class="jurnal-item" v-for="(item, index) in selectedStudentDetail" :key="index">
              <div class="jurnal-item-icon" :class="item.filled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'">
                <Icon :name="item.icon" />
              </div>
              <div class="jurnal-item-content">
                <h4>{{ item.title }}</h4>
                <p v-if="item.filled" class="text-green-600 text-sm font-bold"><Icon name="ph:check-circle-fill" /> Sudah diisi ({{ item.time }})</p>
                <p v-else class="text-red-500 text-sm"><Icon name="ph:x-circle-fill" /> Belum diisi</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" style="width: 100%; justify-content: center;" @click="showDetailModal = false">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastState.show" class="toast-notification" :class="toastState.type">
      <Icon :name="toastState.type === 'error' ? 'ph:warning-circle-fill' : 'ph:check-circle-fill'" class="toast-icon" />
      <span>{{ toastState.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const supabase = useSupabase()

// UI States
const searchClass = ref('')
const searchStudent = ref('')
const filterStatus = ref('')
const selectedClass = ref(null)
const selectedStudent = ref(null)
const showDetailModal = ref(false)
const showExportModal = ref(false)
const selectedStudentDetail = ref([])

// Toast State
const toastState = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toastState.value = { show: true, message, type }
  setTimeout(() => {
    toastState.value.show = false
  }, 3000)
}

// Fetch data from database
const classes = ref([])
const studentsInSelectedClass = ref([])
const masterKebiasaanList = ref([])

onMounted(async () => {
  // Fetch master kebiasaan
  const { data: kebData } = await supabase.from('kebiasaan').select('id, nama_kebiasaan')
  if (kebData) masterKebiasaanList.value = kebData

  // Fetch data guru untuk memetakan nama wali kelas
  const { data: guruData } = await supabase.from('guru').select('id, nama')
  const guruMap = {}
  if (guruData) {
    guruData.forEach(g => {
      guruMap[g.id] = g.nama
    })
  }

  // Fetch jumlah siswa per kelas
  const { data: countData } = await supabase.from('peserta_didik').select('kelas_id')
  const counts = (countData || []).reduce((acc, curr) => {
    if (curr.kelas_id) acc[curr.kelas_id] = (acc[curr.kelas_id] || 0) + 1
    return acc
  }, {})

  const { data } = await supabase.from('kelas').select('*')
  if (data) {
    classes.value = data.map(c => ({
      id: c.id,
      name: c.nama_kelas,
      waliKelas: guruMap[c.wali_kelas_id] || '-',
      totalSiswa: counts[c.id] || 0
    }))
  }
})

// Computed Data
const filteredClasses = computed(() => {
  return classes.value.filter(c => c.name.toLowerCase().includes(searchClass.value.toLowerCase()))
})

const filteredStudents = computed(() => {
  if (!selectedClass.value) return []
  let list = studentsInSelectedClass.value
  
  
  if (filterStatus.value) {
    list = list.filter(s => s.status === filterStatus.value)
  }
  if (searchStudent.value) {
    list = list.filter(s => s.name.toLowerCase().includes(searchStudent.value.toLowerCase()))
  }
  
  return list
})

// Methods
const getStatusClass = (status) => {
  if (status === 'Lengkap') return 'badge-green'
  if (status === 'Belum Lengkap') return 'badge-yellow'
  return 'badge-red'
}

const getProgressColor = (status) => {
  if (status === 'Lengkap') return 'bg-green'
  if (status === 'Belum Lengkap') return 'bg-yellow'
  return 'bg-red'
}

const pilihKelas = async (cls) => {
  selectedClass.value = cls
  searchStudent.value = ''
  filterStatus.value = ''
  
  const d = new Date()
  const todayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  
  // Fetch students for this class
  const { data: students } = await supabase.from('peserta_didik').select('id, nama').eq('kelas_id', cls.id)
  
  if (students && students.length > 0) {
    const studentIds = students.map(s => s.id)
    
    // Fetch jurnal harian untuk HARI INI
    const { data: harianData } = await supabase.from('jurnal_harian').select('id, peserta_didik_id').in('peserta_didik_id', studentIds).eq('tanggal', todayDate)
    
    const harianMap = {} // peserta_didik_id -> harian_id
    if (harianData) {
      harianData.forEach(h => {
        harianMap[h.peserta_didik_id] = h.id
      })
    }
    
    const harianIds = harianData ? harianData.map(h => h.id) : []
    
    // Fetch detail ibadah dan kebiasaan hari ini
    let ibadahMap = {} // harian_id -> boolean
    let kebiasaanMap = {} // harian_id -> array of kebiasaan_id
    
    if (harianIds.length > 0) {
      const { data: ibadahData } = await supabase.from('jurnal_ibadah').select('jurnal_harian_id, status').in('jurnal_harian_id', harianIds)
      if (ibadahData) {
        ibadahData.forEach(i => {
          if (i.status) ibadahMap[i.jurnal_harian_id] = true
        })
      }
      
      const { data: kebData } = await supabase.from('jurnal_kebiasaan').select('jurnal_harian_id, kebiasaan_id, status').in('jurnal_harian_id', harianIds)
      if (kebData) {
        kebData.forEach(k => {
          if (k.status) {
            if (!kebiasaanMap[k.jurnal_harian_id]) kebiasaanMap[k.jurnal_harian_id] = []
            kebiasaanMap[k.jurnal_harian_id].push(k.kebiasaan_id)
          }
        })
      }
    }

    studentsInSelectedClass.value = students.map(s => {
      const hId = harianMap[s.id]
      let submittedCount = 0
      
      if (hId) {
        if (ibadahMap[hId]) submittedCount++
        if (kebiasaanMap[hId]) submittedCount += kebiasaanMap[hId].length
      }
      
      let statusStr = 'Kosong'
      if (submittedCount === 7) statusStr = 'Lengkap'
      else if (submittedCount > 0) statusStr = 'Belum Lengkap'
      
      return {
        id: s.id,
        name: s.nama,
        status: statusStr,
        submitted: submittedCount,
        harianId: hId,
        hasIbadah: !!ibadahMap[hId],
        filledKebiasaanIds: kebiasaanMap[hId] || []
      }
    })
  } else {
    studentsInSelectedClass.value = []
  }
}

const lihatDetailSiswa = (siswa) => {
  selectedStudent.value = siswa
  
  const habits = []
  
  // 1. Bangun Pagi
  const bpId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('bangun'))?.id
  const bpFilled = siswa.filledKebiasaanIds.includes(bpId)
  habits.push({ title: 'Bangun Pagi', icon: 'ph:sun-horizon-duotone', filled: bpFilled, time: bpFilled ? 'Hari Ini' : '' })
  
  // 2. Beribadah
  habits.push({ title: 'Beribadah', icon: 'ph:hands-praying-duotone', filled: siswa.hasIbadah, time: siswa.hasIbadah ? 'Hari Ini' : '' })
  
  // 3. Olahraga
  const orId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('olahraga'))?.id
  const orFilled = siswa.filledKebiasaanIds.includes(orId)
  habits.push({ title: 'Berolahraga', icon: 'ph:sneaker-duotone', filled: orFilled, time: orFilled ? 'Hari Ini' : '' })
  
  // 4. Makan
  const mkId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('makan'))?.id
  const mkFilled = siswa.filledKebiasaanIds.includes(mkId)
  habits.push({ title: 'Makan sehat & Bergizi', icon: 'ph:fork-knife-duotone', filled: mkFilled, time: mkFilled ? 'Hari Ini' : '' })
  
  // 5. Belajar
  const blId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('belajar'))?.id
  const blFilled = siswa.filledKebiasaanIds.includes(blId)
  habits.push({ title: 'Gemar Belajar', icon: 'ph:book-open-duotone', filled: blFilled, time: blFilled ? 'Hari Ini' : '' })
  
  // 6. Bermasyarakat
  const bmId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('masyarakat'))?.id
  const bmFilled = siswa.filledKebiasaanIds.includes(bmId)
  habits.push({ title: 'Bermasyarakat', icon: 'ph:users-three-duotone', filled: bmFilled, time: bmFilled ? 'Hari Ini' : '' })
  
  // 7. Tidur
  const tdId = masterKebiasaanList.value.find(k => k.nama_kebiasaan.toLowerCase().includes('tidur'))?.id
  const tdFilled = siswa.filledKebiasaanIds.includes(tdId)
  habits.push({ title: 'Tidur tepat waktu', icon: 'ph:moon-stars-duotone', filled: tdFilled, time: tdFilled ? 'Hari Ini' : '' })
  
  selectedStudentDetail.value = habits
  showDetailModal.value = true
}

const eksporData = () => {
  showExportModal.value = true
}

const prosesEkspor = () => {
  showExportModal.value = false
  showToast('Berhasil! Data jurnal sedang diunduh.')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

.admin-page { font-family: 'Nunito', sans-serif; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
.btn-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; color: #64748b; font-weight: 700; cursor: pointer; padding: 0; font-size: 0.9rem; transition: color 0.2s; text-decoration: none; }
.btn-back:hover { color: #1e293b; }
.page-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
.page-subtitle { color: #64748b; margin: 0.2rem 0 0 0; font-size: 1.05rem; }

.btn-primary { background: #8b5cf6; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: #7c3aed; }

.content-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1.5rem; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.search-box { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.6rem 1rem; width: 300px; transition: all 0.3s; }
.search-box:focus-within { border-color: #8b5cf6; background: white; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1); }
.search-icon { color: #94a3b8; font-size: 1.2rem; margin-right: 0.5rem; }
.search-input { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; color: #334155; }
.filter-group { display: flex; gap: 0.8rem; }
.modern-select { padding: 0.7rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-weight: 600; font-family: inherit; outline: none; cursor: pointer; }

/* Grid Kelas */
.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.class-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.class-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); transform: translateY(-3px); }
.class-card-header { display: flex; align-items: center; gap: 1rem; }
.class-card-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.class-icon { width: 48px; height: 48px; border-radius: 12px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.class-card-body p { margin: 0.2rem 0; color: #475569; font-size: 0.95rem; }
.class-card-footer { margin-top: auto; padding-top: 1rem; border-top: 1px dashed #e2e8f0; display: flex; justify-content: flex-end; }
.view-text { color: #3b82f6; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }

/* Table Siswa */
.table-responsive { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { background: transparent; color: #64748b; font-weight: 700; font-size: 0.95rem; padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.modern-table td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tr:hover td { background: #f8fafc; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-gray { color: #64748b; font-weight: 600; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.mb-4 { margin-bottom: 1rem; }

.user-cell { display: flex; align-items: center; gap: 1rem; }
.avatar-small { width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.user-cell strong { font-size: 1.05rem; color: #0f172a; }

.progress-container { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; margin-bottom: 0.4rem; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
.progress-text { font-size: 0.8rem; color: #64748b; font-weight: 600; }
.bg-green { background: #10b981; }
.bg-yellow { background: #f59e0b; }
.bg-red { background: #ef4444; }

.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 800; display: inline-block; }
.badge-green { background: #ecfdf5; color: #059669; }
.badge-yellow { background: #fffbeb; color: #d97706; }
.badge-red { background: #fee2e2; color: #ef4444; }

.btn-detail { background: white; border: 2px solid #e2e8f0; color: #475569; font-weight: 700; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-detail:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { background: white; border-radius: 20px; width: 100%; max-width: 550px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; max-height: 90vh; }
.modal-sm { max-width: 400px; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; }
.btn-close:hover { background: #f1f5f9; color: #0f172a; }
.modal-body { padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; }
.modal-actions { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-secondary { padding: 0.75rem 1.5rem; border-radius: 10px; background: white; border: 1px solid #cbd5e1; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-secondary:hover { background: #f8fafc; color: #0f172a; }

/* Detail Siswa Modal Specifics */
.student-info-card { background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.student-info-card p { margin: 0.3rem 0; color: #334155; font-size: 0.95rem; }

.section-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #f1f5f9; }

.jurnal-items-grid { display: flex; flex-direction: column; gap: 0.8rem; }
.jurnal-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; transition: all 0.2s; }
.jurnal-item:hover { border-color: #cbd5e1; background: #f8fafc; }
.jurnal-item-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.jurnal-item-content h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
.jurnal-item-content p { margin: 0.2rem 0 0 0; display: flex; align-items: center; gap: 0.3rem; }

.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: 700; }
.bg-green-100 { background-color: #d1fae5; }
.text-green-600 { color: #059669; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-500 { color: #ef4444; }

/* Toast Notification */
.toast-notification { position: fixed; top: 1.5rem; right: 1.5rem; background: white; border-radius: 12px; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); font-weight: 700; color: #0f172a; z-index: 2000; animation: slideIn 0.3s ease-out; }
.toast-notification.success { border-left: 4px solid #10b981; }
.toast-notification.error { border-left: 4px solid #ef4444; }
.toast-notification .toast-icon { font-size: 1.5rem; }
.toast-notification.success .toast-icon { color: #10b981; }
.toast-notification.error .toast-icon { color: #ef4444; }

@keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }

@media (max-width: 768px) { .page-header, .table-toolbar { flex-direction: column; align-items: stretch; } .search-box { width: 100%; } }
</style>
