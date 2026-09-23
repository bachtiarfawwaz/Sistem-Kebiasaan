<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/Admin/Dashboard" class="btn-back">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </NuxtLink>
        <div>
          <h1 class="page-title">Kelola Kelas</h1>
          <p class="page-subtitle">Manajemen daftar kelas dan rombongan belajar</p>
        </div>
      </div>
      <button class="btn-primary" @click="tambahKelas">
        <Icon name="ph:plus-bold" /> Tambah Kelas
      </button>
    </div>

    <div class="content-card">
      <div class="table-toolbar">
        <div class="search-box">
          <Icon name="ph:magnifying-glass" class="search-icon" />
          <input type="text" placeholder="Cari nama kelas..." class="search-input" v-model="searchQuery" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Nama Kelas</th>
              <th>Wali Kelas</th>
              <th>Jumlah Siswa</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(kelas, index) in filteredKelas" :key="index">
              <td>
                <div class="kelas-cell">
                  <div class="kelas-icon"><Icon name="ph:chalkboard-teacher-duotone" /></div>
                  <strong>{{ kelas.nama }}</strong>
                </div>
              </td>
              <td class="text-gray">{{ kelas.waliKelas }}</td>
              <td>
                <span class="badge badge-blue">{{ kelas.jumlah_siswa || 0 }} Siswa</span>
              </td>
              <td>
                <span class="status-badge" :class="kelas.aktif ? 'active' : 'inactive'">
                  <span class="dot"></span> {{ kelas.aktif ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="editKelas(kelas)"><Icon name="ph:pencil-simple" /></button>
                  <button class="btn-icon danger" title="Hapus" @click="hapusKelas(kelas)"><Icon name="ph:trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Kelas -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru' }}</h2>
          <button class="btn-close" @click="showModal = false"><Icon name="ph:x-bold" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nama Kelas</label>
            <input type="text" v-model="form.nama" class="modern-input" placeholder="Contoh: 1A" />
          </div>

          <div class="form-group">
            <label>Wali Kelas</label>
            <select v-model="form.waliKelasId" class="modern-input">
              <option value="">-- Pilih Wali Kelas --</option>
              <option v-for="guru in teachers" :key="guru.id" :value="guru.id">{{ guru.nama || 'Guru Tanpa Nama' }}</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showModal = false">Batal</button>
          <button class="btn-primary" @click="saveKelas">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h2>Hapus Kelas?</h2>
          <button class="btn-close" @click="showDeleteModal = false"><Icon name="ph:x-bold" /></button>
        </div>
        <div class="modal-body text-center" style="text-align: center;">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"><Icon name="ph:warning-circle-duotone" /></div>
          <p style="font-size: 1.05rem; color: #475569;">Apakah Anda yakin ingin menghapus kelas <strong>{{ deleteTarget?.nama }}</strong>? Siswa yang ada di kelas ini mungkin akan kehilangan referensi kelas mereka.</p>
        </div>
        <div class="modal-actions" style="justify-content: center;">
          <button class="btn-secondary" @click="showDeleteModal = false">Batal</button>
          <button class="btn-primary" style="background: #ef4444; box-shadow: none;" @click="confirmHapus">Ya, Hapus!</button>
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

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)
const searchQuery = ref('')
const isLoading = ref(false)

const kelasList = ref([])

const teachers = ref([])

const fetchKelasAndTeachers = async () => {
  isLoading.value = true
  try {
    // Ambil data guru dari tabel guru
    const { data: guruData } = await supabase.from('guru').select('id, nama')
    if (guruData) {
      teachers.value = guruData
    }

    const { data: kelasData, error } = await supabase.from('kelas').select('*').order('nama_kelas', { ascending: true })
    if (error) throw error
    
    if (kelasData) {
      // Fetch jumlah siswa per kelas
      const { data: countData } = await supabase.from('peserta_didik').select('kelas_id')
      
      const counts = (countData || []).reduce((acc, curr) => {
        if (curr.kelas_id) acc[curr.kelas_id] = (acc[curr.kelas_id] || 0) + 1
        return acc
      }, {})

      kelasList.value = kelasData.map(k => {
        const matchedGuru = teachers.value.find(g => g.id === k.wali_kelas_id)
        return {
          id: k.id,
          nama: k.nama_kelas,
          waliKelasId: k.wali_kelas_id,
          waliKelas: matchedGuru ? matchedGuru.nama : '-',
          aktif: true,
          jumlah_siswa: counts[k.id] || 0
        }
      })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast('Gagal memuat data', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchKelasAndTeachers()
})

const filteredKelas = computed(() => {
  return kelasList.value.filter(k => (k.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const form = ref({
  nama: '',
  waliKelasId: ''
})

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

const tambahKelas = () => {
  isEdit.value = false
  form.value = { nama: '', waliKelasId: '' }
  showModal.value = true
}

const editKelas = (kelas) => {
  isEdit.value = true
  editingId.value = kelas.id
  form.value = { 
    nama: kelas.nama, 
    waliKelasId: kelas.waliKelasId || ''
  }
  showModal.value = true
}

const saveKelas = async () => {
  if (!form.value.nama) {
    showToast('Nama kelas wajib diisi!', 'error')
    return
  }
  
  const namaKelasFormatted = form.value.nama.toLowerCase().includes('kelas') ? form.value.nama : `Kelas ${form.value.nama}`

  try {
    // Ambil default sekolah_id agar insert tidak gagal
    let defaultSekolahId = null
    const { data: sekolahData } = await supabase.from('sekolah').select('id').limit(1).single()
    if (sekolahData) {
      defaultSekolahId = sekolahData.id
    }

    if (isEdit.value) {
      const updateData = {
        nama_kelas: namaKelasFormatted,
        wali_kelas_id: form.value.waliKelasId || null
      }
      if (defaultSekolahId) updateData.sekolah_id = defaultSekolahId

      const { error } = await supabase.from('kelas').update(updateData).eq('id', editingId.value)
      
      if (error) throw error
      showToast('Data kelas telah diperbarui.', 'success')
    } else {
      const insertData = {
        nama_kelas: namaKelasFormatted,
        wali_kelas_id: form.value.waliKelasId || null
      }
      if (defaultSekolahId) insertData.sekolah_id = defaultSekolahId

      const { error } = await supabase.from('kelas').insert(insertData)
      if (error) throw error
      showToast('Kelas baru telah ditambahkan.', 'success')
    }
    
    showModal.value = false
    await fetchKelasAndTeachers() // Refresh data
  } catch (error) {
    console.error('Error saving kelas:', error)
    showToast('Gagal menyimpan kelas. Pastikan data sekolah ada di database.', 'error')
  }
}

const hapusKelas = (kelas) => {
  deleteTarget.value = kelas
  showDeleteModal.value = true
}

const confirmHapus = async () => {
  try {
    const { error } = await supabase.from('kelas').delete().eq('id', deleteTarget.value.id)
    if (error) throw error
    
    showToast('Kelas berhasil dihapus', 'success')
    showDeleteModal.value = false
    await fetchKelasAndTeachers()
  } catch (error) {
    console.error('Error deleting kelas:', error)
    showToast('Gagal menghapus kelas', 'error')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

.admin-page {
  font-family: 'Nunito', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  transition: color 0.2s;
  text-decoration: none;
}

.btn-back:hover {
  color: #1e293b;
}

.page-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
.page-subtitle { color: #64748b; margin: 0.2rem 0 0 0; font-size: 1.05rem; }

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { background: #2563eb; }

.content-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-toolbar { display: flex; justify-content: space-between; align-items: center; }

.search-box {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  width: 300px;
  transition: all 0.3s;
}

.search-box:focus-within { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
.search-icon { color: #94a3b8; font-size: 1.2rem; margin-right: 0.5rem; }
.search-input { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; color: #334155; }

.table-responsive { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { background: transparent; color: #64748b; font-weight: 700; font-size: 0.95rem; padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.modern-table td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tr:hover td { background: #f8fafc; }

.text-right { text-align: right; }
.text-gray { color: #64748b; font-weight: 600; }

.kelas-cell { display: flex; align-items: center; gap: 1rem; }
.kelas-icon { width: 40px; height: 40px; border-radius: 12px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.kelas-cell strong { color: #0f172a; font-size: 1.1rem; }

.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 800; }
.badge-blue { background: #e0f2fe; color: #0369a1; }

.status-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.9rem; }
.status-badge .dot { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.active { color: #10b981; }
.status-badge.active .dot { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
.status-badge.inactive { color: #94a3b8; }
.status-badge.inactive .dot { background: #94a3b8; }

.action-buttons { display: flex; gap: 0.5rem; justify-content: flex-end; }
.btn-icon { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1.1rem; }
.btn-icon:hover { background: #e2e8f0; color: #0f172a; }
.btn-icon.danger:hover { background: #fee2e2; color: #ef4444; }

@media (max-width: 768px) { .page-header { flex-direction: column; align-items: stretch; } .search-box { width: 100%; } }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}

.modern-input {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s;
  outline: none;
}

.modern-input:focus {
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

select.modern-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  cursor: pointer;
}

select.modern-input[disabled] {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
}

.selected-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
.selected-tags .tag { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; animation: scaleIn 0.2s ease-out; }
.selected-tags .tag button { background: none; border: none; color: #166534; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; opacity: 0.6; transition: all 0.2s; font-size: 1rem; }
.selected-tags .tag button:hover { opacity: 1; color: #ef4444; transform: scale(1.1); }

@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.student-selection-box { border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: white; transition: border-color 0.3s; }
.student-selection-box:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.search-inside { display: flex; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.search-inside .search-icon { color: #94a3b8; font-size: 1.2rem; margin-right: 0.6rem; }
.search-inside input { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; font-size: 0.95rem; color: #0f172a; }

.student-list-vertical { max-height: 220px; overflow-y: auto; }
.student-list-item { display: flex; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }
.student-list-item:last-child { border-bottom: none; }
.student-list-item:hover { background: #f8fafc; }
.student-list-item .avatar { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-right: 0.8rem; }
.student-list-item .name { flex: 1; font-weight: 600; color: #334155; font-size: 0.95rem; }
.btn-add-mini { background: #e0f2fe; color: #0284c7; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.3rem; cursor: pointer; transition: all 0.2s; }
.student-list-item:hover .btn-add-mini { background: #0284c7; color: white; }
.empty-state { padding: 1.5rem; text-align: center; color: #94a3b8; font-weight: 600; font-size: 0.9rem; }
.more-indicator { padding: 0.8rem 1rem; text-align: center; color: #64748b; font-size: 0.85rem; font-weight: 600; background: #f8fafc; display: flex; justify-content: center; align-items: center; gap: 0.5rem; border-top: 1px dashed #e2e8f0; }

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 1.5rem; right: 1.5rem;
  background: white; border-radius: 12px;
  padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-weight: 700; color: #0f172a;
  z-index: 2000; animation: slideIn 0.3s ease-out;
}
.toast-notification.success { border-left: 4px solid #10b981; }
.toast-notification.error { border-left: 4px solid #ef4444; }
.toast-notification .toast-icon { font-size: 1.5rem; }
.toast-notification.success .toast-icon { color: #10b981; }
.toast-notification.error .toast-icon { color: #ef4444; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
