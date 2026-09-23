<template>
  <div class="page-container">
    <!-- Hero Section -->
    <div class="hero-card nonislam-theme">
      <div class="hero-content">
        <div class="hero-icon-wrapper">
          <Icon name="ph:hands-praying-duotone" class="hero-icon" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Beribadah</h1>
          <p class="hero-subtitle">
            Pantau kegiatan ibadah anak setiap hari. Berilah tanda centang
            sesuai dengan tanggalnya.
          </p>
          <div
            class="alert-info"
            style="
              margin-top: 15px;
              background: rgba(255, 255, 255, 0.2);
              padding: 12px;
              border-radius: 8px;
              font-size: 0.9rem;
              line-height: 1.4;
            "
          >
            <Icon
              name="ph:info-duotone"
              style="
                margin-right: 5px;
                font-size: 1.1rem;
                vertical-align: middle;
              "
            />
            <span style="vertical-align: middle"
              ><strong>Petunjuk:</strong> Untuk mengubah poin/status kebiasaan
              harian, pastikan Anda mencentang <strong>ketiga</strong> waktu
              ibadah (Lengkap). Jika kurang dari 3, maka hari ini belum
              terhitung sebagai pencapaian.</span
            >
          </div>
        </div>
      </div>

      <!-- Tampilkan input hari ini HANYA jika bulan dan tahun yang dipilih adalah bulan saat ini -->
      <div v-if="isCurrentMonthView" class="today-action-area">
        <div class="today-input-section" v-if="!todayData.saved">
          <div class="input-wrapper">
            <label class="input-label"
              >Catatan Ibadah Hari Ini ({{ todayFormatted }})</label
            >
            <div class="worship-checkboxes">
              <label
                v-for="worship in worships"
                :key="worship.key"
                class="worship-checkbox-label"
                :class="{ 'is-checked': todayInput[worship.key] }"
              >
                <input
                  type="checkbox"
                  v-model="todayInput[worship.key]"
                  class="hidden-checkbox"
                />
                <Icon :name="worship.icon" class="worship-icon" />
                <span class="worship-name">{{ worship.label }}</span>
                <Icon
                  :name="
                    todayInput[worship.key]
                      ? 'ph:check-circle-fill'
                      : 'ph:circle'
                  "
                  class="check-status-icon"
                />
              </label>
            </div>
          </div>
          <div class="action-footer">
            <button class="btn-primary" @click="saveToday">
              <Icon name="ph:check-circle-bold" class="btn-icon" /> Simpan
            </button>
          </div>
        </div>

        <div class="today-success-section" v-else>
          <div class="success-badge complete">
            <Icon name="ph:seal-check-fill" class="success-icon" />
            <div class="success-text">
              <strong>Tersimpan!</strong> Anda telah mengisi catatan ibadah hari
              ini.
            </div>
          </div>
        </div>
      </div>
      <div v-else class="today-action-area not-current-month">
        <Icon name="ph:calendar-duotone" class="calendar-icon-large" />
        <p>
          Anda sedang melihat riwayat bulan
          <strong>{{ months[selectedMonth] }} {{ selectedYear }}</strong
          >.
        </p>
        <button class="btn-outline" @click="goToCurrentMonth">
          Kembali ke Bulan Ini
        </button>
      </div>
    </div>

    <LinearNavigation
      prevLink="/Orangtua/BangunPagi"
      prevText="Sebelumnya (Bangun Pagi)"
      nextLink="/Orangtua/Berolahraga"
      nextText="Lanjut ke Olahraga"
    />

    <!-- Table Section -->
    <div class="history-section">
      <div class="section-header">
        <div class="header-left">
          <div class="icon-box">
            <Icon name="ph:calendar-check-duotone" class="section-icon" />
          </div>
          <h2 class="section-title">
            Catatan Ibadah — {{ months[selectedMonth] }} {{ selectedYear }}
          </h2>
        </div>
        <div class="filter-group">
          <select
            v-model="selectedMonth"
            class="modern-select"
            @change="generateDays"
          >
            <option
              v-for="(month, index) in months"
              :key="index"
              :value="index"
            >
              {{ month }}
            </option>
          </select>
          <select
            v-model="selectedYear"
            class="modern-select"
            @change="generateDays"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <!-- Worship Table -->
      <div class="table-wrapper">
        <table class="worship-table">
          <thead>
            <tr>
              <th class="col-tanggal">Tanggal</th>
              <th
                v-for="worship in worships"
                :key="worship.key"
                class="col-worship"
              >
                <div class="worship-header">
                  <Icon :name="worship.icon" class="worship-th-icon" />
                  <span>{{ worship.label }}</span>
                </div>
              </th>
              <th class="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="day in days"
              :key="day.date"
              class="table-row"
              :class="{
                'row-today': isToday(day.date),
                'row-future': isFutureDate(day.date),
                'row-complete': isComplete(day),
                'row-missed':
                  isPastDate(day.date) && day.saved && !isComplete(day),
              }"
            >
              <td class="td-tanggal">
                <div class="date-cell">
                  <span class="date-num">{{ day.date }}</span>
                  <span class="date-day">{{ getDayName(day.date) }}</span>
                  <span v-if="isToday(day.date)" class="today-badge"
                    >Hari Ini</span
                  >
                </div>
              </td>
              <td
                v-for="worship in worships"
                :key="worship.key"
                class="td-worship"
              >
                <div
                  v-if="
                    !isFutureDate(day.date) &&
                    (day.saved || (isPastDate(day.date) && day.saved))
                  "
                  class="static-check"
                  :class="{ checked: day[worship.key] }"
                  :title="
                    day[worship.key]
                      ? `${worship.label} ✓`
                      : `${worship.label} Belum`
                  "
                >
                  <Icon
                    :name="
                      day[worship.key] ? 'ph:check-circle-fill' : 'ph:minus'
                    "
                    class="check-icon"
                  />
                </div>
                <div
                  v-else-if="
                    !isFutureDate(day.date) &&
                    isPastDate(day.date) &&
                    !day.saved
                  "
                  class="static-check missed"
                >
                  <Icon name="ph:x" class="check-icon" />
                </div>
                <div
                  v-else-if="isToday(day.date) && !day.saved"
                  class="static-check pending"
                >
                  <Icon name="ph:clock" class="check-icon" />
                </div>
                <span v-else class="future-dash">—</span>
              </td>
              <td class="td-status">
                <template v-if="isFutureDate(day.date)">
                  <Icon name="ph:lock-key" class="status-icon locked" />
                </template>
                <template v-else-if="isPastDate(day.date) && !day.saved">
                  <div class="status-pill missed">
                    <Icon name="ph:x-circle" />
                    <span>Terlewat</span>
                  </div>
                </template>
                <template v-else-if="isComplete(day) && day.saved">
                  <div class="status-pill complete">
                    <Icon name="ph:star-fill" />
                    <span>Terisi</span>
                  </div>
                </template>
                <template v-else-if="isToday(day.date) && !day.saved">
                  <div class="status-pill pending">
                    <Icon name="ph:clock" />
                    <span>Belum Diisi</span>
                  </div>
                </template>
                <template v-else>
                  <div class="status-pill partial" v-if="countDone(day) > 0">
                    <span>{{ countDone(day) }}/3</span>
                  </div>
                  <div class="status-pill missed" v-else>
                    <Icon name="ph:x-circle" />
                    <span>Tidak ada</span>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Card -->
      <div class="summary-card">
        <div class="summary-item">
          <Icon name="ph:star-fill" class="sum-icon gold" />
          <div class="sum-text">
            <span class="sum-label">Hari Terisi</span>
            <span class="sum-value">{{ completeDays }} hari</span>
          </div>
        </div>
        <div class="summary-item">
          <Icon name="ph:check-circle-fill" class="sum-icon purple" />
          <div class="sum-text">
            <span class="sum-label">Total Kegiatan</span>
            <span class="sum-value">{{ totalWorships }} kali</span>
          </div>
        </div>
        <div class="summary-item">
          <Icon name="ph:percent" class="sum-icon blue" />
          <div class="sum-text">
            <span class="sum-label">Persentase</span>
            <span class="sum-value">{{ worshipPercentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const supabase = useSupabase();

definePageMeta({
  layout: "orangtua",
});

const currentUserData = ref(null);
const pesertaDidikId = ref(null);
const ibadahList = ref([]);

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const worships = [
  { key: "doaPagi", label: "Doa Pagi", icon: "ph:sun-horizon-duotone" },
  {
    key: "membacaAlkitab",
    label: "Membaca Alkitab",
    icon: "ph:book-open-text-duotone",
  },
  { key: "doaMalam", label: "Doa Malam", icon: "ph:moon-stars-duotone" },
];

const currentActualDate = new Date();
const selectedMonth = ref(currentActualDate.getMonth());
const selectedYear = ref(currentActualDate.getFullYear());
const years = computed(() => {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
});

const days = ref([]);

const todayInput = ref({
  doaPagi: false,
  membacaAlkitab: false,
  doaMalam: false,
});

const isCurrentMonthView = computed(() => {
  const today = new Date();
  return (
    selectedMonth.value === today.getMonth() &&
    selectedYear.value === today.getFullYear()
  );
});

const todayFormatted = computed(() => {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date().toLocaleDateString("id-ID", options);
});

const todayData = computed(() => {
  const today = new Date().getDate();
  if (isCurrentMonthView.value) {
    const dayObj = days.value.find((d) => d.date === today);
    return dayObj || { saved: false };
  }
  return { saved: false };
});

const getDayName = (date) => {
  const d = new Date(selectedYear.value, selectedMonth.value, date);
  return dayNames[d.getDay()];
};

const isToday = (date) => {
  const today = new Date();
  return (
    date === today.getDate() &&
    selectedMonth.value === today.getMonth() &&
    selectedYear.value === today.getFullYear()
  );
};

const isPastDate = (date) => {
  const today = new Date();
  const checkDate = new Date(selectedYear.value, selectedMonth.value, date);
  today.setHours(0, 0, 0, 0);
  return checkDate < today;
};

const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(selectedYear.value, selectedMonth.value, date);
  today.setHours(0, 0, 0, 0);
  return checkDate > today;
};

const isComplete = (day) => {
  return worships.every((w) => day[w.key]);
};

const countDone = (day) => {
  return worships.filter((w) => day[w.key]).length;
};

const fetchMasterIbadah = async () => {
  const { data } = await supabase
    .from("ibadah")
    .select("*")
    .neq("agama", "Islam");
  if (data) ibadahList.value = data;
};

const getPesertaDidikId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const userMetadata = user.user_metadata || {};
  const userRole = userMetadata.role || "orangtua";

  if (userRole === "siswa") {
    const { data: pdData } = await supabase
      .from("peserta_didik")
      .select("id")
      .eq("user_id", user.id)
      .single();
    return pdData ? pdData.id : null;
  } else {
    const { data: otData } = await supabase
      .from("orang_tua")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (otData) {
      const { data: pdData } = await supabase
        .from("peserta_didik")
        .select("id")
        .eq("orang_tua_id", otData.id)
        .single();
      return pdData ? pdData.id : null;
    }
  }
  return null;
};

const generateDays = async () => {
  if (!pesertaDidikId.value) return;

  const daysInMonth = new Date(
    selectedYear.value,
    selectedMonth.value + 1,
    0,
  ).getDate();

  const startDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-01`;
  const endDate = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-${daysInMonth}`;

  const { data: listJurnalHarian } = await supabase
    .from("jurnal_harian")
    .select("id, tanggal")
    .eq("peserta_didik_id", pesertaDidikId.value)
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  let listJurnalIbadah = [];
  if (listJurnalHarian && listJurnalHarian.length > 0) {
    const harianIds = listJurnalHarian.map((jh) => jh.id);
    const { data: listJI } = await supabase
      .from("jurnal_ibadah")
      .select("*")
      .in("jurnal_harian_id", harianIds);
    if (listJI) listJurnalIbadah = listJI;
  }

  const newDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const checkDate = new Date(selectedYear.value, selectedMonth.value, i);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const harianToday = (listJurnalHarian || []).find(
      (jh) => jh.tanggal === dateString,
    );

    let isSaved = false;
    let doaPagi = false,
      membacaAlkitab = false,
      doaMalam = false;

    if (harianToday) {
      // Periksa apakah ada record ibadah
      const ibadahHariIni = listJurnalIbadah.filter(
        (ji) => ji.jurnal_harian_id === harianToday.id,
      );

      if (ibadahHariIni.length > 0) isSaved = true;

      ibadahHariIni.forEach((ji) => {
        const masterIbadah = ibadahList.value.find(
          (m) => m.id === ji.ibadah_id,
        );
        if (masterIbadah) {
          const nama = masterIbadah.nama_ibadah.toLowerCase();
          if (nama.includes("pagi")) doaPagi = ji.status;
          if (nama.includes("alkitab")) membacaAlkitab = ji.status;
          if (nama.includes("malam")) doaMalam = ji.status;
        }
      });
    }

    newDays.push({
      date: i,
      doaPagi: doaPagi,
      membacaAlkitab: membacaAlkitab,
      doaMalam: doaMalam,
      saved: isSaved,
    });
  }
  days.value = newDays;

  const todayNum = new Date().getDate();
  if (isCurrentMonthView.value) {
    const todayObj = newDays.find((d) => d.date === todayNum);
    if (todayObj && todayObj.saved) {
      worships.forEach((w) => {
        todayInput.value[w.key] = todayObj[w.key];
      });
    } else {
      worships.forEach((w) => {
        todayInput.value[w.key] = false;
      });
    }
  }
};

const saveToday = async () => {
  if (!pesertaDidikId.value) return;

  const today = new Date().getDate();
  const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-${String(today).padStart(2, "0")}`;

  try {
    let jurnalHarianId = null;
    const { data: cekJH } = await supabase
      .from("jurnal_harian")
      .select("id")
      .eq("peserta_didik_id", pesertaDidikId.value)
      .eq("tanggal", dateString)
      .single();

    if (cekJH) {
      jurnalHarianId = cekJH.id;
    } else {
      const { data: newJH, error: errJH } = await supabase
        .from("jurnal_harian")
        .insert({
          peserta_didik_id: pesertaDidikId.value,
          tanggal: dateString,
        })
        .select()
        .single();
      if (errJH) throw errJH;
      jurnalHarianId = newJH.id;
    }

    for (const w of worships) {
      const isChecked = todayInput.value[w.key];

      let searchKey = "";
      if (w.key === "doaPagi") searchKey = "pagi";
      if (w.key === "membacaAlkitab") searchKey = "alkitab";
      if (w.key === "doaMalam") searchKey = "malam";

      let masterIbadah = ibadahList.value.find((m) =>
        m.nama_ibadah.toLowerCase().includes(searchKey),
      );

      if (!masterIbadah) {
        const sessionCookie = useCookie("user_session");
        const userAgama = sessionCookie.value?.agama || "Non-Islam";
        const { data: newIb } = await supabase
          .from("ibadah")
          .insert({
            nama_ibadah: w.label,
            agama: userAgama,
          })
          .select()
          .single();
        if (newIb) {
          masterIbadah = newIb;
          ibadahList.value.push(newIb);
        }
      }

      if (masterIbadah) {
        const { data: cekJI } = await supabase
          .from("jurnal_ibadah")
          .select("id")
          .eq("jurnal_harian_id", jurnalHarianId)
          .eq("ibadah_id", masterIbadah.id)
          .single();

        if (cekJI) {
          await supabase
            .from("jurnal_ibadah")
            .update({ status: isChecked })
            .eq("id", cekJI.id);
        } else {
          await supabase.from("jurnal_ibadah").insert({
            jurnal_harian_id: jurnalHarianId,
            ibadah_id: masterIbadah.id,
            status: isChecked,
          });
        }
      }
    }

    // Refresh Tampilan
    await generateDays();
  } catch (error) {
    console.error("Gagal menyimpan ibadah:", error);
    alert("Terjadi kesalahan saat menyimpan ibadah.");
  }
};

const goToCurrentMonth = () => {
  selectedMonth.value = new Date().getMonth();
  selectedYear.value = new Date().getFullYear();
  generateDays();
};

const completeDays = computed(
  () => days.value.filter((d) => isComplete(d) && d.saved).length,
);
const totalWorships = computed(() =>
  days.value.reduce((sum, d) => sum + (d.saved ? countDone(d) : 0), 0),
);
const worshipPercentage = computed(() => {
  const pastDays = days.value.filter((d) => !isFutureDate(d.date) && d.saved);
  if (pastDays.length === 0) return 0;
  const maxPossible = pastDays.length * 3;
  const done = pastDays.reduce((sum, d) => sum + countDone(d), 0);
  return Math.round((done / maxPossible) * 100);
});

onMounted(async () => {
  await fetchMasterIbadah();
  pesertaDidikId.value = await getPesertaDidikId();
  await generateDays();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap");

.page-container {
  font-family: "Nunito", sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ===== HERO ===== */
.hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf5ff 60%, #ede9fe 100%);
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 20px 40px -15px rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-card.nonislam-theme::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.12) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  border-radius: 50%;
  transform: translate(30%, -30%);
  pointer-events: none;
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
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);
  flex-shrink: 0;
}

.hero-icon {
  font-size: 3.5rem;
  color: #7c3aed;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: #3b0764;
  margin: 0;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #4c1d95;
  font-weight: 600;
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

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-label {
  font-weight: 800;
  color: #3b0764;
  font-size: 1.1rem;
}

.worship-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.worship-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  min-width: 0;
}

.worship-checkbox-label:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.worship-checkbox-label.is-checked {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.worship-icon {
  font-size: 1.5rem;
  color: #64748b;
}

.worship-checkbox-label.is-checked .worship-icon {
  color: white;
}

.worship-name {
  font-weight: 700;
  font-size: 1.1rem;
  flex: 1;
}

.check-status-icon {
  font-size: 1.5rem;
  color: #cbd5e1;
}

.worship-checkbox-label.is-checked .check-status-icon {
  color: white;
}

.action-footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.today-success-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.success-badge {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid transparent;
}

.success-badge.complete {
  background: #faf5ff;
  border-color: #ddd6fe;
}

.success-icon {
  font-size: 3rem;
  color: #8b5cf6;
  flex-shrink: 0;
}

.success-text {
  font-size: 1.15rem;
  color: #4c1d95;
  line-height: 1.5;
}

/* ===== HISTORY SECTION ===== */
.history-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  background: #f5f3ff;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
}

.section-icon {
  font-size: 1.8rem;
}

.section-title {
  font-size: 1.4rem;
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
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  background-color: white;
}

/* ===== TABLE ===== */
.table-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.worship-table {
  width: 100%;
  border-collapse: collapse;
}

.worship-table thead tr {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.worship-table th {
  color: white;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 1.1rem 0.8rem;
  text-align: center;
  letter-spacing: 0.3px;
}

.col-tanggal {
  width: 120px;
  text-align: left !important;
  padding-left: 1.5rem !important;
}
.col-worship {
  min-width: 140px;
}
.col-status {
  min-width: 110px;
}

.worship-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.worship-th-icon {
  font-size: 1.4rem;
}

/* Row styles */
.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: #fdfaff;
}
.table-row.row-today {
  background: #faf5ff;
  border-left: 4px solid #8b5cf6;
}
.table-row.row-complete {
  background: #faf5ff;
}
.table-row.row-missed {
  background: #fef9f9;
  opacity: 0.85;
}
.table-row.row-future {
  opacity: 0.5;
  background: #f8fafc;
}

/* Date Cell */
.td-tanggal {
  padding: 0.9rem 1rem 0.9rem 1.5rem;
}
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.date-num {
  font-size: 1.3rem;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

.date-day {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.today-badge {
  font-size: 0.65rem;
  font-weight: 800;
  background: #8b5cf6;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 0.2rem;
  display: inline-block;
}

/* Worship Cell */
.td-worship {
  text-align: center;
  padding: 0.8rem;
}

.static-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 50%;
}

.static-check .check-icon {
  font-size: 1.8rem;
  color: #cbd5e1;
}

.static-check.checked .check-icon {
  color: #8b5cf6;
}
.static-check.missed .check-icon {
  color: #ef4444;
  font-size: 1.5rem;
}
.static-check.pending .check-icon {
  color: #f59e0b;
  font-size: 1.5rem;
}

.future-dash {
  color: #cbd5e1;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Status Cell */
.td-status {
  text-align: center;
  padding: 0.8rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-pill.complete {
  background: #ede9fe;
  color: #4c1d95;
}

.status-pill.partial {
  background: #fef9c3;
  color: #713f12;
}

.status-pill.missed {
  background: #fee2e2;
  color: #991b1b;
}

.status-pill.pending {
  background: #fef3c7;
  color: #b45309;
}

.status-icon {
  font-size: 1.4rem;
}

.status-icon.locked {
  color: #cbd5e1;
}

/* ===== SUMMARY ===== */
.summary-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 160px;
}

.sum-icon {
  font-size: 2.2rem;
  flex-shrink: 0;
}

.sum-icon.gold {
  color: #f59e0b;
}
.sum-icon.purple {
  color: #8b5cf6;
}
.sum-icon.blue {
  color: #3b82f6;
}

.sum-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.sum-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sum-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

/* ===== RESPONSIVE ===== */
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

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group {
    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: auto;
  }
  .worship-table {
    min-width: 500px;
  }

  .summary-card {
    flex-direction: column;
  }

  .today-action-area.not-current-month {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .month-info-bar {
    justify-content: center;
  }

  .worship-checkboxes {
    grid-template-columns: 1fr;
  }
}

/* Standardized Buttons */
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
  min-height: 50px;
  box-shadow: 0 8px 15px -8px rgba(139, 92, 246, 0.5);
  width: 100%;
}

@media (min-width: 640px) {
  .btn-primary {
    width: auto;
    padding: 0.8rem 2rem;
  }
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -8px rgba(139, 92, 246, 0.6);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-outline {
  background: transparent;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #8b5cf6;
  color: white;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  min-height: 50px;
}

.btn-secondary:hover:not(:disabled) {
  background: #8b5cf6;
  color: white;
}
</style>
