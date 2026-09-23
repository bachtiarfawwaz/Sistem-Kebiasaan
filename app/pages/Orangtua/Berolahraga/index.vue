<template>
  <div class="page-container">
    <!-- Hero / Today's Input Section -->
    <div class="hero-card sports-theme">
      <div class="hero-content">
        <div class="hero-icon-wrapper">
          <Icon name="ph:person-simple-run-duotone" class="hero-icon" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Berolahraga</h1>
          <p class="hero-subtitle">
            Bantu anak menjaga kebugaran tubuh. Catat aktivitas fisik yang
            mereka lakukan hari ini.
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
              ><strong>Petunjuk:</strong> Agar terhitung sebagai pencapaian
              (tuntas) di Laporan, durasi minimal olahraga adalah
              <strong>30 menit</strong>. Jika kurang dari itu, pencatatan akan
              tersimpan namun belum terhitung tuntas.</span
            >
          </div>
        </div>
      </div>

      <!-- Tampilkan input hari ini HANYA jika bulan dan tahun yang dipilih adalah bulan saat ini -->
      <div v-if="isCurrentMonthView" class="today-action-area">
        <div class="today-input-section" v-if="!todayData.saved">
          <div class="form-grid">
            <div class="input-wrapper">
              <label class="input-label"
                >Jenis Olahraga ({{ todayFormatted }})</label
              >
              <div class="input-group">
                <Icon name="ph:basketball-duotone" class="input-icon" />
                <select
                  v-model="todayActivityName"
                  class="modern-select activity-select"
                >
                  <option value="" disabled selected>
                    -- Pilih Jenis Olahraga --
                  </option>
                  <option value="Lari / Jogging">Lari / Jogging</option>
                  <option value="Senam / Workout">
                    Senam / Workout (Di Rumah)
                  </option>
                  <option value="Sepak Bola / Futsal">
                    Sepak Bola / Futsal
                  </option>
                  <option value="Bulu Tangkis">Bulu Tangkis</option>
                  <option value="Bersepeda">Bersepeda</option>
                  <option value="Berenang">Berenang</option>
                  <option value="Bola Basket / Voli">Bola Basket / Voli</option>
                  <option value="Bela Diri / Silat">
                    Bela Diri / Pencak Silat
                  </option>
                  <option value="Olahraga Lainnya">Olahraga Lainnya</option>
                </select>
              </div>
            </div>

            <div class="input-wrapper">
              <label class="input-label">Durasi (Menit)</label>
              <div class="input-group">
                <Icon name="ph:timer-duotone" class="input-icon" />
                <input
                  type="number"
                  v-model="todayDuration"
                  class="text-input"
                  placeholder="Contoh: 30"
                  min="30"
                />
              </div>
            </div>
          </div>

          <div style="width: 100%; grid-column: 1 / -1; margin-top: 1rem">
            <button class="btn-primary" @click="saveToday" :disabled="isSaving">
              <Icon
                :name="
                  isSaving ? 'ph:spinner-gap-bold' : 'ph:check-circle-bold'
                "
                class="btn-icon"
                :class="{ 'spin-icon': isSaving }"
              />
              {{ isSaving ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>

        <div class="today-success-section" v-else>
          <div class="success-badge good">
            <Icon name="ph:seal-check-fill" class="success-icon" />
            <div class="success-text">
              <strong>Tersimpan!</strong> Anda telah mengisi kegiatan
              <span class="highlight-text">{{ todayData.activity }}</span> hari
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
      prevLink="/Orangtua/Ibadah"
      prevText="Sebelumnya (Ibadah)"
      nextLink="/Orangtua/MakanSehat"
      nextText="Lanjut ke Makan Sehat"
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

      <!-- Modern List Layout for Days -->
      <div class="days-list">
        <div
          v-for="day in days"
          :key="day.date"
          class="day-row"
          :class="{
            'is-today': isToday(day.date),
            'is-filled': day.saved,
            'is-missed': isPastDate(day.date) && !day.saved,
            'is-future': isFutureDate(day.date),
          }"
        >
          <div class="day-date-col">
            <span class="day-number">{{ day.date }}</span>
            <span class="day-label" v-if="isToday(day.date)">Hari Ini</span>
          </div>

          <div class="day-activity-col">
            <template v-if="day.saved">
              <div class="activity-text">{{ day.activity }}</div>
            </template>
            <template v-else-if="isToday(day.date)">
              <div class="empty-text">Menunggu pengisian hari ini...</div>
            </template>
            <template v-else-if="isPastDate(day.date)">
              <div class="missed-text">Tidak ada kegiatan (Terlewat)</div>
            </template>
            <template v-else>
              <div class="locked-text">Belum waktunya</div>
            </template>
          </div>

          <div class="day-status-col">
            <template v-if="day.saved">
              <div class="status-paraf good">
                <Icon name="ph:check-circle" /> Terisi
              </div>
            </template>
            <template v-else-if="isToday(day.date)">
              <Icon name="ph:clock-clockwise" class="status-icon waiting" />
            </template>
            <template v-else-if="isPastDate(day.date)">
              <Icon name="ph:x-circle" class="status-icon missed" />
            </template>
            <template v-else>
              <Icon
                name="ph:lock-key"
                class="status-icon locked"
                title="Belum waktunya"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: "orangtua",
});

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

const supabase = useSupabase();
const pesertaDidikId = ref(null);
const kebiasaanId = ref(null);

const currentActualDate = new Date();
const selectedMonth = ref(currentActualDate.getMonth());
const selectedYear = ref(currentActualDate.getFullYear());
const years = computed(() => {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
});

const days = ref([]);
const todayActivityName = ref("");
const todayDuration = ref("");
const todayActivity = ref("");
const isSaving = ref(false);

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
    return dayObj || { saved: false, activity: "" };
  }
  return { saved: false, activity: "" };
});

const generateDays = async () => {
  if (!pesertaDidikId.value || !kebiasaanId.value) return;
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

  let listJurnalKebiasaan = [];
  if (listJurnalHarian && listJurnalHarian.length > 0) {
    const harianIds = listJurnalHarian.map((jh) => jh.id);
    const { data: listJK } = await supabase
      .from("jurnal_kebiasaan")
      .select("*")
      .in("jurnal_harian_id", harianIds)
      .eq("kebiasaan_id", kebiasaanId.value)
      .eq("status", true);
    if (listJK) listJurnalKebiasaan = listJK;
  }

  const newDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const harian = (listJurnalHarian || []).find(
      (jh) => jh.tanggal === dateString,
    );
    let saved = false;
    let activity = "";

    if (harian) {
      const jk = listJurnalKebiasaan.find(
        (k) => k.jurnal_harian_id === harian.id,
      );
      if (jk) {
        saved = true;
        try {
          const parsed = JSON.parse(jk.keterangan);
          activity = parsed.keterangan || jk.keterangan;
        } catch (e) {
          activity = jk.keterangan || "";
        }
      }
    }

    newDays.push({
      date: i,
      activity: activity,
      saved: saved,
      harianId: harian ? harian.id : null,
      jurnalKebiasaanId: saved
        ? listJurnalKebiasaan.find((k) => k.jurnal_harian_id === harian?.id)?.id
        : null,
    });
  }
  days.value = newDays;
};

const getPesertaDidikId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const userRole = user.user_metadata?.role || "orangtua";
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

onMounted(async () => {
  pesertaDidikId.value = await getPesertaDidikId();
  let { data: masterKebiasaan } = await supabase
    .from("kebiasaan")
    .select("id")
    .ilike("nama_kebiasaan", "%olahraga%")
    .single();
  if (!masterKebiasaan) {
    const { data: newK } = await supabase
      .from("kebiasaan")
      .insert({ nama_kebiasaan: "Berolahraga" })
      .select("id")
      .single();
    if (newK) masterKebiasaan = newK;
  }
  if (masterKebiasaan) kebiasaanId.value = masterKebiasaan.id;
  await generateDays();
});

import { watch } from "vue";
watch([selectedMonth, selectedYear], () => {
  generateDays();
});

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

const saveToday = async () => {
  if (isSaving.value) return;
  if (!todayActivityName.value.trim()) {
    alert("Mohon isi jenis olahraga terlebih dahulu.");
    return;
  }
  if (!todayDuration.value || parseInt(todayDuration.value) < 30) {
    alert("Mohon isi durasi olahraga (minimal 30 menit).");
    return;
  }

  todayActivity.value = `${todayActivityName.value} (${todayDuration.value} Menit)`;
  if (!pesertaDidikId.value || !kebiasaanId.value) return;

  const today = new Date().getDate();
  const dateString = `${selectedYear.value}-${String(selectedMonth.value + 1).padStart(2, "0")}-${String(today).padStart(2, "0")}`;
  let dayObj = days.value.find((d) => d.date === today);
  if (!dayObj) return;

  try {
    let harianId = dayObj.harianId;
    if (!harianId) {
      const { data: newHarian, error } = await supabase
        .from("jurnal_harian")
        .insert({
          peserta_didik_id: pesertaDidikId.value,
          tanggal: dateString,
        })
        .select("id")
        .single();
      if (error) throw error;
      harianId = newHarian.id;
      dayObj.harianId = harianId;
    }

    isSaving.value = true;

    const jsonKeterangan = JSON.stringify({
      keterangan: todayActivity.value,
    });

    if (dayObj.jurnalKebiasaanId) {
      await supabase
        .from("jurnal_kebiasaan")
        .update({
          status: true,
          keterangan: jsonKeterangan,
        })
        .eq("id", dayObj.jurnalKebiasaanId);
    } else {
      const { data: newJk, error } = await supabase
        .from("jurnal_kebiasaan")
        .insert({
          jurnal_harian_id: harianId,
          kebiasaan_id: kebiasaanId.value,
          status: true,
          keterangan: jsonKeterangan,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (newJk) dayObj.jurnalKebiasaanId = newJk.id;
    }

    dayObj.activity = todayActivity.value;
    dayObj.saved = true;
    alert("Data Berolahraga berhasil disimpan!");
    await generateDays();
  } catch (err) {
    console.error(err);
    alert(err.message || "Gagal menyimpan data");
  } finally {
    isSaving.value = false;
  }
};

const goToCurrentMonth = () => {
  selectedMonth.value = new Date().getMonth();
  selectedYear.value = new Date().getFullYear();
  generateDays();
};
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

.hero-card.sports-theme::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(245, 158, 11, 0.1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
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
  color: #064e3b;
  margin: 0;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #047857;
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

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.input-label {
  font-weight: 800;
  color: #064e3b;
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
  height: 60px;
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
  font-weight: 700;
  color: #0f172a;
  outline: none;
}

.text-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.activity-select {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  padding: 0;
  cursor: pointer;
  background-image: none;
}

.activity-select:invalid {
  color: #94a3b8;
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
  background: #ecfdf5;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #a7f3d0;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  flex-shrink: 0;
}

.success-text {
  font-size: 1.15rem;
  color: #065f46;
  line-height: 1.5;
}

.highlight-text {
  font-size: 1.25rem;
  font-weight: 900;
  color: #047857;
  background: white;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  margin: 0 0.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.photo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #d1fae5;
  color: #059669;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 800;
  margin-left: 0.5rem;
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
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
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

/* List View (Activities) */
.days-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-row {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.day-row:hover {
  transform: translateX(4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.day-date-col {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  flex-shrink: 0;
}

.day-number {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1e293b;
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

.day-activity-col {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: #064e3b;
}

.photo-status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #d1fae5;
  color: #059669;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
}

.empty-text {
  color: #b45309;
  font-weight: 600;
  font-style: italic;
}
.missed-text {
  color: #b91c1c;
  font-weight: 600;
}
.locked-text {
  color: #94a3b8;
  font-weight: 600;
}

.day-status-col {
  width: 150px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.status-paraf {
  font-size: 0.9rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.status-paraf.good {
  background: #ecfdf5;
  color: #10b981;
}

.status-icon {
  font-size: 1.8rem;
}
.status-icon.waiting {
  color: #f59e0b;
}
.status-icon.missed {
  color: #ef4444;
}
.status-icon.locked {
  color: #cbd5e1;
}

/* Day Row Variants */
.day-row.is-today {
  border: 2px solid #f59e0b;
  background: #fffbeb;
}
.day-row.is-filled {
  border-left: 6px solid #10b981;
}
.day-row.is-missed {
  background: #fef2f2;
  border-color: #fecaca;
  opacity: 0.9;
}
.day-row.is-future {
  opacity: 0.6;
  background: #f8fafc;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
  }

  .day-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .day-status-col {
    width: 100%;
    justify-content: flex-start;
  }
}

/* Standardized Buttons */
.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  box-shadow: 0 8px 15px -8px rgba(245, 158, 11, 0.5);
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
  box-shadow: 0 12px 20px -8px rgba(245, 158, 11, 0.6);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-outline {
  background: transparent;
  color: #f59e0b;
  border: 2px solid #f59e0b;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #f59e0b;
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
  background: #f59e0b;
  color: white;
}
</style>
