<template>
  <div class="dashboard-admin">
    <div class="page-header">
      <h1 class="page-title">Dasbor Admin</h1>
      <p class="page-subtitle">
        Halaman utama untuk mengelola seluruh data dan fungsi dalam sistem
        monitoring kebiasaan peserta didik.
      </p>
    </div>

    <!-- Statistik Cepat -->
    <div class="quick-stats">
      <div class="stat-card blue">
        <div class="stat-info">
          <h3>Total Pengguna</h3>
          <p class="stat-number">{{ totalUsers }}</p>
        </div>
        <div class="stat-icon"><Icon name="ph:users-duotone" /></div>
      </div>
      <div class="stat-card green">
        <div class="stat-info">
          <h3>Total Kelas</h3>
          <p class="stat-number">{{ totalClasses }}</p>
        </div>
        <div class="stat-icon">
          <Icon name="ph:chalkboard-teacher-duotone" />
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-info">
          <h3>Jurnal Tercatat</h3>
          <p class="stat-number">{{ totalJournals }}</p>
        </div>
        <div class="stat-icon"><Icon name="ph:book-bookmark-duotone" /></div>
      </div>
    </div>

    <!-- Menu Utama (Cards) -->
    <div class="section-header">
      <h2 class="section-title">Menu Utama</h2>
    </div>

    <div class="top-cards">
      <NuxtLink to="/Admin/KelolaPengguna" class="card">
        <div class="card-content">
          <h3 class="card-title">Kelola<br />Pengguna</h3>
          <p class="card-desc">
            Mengatur data seluruh pengguna sistem, termasuk guru, orang tua,
            peserta didik, serta penetapan perannya.
          </p>
        </div>
        <div class="card-icon-wrapper blue">
          <Icon name="ph:users-three-duotone" class="card-icon" />
        </div>
      </NuxtLink>

      <NuxtLink to="/Admin/KelolaKelas" class="card">
        <div class="card-content">
          <h3 class="card-title">Kelola<br />Kelas</h3>
          <p class="card-desc">
            Mengatur data kelas, penentuan wali kelas, dan pengelompokan peserta
            didik ke kelas yang sesuai.
          </p>
        </div>
        <div class="card-icon-wrapper green">
          <Icon name="ph:chalkboard-teacher-duotone" class="card-icon" />
        </div>
      </NuxtLink>

      <NuxtLink to="/Admin/KelolaJurnal" class="card">
        <div class="card-content">
          <h3 class="card-title">Kelola Data<br />Jurnal</h3>
          <p class="card-desc">
            Mengelola dan memastikan data jurnal kebiasaan tersimpan dengan baik
            sesuai struktur sistem.
          </p>
        </div>
        <div class="card-icon-wrapper purple">
          <Icon name="ph:book-bookmark-duotone" class="card-icon" />
        </div>
      </NuxtLink>
    </div>

    <!-- Area Chart/Grafik -->
    <div class="bottom-card">
      <div class="card-header">
        <h3 class="section-title">Statistik Penggunaan Sistem</h3>
        <select
          class="modern-select"
          v-model="selectedFilter"
          @change="fetchChartData"
        >
          <option value="7days">7 Hari Terakhir</option>
          <option value="30days">30 Hari Terakhir</option>
        </select>
      </div>
      <div class="statistik-content">
        <div class="chart-container">
          <Bar v-if="chartLoaded" :data="chartData" :options="chartOptions" />
          <div v-else class="loading-state">
            <Icon name="ph:spinner-gap-bold" class="spin-icon" /> Memuat data...
          </div>
        </div>
        <div class="chart-text">
          <Icon name="ph:chart-bar-duotone" class="trend-icon" />
          <p>
            Melihat ringkasan aktivitas pengisian jurnal untuk memudahkan
            pemantauan harian.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

definePageMeta({
  layout: "admin",
});

const supabase = useSupabase();

const totalUsers = ref(0);
const totalClasses = ref(0);
const totalJournals = ref(0);

const selectedFilter = ref("7days");
const chartLoaded = ref(false);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Jumlah Jurnal",
      data: [],
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderRadius: 6,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
});

const fetchDashboardStats = async () => {
  try {
    // Menghitung pengguna dari tabel 'users'
    const { count: usersCount, error: usersErr } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    if (!usersErr && usersCount !== null) totalUsers.value = usersCount;

    // Menghitung kelas dari tabel 'kelas'
    const { count: classesCount, error: classesErr } = await supabase
      .from("kelas")
      .select("*", { count: "exact", head: true });
    if (!classesErr && classesCount !== null) totalClasses.value = classesCount;

    // Menghitung jurnal dari tabel 'jurnal_harian'
    const { count: journalsCount, error: journalsErr } = await supabase
      .from("jurnal_harian")
      .select("*", { count: "exact", head: true });
    if (!journalsErr && journalsCount !== null)
      totalJournals.value = journalsCount;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

const fetchChartData = async () => {
  chartLoaded.value = false;
  try {
    const limitDays = selectedFilter.value === "7days" ? 7 : 30;
    const today = new Date();

    // Generate label tanggal (H-X ke Hari Ini)
    const labels = [];
    const dates = [];
    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(
        d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      );
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${dd}`);
    }

    // Menggunakan kolom 'tanggal' (date)
    const startDate = dates[0];
    const { data: journalsData, error } = await supabase
      .from("jurnal_harian")
      .select("tanggal")
      .gte("tanggal", startDate);

    const dataCounts = new Array(limitDays).fill(0);

    if (journalsData && !error) {
      journalsData.forEach((jurnal) => {
        // Asumsi format 'tanggal' adalah YYYY-MM-DD
        const d = jurnal.tanggal;
        const index = dates.indexOf(d);
        if (index !== -1) {
          dataCounts[index]++;
        }
      });
    }

    chartData.value.labels = labels;
    chartData.value.datasets[0].data = dataCounts;

    chartLoaded.value = true;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    chartLoaded.value = true; // Tetap tampilkan (kosong) jika gagal
  }
};

onMounted(() => {
  fetchDashboardStats();
  fetchChartData();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.dashboard-admin {
  font-family: "Nunito", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.stat-info h3 {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-card.blue .stat-icon {
  background: #eff6ff;
  color: #3b82f6;
}
.stat-card.green .stat-icon {
  background: #ecfdf5;
  color: #10b981;
}
.stat-card.purple .stat-icon {
  background: #f5f3ff;
  color: #8b5cf6;
}

/* Main Menu Cards */
.section-header {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.top-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  min-height: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

.card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  transition: background 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.card:nth-child(1):hover::after {
  background: #3b82f6;
}
.card:nth-child(2):hover::after {
  background: #10b981;
}
.card:nth-child(3):hover::after {
  background: #8b5cf6;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.8rem 0;
  line-height: 1.2;
}

.card-desc {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  align-self: flex-end;
  margin-top: 1.5rem;
}

.card-icon-wrapper.blue {
  background: #eff6ff;
  color: #3b82f6;
}
.card-icon-wrapper.green {
  background: #ecfdf5;
  color: #10b981;
}
.card-icon-wrapper.purple {
  background: #f5f3ff;
  color: #8b5cf6;
}

.card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}
.card:nth-child(1):hover .card-icon-wrapper {
  background: #3b82f6;
  color: white;
}
.card:nth-child(2):hover .card-icon-wrapper {
  background: #10b981;
  color: white;
}
.card:nth-child(3):hover .card-icon-wrapper {
  background: #8b5cf6;
  color: white;
}

.card-icon {
  font-size: 2rem;
}

/* Bottom Chart Card */
.bottom-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.modern-select {
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.statistik-content {
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.chart-container {
  width: 100%;
  max-width: 800px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-weight: 700;
  font-size: 1.1rem;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.chart-text {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #475569;
}

.trend-icon {
  font-size: 2rem;
  color: #10b981;
}

.chart-text p {
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 992px) {
  .top-cards {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Dashboard Dark Mode Overrides */
body.dark-theme .dashboard-admin .page-title {
  color: #f8fafc;
}
body.dark-theme .dashboard-admin .page-subtitle {
  color: #94a3b8;
}
body.dark-theme .dashboard-admin .section-title {
  color: #f8fafc;
}

body.dark-theme .dashboard-admin .stat-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
body.dark-theme .dashboard-admin .stat-info h3 {
  color: #94a3b8;
}
body.dark-theme .dashboard-admin .stat-number {
  color: #f8fafc;
}

body.dark-theme .dashboard-admin .stat-card.blue .stat-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}
body.dark-theme .dashboard-admin .stat-card.green .stat-icon {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
body.dark-theme .dashboard-admin .stat-card.purple .stat-icon {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

body.dark-theme .dashboard-admin .card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
}
body.dark-theme .dashboard-admin .card::after {
  background: #334155;
}
body.dark-theme .dashboard-admin .card:hover {
  border-color: #475569;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
}

body.dark-theme .dashboard-admin .card-title {
  color: #f8fafc;
}
body.dark-theme .dashboard-admin .card-desc {
  color: #94a3b8;
}

body.dark-theme .dashboard-admin .card-icon-wrapper.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}
body.dark-theme .dashboard-admin .card-icon-wrapper.green {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
body.dark-theme .dashboard-admin .card-icon-wrapper.purple {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

body.dark-theme .dashboard-admin .bottom-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
}

body.dark-theme .dashboard-admin .modern-select {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

body.dark-theme .dashboard-admin .statistik-content {
  background: #0f172a;
  border-color: #334155;
}

body.dark-theme .dashboard-admin .chart-illustration {
  border-bottom-color: #334155;
}
body.dark-theme .dashboard-admin .bar {
  background: #475569;
}
body.dark-theme .dashboard-admin .bar:hover {
  background: #64748b;
}
body.dark-theme .dashboard-admin .bar.active {
  background: #3b82f6;
}

body.dark-theme .dashboard-admin .chart-text {
  color: #94a3b8;
}
</style>
