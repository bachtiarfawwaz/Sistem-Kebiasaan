<template>
  <div class="page-container">
    <!-- Hero / Today's Input Section -->
    <div class="hero-card">
      <div class="hero-content">
        <div class="hero-icon-wrapper">
          <Icon name="ph:users-three-duotone" class="hero-icon" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Bermasyarakat</h1>
          <p class="hero-subtitle">Bantu anak melatih kepedulian sosial dengan mencatat kegiatan bermasyarakatnya.</p>
        </div>
      </div>

      <!-- Tampilkan input hari ini HANYA jika bulan dan tahun yang dipilih adalah bulan saat ini -->
      <div v-if="isCurrentMonthView" class="today-action-area">
        <div class="today-input-section" v-if="!todayData.saved">
          <div class="activity-input-wrapper" style="width: 100%;">
            <label class="input-label">Kategori Kegiatan Sosial ({{ todayFormatted }})</label>
            <div class="input-group">
              <Icon name="ph:users-duotone" class="input-icon" />
              <select v-model="todayKategori" class="modern-select social-select">
                <option value="" disabled selected>Pilih Kegiatan...</option>
                <option value="Kerja Bakti / Gotong Royong">Kerja Bakti / Gotong Royong</option>
                <option value="Membantu Orang Tua">Membantu Orang Tua (Tugas Rumah)</option>
                <option value="Membantu Tetangga / Teman">Membantu Tetangga / Teman</option>
                <option value="Menjenguk Orang Sakit">Menjenguk Orang Sakit</option>
                <option value="Berbagi / Sedekah">Berbagi / Sedekah</option>
                <option value="Kegiatan Desa / Lingkungan">Kegiatan Desa / Lingkungan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <input type="text" v-model="todayKegiatan" placeholder="Tuliskan detail kegiatan secara singkat..." class="text-input" style="background: #f8fafc; padding: 10px; border-radius: 12px; border: 2px solid #e2e8f0; margin-top: 5px;">
          </div>

          <div class="action-footer">
            <button class="btn-primary" @click="saveToday" :disabled="isSaving">
              <Icon :name="isSaving ? 'ph:spinner-gap-bold' : 'ph:check-circle-bold'" class="btn-icon" :class="{'spin-icon': isSaving}" />
              {{ isSaving ? 'Menyimpan...' : 'Simpan Catatan Hari Ini' }}
            </button>
          </div>
        </div>
        
        <div class="today-success-section" v-else>
          <div class="success-badge good">
            <Icon name="ph:seal-check-fill" class="success-icon" />
            <div class="success-text">
              <strong>Tersimpan!</strong> Kegiatan hari ini: <span class="highlight-text">{{ todayData.activity }}</span>.
            </div>
          </div>
        </div>
      </div>
      <div v-else class="today-action-area not-current-month">
        <Icon name="ph:calendar-duotone" class="calendar-icon-large" />
        <p>Anda sedang melihat riwayat bulan <strong>{{ months[selectedMonth] }} {{ selectedYear }}</strong>.</p>
        <button class="btn-outline" @click="goToCurrentMonth">Kembali ke Bulan Ini</button>
      </div>
    </div>

    <LinearNavigation 
      prevLink="/Orangtua/GemarBelajar" 
      prevText="Sebelumnya (Belajar)" 
      nextLink="/Orangtua/TidurTepatWaktu" 
      nextText="Lanjut ke Tidur" 
    />

    <!-- History / Book View Section (Table format as requested by the book) -->
    <div class="history-section">
      <div class="section-header">
        <div class="header-left">
          <div class="icon-box">
            <Icon name="ph:list-dashes-duotone" class="section-icon" />
          </div>
          <h2 class="section-title">Riwayat Kegiatan {{ months[selectedMonth] }}</h2>
        </div>
        <div class="filter-group">
          <select v-model="selectedMonth" class="modern-select" @change="generateDays">
            <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
          </select>
          <select v-model="selectedYear" class="modern-select" @change="generateDays">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>

      <!-- Modern Table Layout -->
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="15%">Tanggal</th>
              <th>Kegiatan Masyarakat</th>
              <th width="20%">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in days" :key="day.date" 
                :class="{ 
                  'is-today': isToday(day.date),
                  'is-missed': isPastDate(day.date) && !day.saved,
                  'is-future': isFutureDate(day.date)
                }">
              <td class="date-cell">
                <span class="date-num">{{ day.date }}</span>
                <span class="today-badge" v-if="isToday(day.date)">Hari Ini</span>
              </td>
              <td class="activity-cell">
                <div class="activity-text" v-if="day.saved">{{ day.activity }}</div>
                <div class="empty-text" v-else-if="!isFutureDate(day.date)">Belum ada kegiatan dicatat</div>
                <div class="future-text" v-else>-</div>
              </td>
              <td class="status-cell">
                <div class="status-paraf" v-if="day.saved">
                  <Icon name="ph:check-circle" /> Terisi
                </div>
                <div class="status-waiting" v-else-if="isToday(day.date)">
                  <Icon name="ph:clock-clockwise" /> Menunggu
                </div>
                <div class="status-missed" v-else-if="isPastDate(day.date)">
                  <Icon name="ph:x-circle" /> Tidak Diisi
                </div>
                <div class="status-locked" v-else>
                  <Icon name="ph:lock-key" title="Belum waktunya" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Catatan (Sesuai Buku) -->
      <div class="catatan-section">
        <div class="catatan-header">
          <Icon name="ph:notebook-duotone" class="catatan-icon" />
          <h3>Catatan Orang Tua</h3>
        </div>
        <textarea 
          class="modern-textarea" 
          rows="4" 
          v-model="catatan" 
          placeholder="Tuliskan catatan atau observasi terkait keikutsertaan anak di lingkungan masyarakat bulan ini..."
        ></textarea>
        <div class="catatan-footer">
          <button class="btn-secondary" @click="saveCatatanBulanan" :disabled="isSavingCatatan">
            <Icon :name="isSavingCatatan ? 'ph:spinner-gap-bold' : 'ph:floppy-disk-back'" class="btn-icon" :class="{'spin-icon': isSavingCatatan}" /> 
            {{ isSavingCatatan ? 'Menyimpan...' : 'Simpan Catatan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'orangtua'
})

const supabase = useSupabase()
const pesertaDidikId = ref(null)
const kebiasaanId = ref(null)

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const currentActualDate = new Date()
const selectedMonth = ref(currentActualDate.getMonth())
const selectedYear = ref(currentActualDate.getFullYear())
const years = computed(() => {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1]
})

const days = ref([])
const catatan = ref('')
const isSavingCatatan = ref(false)

const loadCatatanBulanan = async () => {
  if (!pesertaDidikId.value) return
  try {
    const { data } = await supabase.from('catatan_orang_tua')
      .select('catatan')
      .eq('peserta_didik_id', pesertaDidikId.value)
      .eq('jenis_jurnal', 'Bermasyarakat')
      .eq('bulan', selectedMonth.value + 1)
      .eq('tahun', selectedYear.value)
      .maybeSingle()
    
    catatan.value = data ? data.catatan : ''
  } catch (err) {
    console.error(err)
  }
}

const saveCatatanBulanan = async () => {
  if (!pesertaDidikId.value) return
  isSavingCatatan.value = true
  try {
    const { data: existing } = await supabase.from('catatan_orang_tua')
      .select('id')
      .eq('peserta_didik_id', pesertaDidikId.value)
      .eq('jenis_jurnal', 'Bermasyarakat')
      .eq('bulan', selectedMonth.value + 1)
      .eq('tahun', selectedYear.value)
      .maybeSingle()

    if (existing) {
      await supabase.from('catatan_orang_tua').update({ catatan: catatan.value }).eq('id', existing.id)
    } else {
      await supabase.from('catatan_orang_tua').insert({
        peserta_didik_id: pesertaDidikId.value,
        jenis_jurnal: 'Bermasyarakat',
        bulan: selectedMonth.value + 1,
        tahun: selectedYear.value,
        catatan: catatan.value
      })
    }
    alert('Catatan bulanan berhasil disimpan!')
  } catch (err) {
    console.error(err)
    alert('Gagal menyimpan catatan bulanan.')
  } finally {
    isSavingCatatan.value = false
  }
}

const todayKategori = ref('')
const todayKegiatan = ref('')
const isSaving = ref(false)

const isCurrentMonthView = computed(() => {
  const today = new Date()
  return selectedMonth.value === today.getMonth() && selectedYear.value === today.getFullYear()
})

const todayFormatted = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return new Date().toLocaleDateString('id-ID', options)
})

const todayData = computed(() => {
  const today = new Date().getDate()
  if (isCurrentMonthView.value) {
    const dayObj = days.value.find(d => d.date === today)
    return dayObj || { saved: false, activity: '' }
  }
  return { saved: false, activity: '' }
})

const generateDays = async () => {
  if (!pesertaDidikId.value || !kebiasaanId.value) return
  const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
  const startDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-01`
  const endDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${daysInMonth}`

  const { data: listJurnalHarian } = await supabase.from('jurnal_harian').select('id, tanggal').eq('peserta_didik_id', pesertaDidikId.value).gte('tanggal', startDate).lte('tanggal', endDate)
  
  let listJurnalKebiasaan = []
  if (listJurnalHarian && listJurnalHarian.length > 0) {
    const harianIds = listJurnalHarian.map(jh => jh.id)
    const { data: listJK } = await supabase.from('jurnal_kebiasaan').select('*').in('jurnal_harian_id', harianIds).eq('kebiasaan_id', kebiasaanId.value).eq('status', true)
    if (listJK) listJurnalKebiasaan = listJK
  }

  const newDays = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const harian = (listJurnalHarian || []).find(jh => jh.tanggal === dateString)
    
    let saved = false
    let activity = ''
    
    if (harian) {
      const jk = listJurnalKebiasaan.find(k => k.jurnal_harian_id === harian.id)
      if (jk) {
        saved = true
        try {
          const parsed = JSON.parse(jk.keterangan)
          activity = parsed.keterangan || parsed.activity || jk.keterangan
        } catch(e) {
          activity = jk.keterangan || ''
        }
      }
    }
    
    newDays.push({
      date: i,
      activity: activity,
      saved: saved,
      harianId: harian ? harian.id : null,
      jurnalKebiasaanId: saved ? listJurnalKebiasaan.find(k => k.jurnal_harian_id === harian?.id)?.id : null
    })
  }

  days.value = newDays
  
  await loadCatatanBulanan()
}

const getPesertaDidikId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const userRole = user.user_metadata?.role || 'orangtua'
  if (userRole === 'siswa') {
    const { data: pdData } = await supabase.from('peserta_didik').select('id').eq('user_id', user.id).single()
    return pdData ? pdData.id : null
  } else {
    const { data: otData } = await supabase.from('orang_tua').select('id').eq('user_id', user.id).single()
    if (otData) {
      const { data: pdData } = await supabase.from('peserta_didik').select('id').eq('orang_tua_id', otData.id).single()
      return pdData ? pdData.id : null
    }
  }
  return null
}

onMounted(async () => {
  pesertaDidikId.value = await getPesertaDidikId()
  let { data: masterKebiasaan } = await supabase.from('kebiasaan').select('id').ilike('nama_kebiasaan', '%masyarakat%').single()
  if (!masterKebiasaan) {
    const { data: newK } = await supabase.from('kebiasaan').insert({ nama_kebiasaan: 'Bermasyarakat' }).select('id').single()
    if (newK) masterKebiasaan = newK
  }
  if (masterKebiasaan) kebiasaanId.value = masterKebiasaan.id
  await generateDays()
})

watch([selectedMonth, selectedYear], () => {
  generateDays()
})

const isToday = (date) => {
  const today = new Date()
  return date === today.getDate() && 
         selectedMonth.value === today.getMonth() && 
         selectedYear.value === today.getFullYear()
}

const isPastDate = (date) => {
  const today = new Date()
  const checkDate = new Date(selectedYear.value, selectedMonth.value, date)
  today.setHours(0,0,0,0)
  return checkDate < today
}

const isFutureDate = (date) => {
  const today = new Date()
  const checkDate = new Date(selectedYear.value, selectedMonth.value, date)
  today.setHours(0,0,0,0)
  return checkDate > today
}

const saveToday = async () => {
  if (isSaving.value) return
  if (!todayKategori.value || !todayKegiatan.value.trim()) {
    alert('Mohon pilih Kategori dan isi Nama Kegiatan yang dilakukan.')
    return
  }
  const gabunganKeterangan = `[${todayKategori.value}] ${todayKegiatan.value}`
  if (!pesertaDidikId.value || !kebiasaanId.value) return

  const today = new Date().getDate()
  const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`
  let dayObj = days.value.find(d => d.date === today)
  if (!dayObj) return
  
  try {
    let harianId = dayObj.harianId
    if (!harianId) {
      const { data: newHarian, error } = await supabase.from('jurnal_harian').insert({
        peserta_didik_id: pesertaDidikId.value,
        tanggal: dateString
      }).select('id').single()
      if (error) throw error
      harianId = newHarian.id
      dayObj.harianId = harianId
    }

    isSaving.value = true

    const jsonKeterangan = JSON.stringify({
      keterangan: gabunganKeterangan
    })

    if (dayObj.jurnalKebiasaanId) {
      await supabase.from('jurnal_kebiasaan').update({
        status: true,
        keterangan: jsonKeterangan
      }).eq('id', dayObj.jurnalKebiasaanId)
    } else {
      const { data: newJk, error } = await supabase.from('jurnal_kebiasaan').insert({
        jurnal_harian_id: harianId,
        kebiasaan_id: kebiasaanId.value,
        status: true,
        keterangan: jsonKeterangan
      }).select('id').single()
      if (error) throw error
      if (newJk) dayObj.jurnalKebiasaanId = newJk.id
    }
    
    dayObj.activity = gabunganKeterangan
    dayObj.saved = true
    alert('Data Bermasyarakat berhasil disimpan!')
    await generateDays()
  } catch (err) {
    console.error(err)
    alert(err.message || 'Gagal menyimpan data')
  } finally {
    isSaving.value = false
  }
}

const goToCurrentMonth = () => {
  selectedMonth.value = new Date().getMonth()
  selectedYear.value = new Date().getFullYear()
  generateDays()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

.page-container {
  font-family: 'Nunito', sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Hero Section */
.hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 1;
}

.hero-icon-wrapper {
  background: white;
  width: 90px;
  height: 90px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.hero-icon {
  font-size: 3.5rem;
  color: #10b981;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #475569;
  font-weight: 500;
  margin: 0;
  max-width: 600px;
}

/* Today Action Area */
.today-action-area {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
  z-index: 1;
  border: 1px solid #f1f5f9;
}

.today-action-area.not-current-month {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.calendar-icon-large {
  font-size: 2.5rem;
  color: #64748b;
}

.today-action-area.not-current-month p {
  font-size: 1.1rem;
  color: #475569;
  margin: 0;
}

.today-input-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-input-wrapper {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.input-label {
  font-weight: 700;
  color: #334155;
  font-size: 1.1rem;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.input-icon {
  font-size: 1.8rem;
  color: #64748b;
  margin-right: 1rem;
}

.text-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  padding: 0.5rem 0;
}

.text-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.social-select {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  background-image: none;
}

.social-select:invalid {
  color: #94a3b8;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
  height: 60px;
  box-shadow: 0 10px 20px -10px rgba(16, 185, 129, 0.5);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -10px rgba(16, 185, 129, 0.6);
}

.btn-icon {
  font-size: 1.4rem;
}

.today-success-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.success-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  border: 1px solid transparent;
  width: 100%;
}

.success-badge.good { background: #ecfdf5; border-color: #a7f3d0; }
.success-badge.good .success-icon { color: #10b981; font-size: 2.5rem; }
.success-badge.good .success-text { color: #065f46; font-size: 1.1rem; }
.success-badge.good .highlight-text { 
  font-weight: 800;
  background: white;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-outline {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* History Section */
.history-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  background: #ecfdf5;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.section-icon {
  font-size: 1.8rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.modern-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  padding: 0.6rem 2.5rem 0.6rem 1.2rem;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em 1em;
  transition: all 0.2s ease;
}

.modern-select:hover {
  background-color: #e2e8f0;
}

.modern-select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  background-color: white;
}

/* Modern Table */
.table-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table th {
  background: #f8fafc;
  padding: 1.2rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table td {
  padding: 1.2rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.modern-table tr:hover td {
  background: #f8fafc;
}

.modern-table tr.is-today td {
  background: #ecfdf5;
  border-bottom: 1px solid #a7f3d0;
  border-top: 1px solid #a7f3d0;
}

.modern-table tr.is-missed td {
  opacity: 0.8;
  background: #fafafa;
}

.modern-table tr.is-future td {
  opacity: 0.5;
  background: #f8fafc;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.date-num {
  font-size: 1.2rem;
  font-weight: 900;
  color: #0f172a;
  background: #f1f5f9;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.is-today .date-num {
  background: #10b981;
  color: white;
}

.today-badge {
  font-size: 0.7rem;
  font-weight: 800;
  background: #f59e0b;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-cell {
  font-weight: 600;
  color: #334155;
}

.activity-text {
  font-size: 1.05rem;
}

.empty-text {
  color: #94a3b8;
  font-style: italic;
  font-weight: 500;
}

.future-text {
  color: #cbd5e1;
}

.status-cell {
  font-weight: 700;
  font-size: 0.9rem;
}

.status-paraf {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-paraf svg { font-size: 1.2rem; }

.status-waiting {
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-waiting svg { font-size: 1.2rem; }

.status-missed {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-missed svg { font-size: 1.2rem; }

.status-locked {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-locked svg { font-size: 1.2rem; }


/* Catatan Section */
.catatan-section {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.catatan-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.catatan-icon {
  font-size: 2rem;
  color: #10b981;
}

.catatan-header h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modern-textarea {
  width: 100%;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 1.5rem;
  font-family: inherit;
  font-size: 1.1rem;
  color: #334155;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  min-height: 120px;
}

.modern-textarea:focus {
  background: white;
  border-color: #10b981;
  border-style: solid;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
}

.catatan-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #0f172a;
}

@media (max-width: 768px) {
  .hero-card {
    padding: 2rem 1.5rem;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .today-input-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-primary {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .modern-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
