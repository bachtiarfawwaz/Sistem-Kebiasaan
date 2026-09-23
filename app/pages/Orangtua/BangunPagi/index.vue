<template>
  <div class="page-container">
    <!-- Hero / Today's Input Section -->
    <div class="hero-card">
      <div class="hero-content">
        <div class="hero-icon-wrapper">
          <Icon name="ph:sun-horizon-duotone" class="hero-icon" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Bangun Pagi</h1>
          <p class="hero-subtitle">Bantu anak membangun kebiasaan baik dengan mencatat jam bangun paginya hari ini.</p>
        </div>
      </div>

      <div v-if="isCurrentMonthView" class="today-action-area">
        <template v-if="!isTimeWindowValid && !todayData.saved">
          <div class="locked-state">
            <div class="locked-icon-wrapper">
              <Icon name="ph:lock-key-duotone" class="locked-icon" />
            </div>
            <div class="locked-text">
               <h3>Belum Waktunya Mengisi</h3>
               <p>Penginputan jurnal <strong>Bangun Pagi</strong> hanya bisa dilakukan antara pukul <strong>04:00 hingga 10:59 pagi</strong>. Hal ini untuk memastikan kedisiplinan dan keakuratan data.</p>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="today-input-section" v-if="!todayData.saved">
            <div class="time-input-wrapper">
              <label class="time-label">Jam berapa anak bangun hari ini? ({{ todayFormatted }})</label>
              <div class="input-group">
                <Icon name="ph:clock-duotone" class="input-icon" />
                <select v-model="todayTime" class="time-input modern-select" required>
                  <option value="" disabled selected>Pilih Jam Bangun...</option>
                  <option value="03:00">03:00</option>
                  <option value="03:15">03:15</option>
                  <option value="03:30">03:30</option>
                  <option value="03:45">03:45</option>
                  <option value="04:00">04:00</option>
                  <option value="04:15">04:15</option>
                  <option value="04:30">04:30</option>
                  <option value="04:45">04:45</option>
                  <option value="05:00">05:00</option>
                  <option value="05:15">05:15</option>
                  <option value="05:30">05:30</option>
                  <option value="05:45">05:45</option>
                  <option value="06:00">06:00</option>
                  <option value="Lebih dari 06:00">Lebih dari 06:00</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" @click="saveToday">
              <Icon name="ph:check-circle-bold" class="btn-icon" /> Simpan Catatan Hari Ini
            </button>
          </div>
        
        <div class="today-success-section" v-else>
          <div class="success-badge" :class="getTimeStatus(todayData.time)">
            <Icon :name="getIconName(getTimeStatus(todayData.time))" class="success-icon" />
            <div class="success-text">
              <strong>Tersimpan!</strong> Anda telah mengisi catatan hari ini pada pukul <span class="highlight-time">{{ todayData.time }}</span>.
            </div>
          </div>
        </div>
        </template>
      </div>
      <div v-else class="today-action-area not-current-month">
        <Icon name="ph:calendar-duotone" class="calendar-icon-large" />
        <p>Anda sedang melihat riwayat bulan <strong>{{ months[selectedMonth] }} {{ selectedYear }}</strong>.</p>
        <button class="btn-outline" @click="goToCurrentMonth">Kembali ke Bulan Ini</button>
      </div>
    </div>

    <LinearNavigation 
      prevLink="/Orangtua/Dashboard" 
      prevText="Dashboard" 
      nextLink="/Orangtua/Ibadah" 
      nextText="Lanjut ke Beribadah" 
    />

    <!-- History / Book View Section -->
    <div class="history-section">
      <div class="section-header">
        <div class="header-left">
          <div class="icon-box">
            <Icon name="ph:calendar-check-duotone" class="section-icon" />
          </div>
          <h2 class="section-title">Riwayat {{ months[selectedMonth] }}</h2>
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

      <!-- Modern Grid Layout for Days (Habit Tracker Style) -->
      <div class="days-grid">
        <div v-for="day in days" :key="day.date" 
             class="day-card" 
             :class="{ 
               'is-today': isToday(day.date), 
               'is-filled': day.saved, 
               'is-missed': isPastDate(day.date) && !day.saved,
               'is-future': isFutureDate(day.date)
             }">
          <div class="day-header">
            <span class="day-number">{{ day.date }}</span>
            <span class="day-label" v-if="isToday(day.date)">Hari Ini</span>
          </div>
          
          <div class="day-content">
            <template v-if="day.saved">
              <div class="time-badge filled" :class="getTimeStatus(day.time)">{{ day.time }}</div>
              <div class="status-paraf" :class="getTimeStatus(day.time)">
                <Icon name="ph:check-circle" /> Terisi
              </div>
            </template>
            <template v-else-if="isToday(day.date)">
              <div class="time-badge empty">Belum diisi</div>
              <Icon name="ph:clock-clockwise" class="status-icon waiting" />
            </template>
            <template v-else-if="isPastDate(day.date)">
              <div class="time-badge missed">Terlewat</div>
              <Icon name="ph:x-circle" class="status-icon missed" />
            </template>
            <template v-else>
              <div class="time-badge future">-</div>
              <Icon name="ph:lock-key" class="status-icon locked" title="Belum waktunya" />
            </template>
          </div>
        </div>
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
          placeholder="Tuliskan catatan atau observasi terkait kebiasaan bangun pagi anak di bulan ini..."
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
      .eq('jenis_jurnal', 'Bangun Pagi')
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
      .eq('jenis_jurnal', 'Bangun Pagi')
      .eq('bulan', selectedMonth.value + 1)
      .eq('tahun', selectedYear.value)
      .maybeSingle()

    if (existing) {
      await supabase.from('catatan_orang_tua').update({ catatan: catatan.value }).eq('id', existing.id)
    } else {
      await supabase.from('catatan_orang_tua').insert({
        peserta_didik_id: pesertaDidikId.value,
        jenis_jurnal: 'Bangun Pagi',
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

const todayTime = ref('')

const getTimeStatus = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  
  if (totalMinutes >= 4 * 60 && totalMinutes <= 6 * 60) {
    return 'good'
  } else if (totalMinutes > 6 * 60 && totalMinutes <= 8 * 60) {
    return 'warning'
  } else {
    return 'danger'
  }
}

const getIconName = (status) => {
  if (status === 'good') return 'ph:seal-check-fill'
  if (status === 'warning') return 'ph:warning-circle-fill'
  return 'ph:x-circle-fill'
}

const isCurrentMonthView = computed(() => {
  const today = new Date()
  return selectedMonth.value === today.getMonth() && selectedYear.value === today.getFullYear()
})

const todayFormatted = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return new Date().toLocaleDateString('id-ID', options)
})

const isTimeWindowValid = computed(() => {
  return true 
})

const todayData = computed(() => {
  const today = new Date().getDate()
  if (isCurrentMonthView.value) {
    const dayObj = days.value.find(d => d.date === today)
    return dayObj || { saved: false, time: '' }
  }
  return { saved: false, time: '' }
})

const generateDays = async () => {
  if (!pesertaDidikId.value || !kebiasaanId.value) return

  const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
  const startDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-01`
  const endDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${daysInMonth}`

  // 1. Ambil jurnal harian
  const { data: listJurnalHarian } = await supabase
    .from('jurnal_harian')
    .select('id, tanggal')
    .eq('peserta_didik_id', pesertaDidikId.value)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)

  // 2. Ambil jurnal kebiasaan
  let listJurnalKebiasaan = []
  if (listJurnalHarian && listJurnalHarian.length > 0) {
    const harianIds = listJurnalHarian.map(jh => jh.id)
    const { data: listJK } = await supabase
      .from('jurnal_kebiasaan')
      .select('*')
      .in('jurnal_harian_id', harianIds)
      .eq('kebiasaan_id', kebiasaanId.value)
      .eq('status', true)
    
    if (listJK) listJurnalKebiasaan = listJK
  }

  const newDays = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const harian = (listJurnalHarian || []).find(jh => jh.tanggal === dateString)
    
    let saved = false
    let time = ''
    
    if (harian) {
      const jk = listJurnalKebiasaan.find(k => k.jurnal_harian_id === harian.id)
      if (jk) {
        saved = true
        time = jk.keterangan || ''
      }
    }
    
    newDays.push({
      date: i,
      time: time,
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
  
  const userMetadata = user.user_metadata || {}
  const userRole = userMetadata.role || 'orangtua'
  
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
  
  let { data: masterKebiasaan } = await supabase.from('kebiasaan').select('id').ilike('nama_kebiasaan', '%bangun%').single()
  
  if (!masterKebiasaan) {
    const { data: newK } = await supabase.from('kebiasaan').insert({ nama_kebiasaan: 'Bangun Pagi' }).select('id').single()
    if (newK) masterKebiasaan = newK
  }
  
  if (masterKebiasaan) {
    kebiasaanId.value = masterKebiasaan.id
  }
  
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


  if (!todayTime.value) {
    alert('Mohon isi jam bangun terlebih dahulu.')
    return
  }
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

    if (dayObj.jurnalKebiasaanId) {
      await supabase.from('jurnal_kebiasaan').update({
        status: true,
        keterangan: todayTime.value
      }).eq('id', dayObj.jurnalKebiasaanId)
    } else {
      const { data: newJk, error } = await supabase.from('jurnal_kebiasaan').insert({
        jurnal_harian_id: harianId,
        kebiasaan_id: kebiasaanId.value,
        status: true,
        keterangan: todayTime.value
      }).select('id').single()
      
      if (error) throw error
      if (newJk) dayObj.jurnalKebiasaanId = newJk.id
    }
    
    dayObj.time = todayTime.value
    dayObj.saved = true
    alert('Data Bangun Pagi berhasil disimpan!')
    await generateDays()
  } catch (err) {
    console.error('Error saving data:', err)
    alert('Gagal menyimpan data')
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
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 20px 40px -15px rgba(245, 158, 11, 0.15);
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
  background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(255,255,255,0) 70%);
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
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
  flex-shrink: 0;
}

.hero-icon {
  font-size: 3.5rem;
  color: #f59e0b;
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

/* Locked State UX */
.locked-state {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #fff1f2;
  border: 2px dashed #fecdd3;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  width: 100%;
}

.locked-icon-wrapper {
  background: #ffe4e6;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.locked-icon {
  font-size: 2rem;
  color: #e11d48;
}

.locked-text h3 {
  color: #9f1239;
  margin: 0 0 0.4rem 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.locked-text p {
  color: #be123c;
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

.today-input-section {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.time-input-wrapper {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.time-label {
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
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-icon {
  font-size: 1.8rem;
  color: #64748b;
  margin-right: 1rem;
}

.time-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
  box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -10px rgba(37, 99, 235, 0.6);
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
}

.success-badge.good { background: #ecfdf5; border-color: #a7f3d0; }
.success-badge.good .success-icon { color: #10b981; }
.success-badge.good .success-text { color: #065f46; }
.success-badge.good .highlight-time { color: #047857; }

.success-badge.warning { background: #fffbeb; border-color: #fde68a; }
.success-badge.warning .success-icon { color: #f59e0b; }
.success-badge.warning .success-text { color: #92400e; }
.success-badge.warning .highlight-time { color: #b45309; }

.success-badge.danger { background: #fef2f2; border-color: #fecaca; }
.success-badge.danger .success-icon { color: #ef4444; }
.success-badge.danger .success-text { color: #991b1b; }
.success-badge.danger .highlight-time { color: #b91c1c; }

.success-icon {
  font-size: 2.5rem;
}

.success-text {
  font-size: 1.1rem;
}

.highlight-time {
  font-size: 1.3rem;
  font-weight: 900;
  background: white;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  margin: 0 0.2rem;
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
  background: #f0f9ff;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0ea5e9;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: white;
}

/* Grid Calendar View */
.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem;
}

.day-card {
  background: white;
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.day-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-size: 1.4rem;
  font-weight: 900;
  color: #94a3b8;
}

.day-label {
  font-size: 0.75rem;
  font-weight: 800;
  background: #f59e0b;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.time-badge {
  font-size: 1.1rem;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.time-badge.filled.good { background: #ecfdf5; color: #047857; }
.time-badge.filled.warning { background: #fffbeb; color: #b45309; }
.time-badge.filled.danger { background: #fef2f2; color: #b91c1c; }
.time-badge.empty { background: #fef3c7; color: #b45309; font-size: 0.9rem;}
.time-badge.missed { background: #fef2f2; color: #b91c1c; font-size: 0.9rem;}
.time-badge.future { background: #f8fafc; color: #cbd5e1; }

.status-paraf {
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.status-paraf.good { color: #10b981; }
.status-paraf.warning { color: #f59e0b; }
.status-paraf.danger { color: #ef4444; }

.status-icon { font-size: 1.5rem; }
.status-icon.filled { color: #10b981; }
.status-icon.waiting { color: #f59e0b; }
.status-icon.missed { color: #ef4444; }
.status-icon.locked { color: #cbd5e1; }

/* Day Card Variants */
.day-card.is-today {
  border: 2px solid #f59e0b;
  background: #fffbeb;
}
.day-card.is-today .day-number { color: #d97706; }

.day-card.is-filled { border-color: #a7f3d0; }
.day-card.is-filled .day-number { color: #059669; }

.day-card.is-missed { border-color: #fecaca; opacity: 0.8;}
.day-card.is-future { opacity: 0.5; background: #f8fafc; }

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
  color: #8b5cf6;
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
  border-color: #8b5cf6;
  border-style: solid;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
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
  
  .days-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}
</style>
