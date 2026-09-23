<template>
  <div class="dashboard-content">
    <!-- Judul Halaman Opsional -->
    <div class="header-section">
      <div class="welcome-badge" v-if="userName">
        <Icon name="ph:hand-waving-duotone" class="greeting-icon" />
        Halo, <strong>{{ userName }}</strong> <span class="role-badge">Orang Tua</span>
      </div>
      <h1 class="page-title">Aktivitas Harian Anak</h1>
      <p class="page-subtitle">Pantau perkembangan dan kebiasaan positif anak Anda setiap hari.</p>
    </div>

    <!-- Grid Aktivitas Harian -->
    <div class="activity-grid">
      
      <!-- Bangun Pagi -->
      <NuxtLink to="/Orangtua/BangunPagi" class="activity-card morning" :class="{'completed': isCompleted('Bangun Pagi')}">
        <div v-if="isCompleted('Bangun Pagi')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:sun-dim-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Bangun Pagi</h3>
      </NuxtLink>

      <!-- Beribadah (Dinamis sesuai agama) -->
      <NuxtLink :to="ibadahLink" class="activity-card worship" :class="{'completed': isCompleted('Beribadah')}">
        <div v-if="isCompleted('Beribadah')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:hands-praying-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Beribadah</h3>
      </NuxtLink>

      <!-- Berolahraga -->
      <NuxtLink to="/Orangtua/Berolahraga" class="activity-card sports" :class="{'completed': isCompleted('Berolahraga')}">
        <div v-if="isCompleted('Berolahraga')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:person-simple-run-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Berolahraga</h3>
      </NuxtLink>

      <!-- Makan Sehat -->
      <NuxtLink to="/Orangtua/MakanSehat" class="activity-card food" :class="{'completed': isCompleted('Makan sehat & Bergizi')}">
        <div v-if="isCompleted('Makan sehat & Bergizi')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:bowl-food-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Makan Sehat & Bergizi</h3>
      </NuxtLink>

      <!-- Gemar Belajar -->
      <NuxtLink to="/Orangtua/GemarBelajar" class="activity-card study" :class="{'completed': isCompleted('Gemar Belajar')}">
        <div v-if="isCompleted('Gemar Belajar')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:book-open-user-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Gemar Belajar</h3>
      </NuxtLink>

      <!-- Bermasyarakat -->
      <NuxtLink to="/Orangtua/Bermasyarakat" class="activity-card social" :class="{'completed': isCompleted('Bermasyarakat')}">
        <div v-if="isCompleted('Bermasyarakat')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:users-three-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Bermasyarakat</h3>
      </NuxtLink>

      <!-- Tidur Tepat Waktu -->
      <NuxtLink to="/Orangtua/TidurTepatWaktu" class="activity-card sleep" :class="{'completed': isCompleted('Tidur Tepat Waktu')}">
        <div v-if="isCompleted('Tidur Tepat Waktu')" class="completed-badge">
          <Icon name="ph:check-circle-fill" /> Sudah Terisi
        </div>
        <div class="card-icon-wrapper">
          <Icon name="ph:moon-stars-duotone" class="card-icon" />
        </div>
        <h3 class="card-title">Tidur Tepat Waktu</h3>
      </NuxtLink>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'orangtua'
})

// Cek agama dari sesi pengguna untuk mengarahkan rute Beribadah
const sessionCookie = useCookie('user_session')
const userAgama = sessionCookie.value?.agama || 'Islam'
const studentId = sessionCookie.value?.id

const ibadahLink = computed(() => {
  if (userAgama && userAgama !== 'Islam') {
    return '/Orangtua/Ibadah/NonIslam'
  }
  return '/Orangtua/Ibadah'
})

const supabase = useSupabase()
const completedHabits = ref({})
const userName = ref('')

const isCompleted = (habitName) => {
  return completedHabits.value[habitName] === true
}

onMounted(async () => {
  if (sessionCookie.value && sessionCookie.value.role === 'orangtua') {
    const { data } = await supabase.from('orang_tua').select('nama').eq('user_id', sessionCookie.value.id).single()
    if (data && data.nama) {
      userName.value = data.nama.split(' ')[0] // Ambil nama depan
    }
  }

  if (!studentId) return

  // Get local date string YYYY-MM-DD
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localDate = new Date(now.getTime() - (offset*60*1000))
  const today = localDate.toISOString().split('T')[0]

  try {
    const { data: harian } = await supabase
      .from('jurnal_harian')
      .select('id')
      .eq('siswa_id', studentId)
      .eq('tanggal', today)
      .single()

    if (harian) {
      const harianId = harian.id

      // Fetch jurnal_kebiasaan
      const { data: kLogs } = await supabase
        .from('jurnal_kebiasaan')
        .select('status, kebiasaan(nama_kebiasaan)')
        .eq('jurnal_harian_id', harianId)
      
      if (kLogs) {
        kLogs.forEach(log => {
          if (log.kebiasaan?.nama_kebiasaan && log.status) {
            completedHabits.value[log.kebiasaan.nama_kebiasaan] = true
          }
        })
      }

      // Fetch jurnal_ibadah
      const { data: iLogs } = await supabase
        .from('jurnal_ibadah')
        .select('id')
        .eq('jurnal_harian_id', harianId)
        .limit(1)
      
      if (iLogs && iLogs.length > 0) {
        completedHabits.value['Beribadah'] = true
      }
    }
  } catch (e) {
    console.error('Error fetching today status', e)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

.dashboard-content {
  font-family: 'Nunito', sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
}

.header-section {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  text-align: center;
  margin-bottom: 2.5rem;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  color: #3b82f6;
  padding: 0.4rem 1.2rem;
  border-radius: 99px;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.greeting-icon {
  font-size: 1.2rem;
  color: #3b82f6;
}

.role-badge {
  background: #1d4ed8;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

body.dark-theme .welcome-badge {
  background: rgba(30, 64, 175, 0.2);
  color: #93c5fd;
  border-color: #1e3a8a;
}

body.dark-theme .role-badge {
  background: #2563eb;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Grid Layout for Activities */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Individual Card Styling */
.activity-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.activity-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.activity-card.completed {
  border: 2px solid #22c55e;
}

.completed-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #dcfce7;
  color: #166534;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(34,197,94,0.15);
}

body.dark-theme .activity-card.completed {
  border-color: #16a34a;
}
body.dark-theme .completed-badge {
  background: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

/* Kotak untuk Icon dengan Bayangan Lembut */
.card-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  z-index: 1;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.3s ease;
}

.activity-card:hover .card-icon-wrapper {
  transform: scale(1.1);
}

.card-icon {
  font-size: 1.8rem;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #334155;
  z-index: 1;
  margin: 0;
}

/* Variasi Warna Cantik untuk Setiap Card */
.morning {
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border-top: 4px solid #f59e0b; /* Amber */
}
.morning .card-icon { color: #f59e0b; }

.worship {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  border-top: 4px solid #8b5cf6; /* Violet */
}
.worship .card-icon { color: #8b5cf6; }

.sports {
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
  border-top: 4px solid #10b981; /* Emerald */
}
.sports .card-icon { color: #10b981; }

.food {
  background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
  border-top: 4px solid #f43f5e; /* Rose */
}
.food .card-icon { color: #f43f5e; }

.study {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  border-top: 4px solid #3b82f6; /* Blue */
}
.study .card-icon { color: #3b82f6; }

.social {
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border-top: 4px solid #f97316; /* Orange */
}
.social .card-icon { color: #f97316; }

.sleep {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
  border-top: 4px solid #14b8a6; /* Teal */
}
.sleep .card-icon { color: #14b8a6; }

/* Notes Section */
.notes-section {
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.notes-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 6px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
}

.notes-header {
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
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
}

.notes-icon {
  font-size: 2rem;
  color: #4f46e5; /* Indigo */
}

.notes-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.notes-content {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px dashed #cbd5e1;
  transition: all 0.3s ease;
}

.notes-content:focus-within {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.notes-textarea {
  width: 100%;
  min-height: 150px;
  background: transparent;
  border: none;
  resize: vertical;
  font-family: inherit;
  font-size: 1.05rem;
  color: #374151;
  outline: none;
  line-height: 1.6;
}

.notes-textarea::placeholder {
  color: #9ca3af;
}

/* Responsiveness */
@media (max-width: 768px) {
  .activity-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  .activity-card {
    min-height: 140px;
    padding: 1rem;
  }

  .card-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .card-icon {
    font-size: 1.5rem;
  }

  .card-title {
    font-size: 0.95rem;
  }
  
  .notes-section {
    padding: 1.5rem;
  }
}
</style>

<style>
/* Dashboard Orangtua Dark Mode Overrides */
body.dark-theme .dashboard-content .header-section {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

body.dark-theme .dashboard-content .page-title {
  background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.dark-theme .dashboard-content .page-subtitle { color: #94a3b8; }

body.dark-theme .dashboard-content .activity-card {
  background: #1e293b;
  border-color: #334155;
}

body.dark-theme .dashboard-content .activity-card:hover {
  background: #334155;
  border-color: #475569;
}

body.dark-theme .dashboard-content .card-title { color: #cbd5e1; }
body.dark-theme .dashboard-content .activity-card:hover .card-title { color: #f8fafc; }

body.dark-theme .dashboard-content .card-icon-wrapper {
  background: #0f172a;
}

body.dark-theme .dashboard-content .notes-section {
  background: #1e293b;
  border-color: #334155;
}
body.dark-theme .dashboard-content .notes-header h2 { color: #f8fafc; }

body.dark-theme .dashboard-content .icon-box {
  background: rgba(99, 102, 241, 0.2);
}

body.dark-theme .notes-content {
  background: #0f172a;
  border-color: #334155;
}
body.dark-theme .notes-content:focus-within {
  background: #1e293b;
  border-color: #818cf8;
}

body.dark-theme .notes-textarea { color: #f8fafc; }
body.dark-theme .notes-textarea::placeholder { color: #64748b; }
</style>
