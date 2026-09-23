<template>
  <div class="page-container">
    <!-- Hero / Today's Input Section -->
    <div class="hero-card">
      <div class="hero-content">
        <div class="hero-icon-wrapper">
          <Icon name="ph:bowl-food-duotone" class="hero-icon" />
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Makan Sehat</h1>
          <p class="hero-subtitle">
            Bantu anak membiasakan pola makan bergizi dengan mencatat menu
            makanannya hari ini.
          </p>
        </div>
      </div>

      <!-- Tampilkan input hari ini HANYA jika bulan dan tahun yang dipilih adalah bulan saat ini -->
      <div v-if="isCurrentMonthView" class="today-action-area">
        <div class="today-input-section" v-if="!todayData.saved">
          <div class="form-header">
            <label class="input-label"
              >Catat makanan yang dimakan anak pada hari ini ({{
                todayFormatted
              }})</label
            >
            <p class="form-hint">
              Isi menu makanan, kosongkan jika tidak mengonsumsi.
            </p>
          </div>

          <div class="food-inputs-grid">
            <div class="food-input-group">
              <div class="food-icon-box nasi">
                <Icon name="ph:bowl-food-duotone" />
              </div>
              <select
                v-model="todayForm.nasi"
                class="modern-select food-select"
              >
                <option value="" disabled selected>Pilih Karbohidrat...</option>
                <option value="Tidak Konsumsi">Tidak Konsumsi</option>
                <option value="Nasi Putih">Nasi Putih</option>
                <option value="Nasi Merah">Nasi Merah</option>
                <option value="Kentang / Umbi">Kentang / Umbi</option>
                <option value="Roti / Gandum">Roti / Gandum</option>
                <option value="Mie / Pasta">Mie / Pasta</option>
              </select>
            </div>

            <div class="food-input-group">
              <div class="food-icon-box lauk">
                <Icon name="ph:fish-duotone" />
              </div>
              <select
                v-model="todayForm.lauk"
                class="modern-select food-select"
              >
                <option value="" disabled selected>Pilih Lauk Pauk...</option>
                <option value="Tidak Konsumsi">Tidak Konsumsi</option>
                <option value="Ayam / Unggas">Ayam / Unggas</option>
                <option value="Ikan / Seafood">Ikan / Seafood</option>
                <option value="Daging Sapi/Kambing">Daging Sapi/Kambing</option>
                <option value="Telur">Telur</option>
                <option value="Tahu / Tempe">Tahu / Tempe</option>
              </select>
            </div>

            <div class="food-input-group">
              <div class="food-icon-box sayur">
                <Icon name="ph:leaf-duotone" />
              </div>
              <select
                v-model="todayForm.sayur"
                class="modern-select food-select"
              >
                <option value="" disabled selected>Pilih Sayuran...</option>
                <option value="Tidak Konsumsi">Tidak Konsumsi</option>
                <option value="Sayur Bening / Sop">Sayur Bening / Sop</option>
                <option value="Tumis Sayur">Tumis Sayur</option>
                <option value="Lalapan / Mentah">Lalapan / Mentah</option>
                <option value="Sayur Bersantan">Sayur Bersantan</option>
              </select>
            </div>

            <div class="food-input-group">
              <div class="food-icon-box buah">
                <Icon name="ph:cherries-duotone" />
              </div>
              <select
                v-model="todayForm.buah"
                class="modern-select food-select"
              >
                <option value="" disabled selected>Pilih Buah-buahan...</option>
                <option value="Tidak Konsumsi">Tidak Konsumsi</option>
                <option value="Pisang">Pisang</option>
                <option value="Jeruk">Jeruk</option>
                <option value="Apel / Pir">Apel / Pir</option>
                <option value="Pepaya / Melon">Pepaya / Melon</option>
              </select>
            </div>

            <div class="food-input-group">
              <div class="food-icon-box susu">
                <Icon name="ph:coffee-duotone" />
              </div>
              <select
                v-model="todayForm.susu"
                class="modern-select food-select"
              >
                <option value="" disabled selected>Pilih Susu...</option>
                <option value="Tidak Konsumsi">Tidak Konsumsi</option>
                <option value="Susu Sapi (UHT/Biasa)">
                  Susu Sapi (UHT/Biasa)
                </option>
                <option value="Susu Kedelai/Almond">Susu Kedelai/Almond</option>
                <option value="Yogurt / Yakult">Yogurt / Yakult</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" @click="saveToday" :disabled="isSaving">
              <Icon
                :name="
                  isSaving ? 'ph:spinner-gap-bold' : 'ph:check-circle-bold'
                "
                class="btn-icon"
                :class="{ 'spin-icon': isSaving }"
              />
              {{ isSaving ? "Menyimpan..." : "Simpan Catatan Makan" }}
            </button>
          </div>
        </div>

        <div class="today-success-section" v-else>
          <div class="success-badge good">
            <Icon name="ph:seal-check-fill" class="success-icon" />
            <div class="success-text">
              <strong>Tersimpan!</strong> Catatan makanan sehat hari ini telah
              terisi.
              <div class="summary-tags">
                <span v-if="todayData.nasi" class="tag nasi"
                  >Nasi: {{ todayData.nasi }}</span
                >
                <span v-if="todayData.lauk" class="tag lauk"
                  >Lauk: {{ todayData.lauk }}</span
                >
                <span v-if="todayData.sayur" class="tag sayur"
                  >Sayur: {{ todayData.sayur }}</span
                >
                <span v-if="todayData.buah" class="tag buah"
                  >Buah: {{ todayData.buah }}</span
                >
                <span v-if="todayData.susu" class="tag susu"
                  >Susu: {{ todayData.susu }}</span
                >
              </div>
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
      prevLink="/Orangtua/Berolahraga"
      prevText="Sebelumnya (Olahraga)"
      nextLink="/Orangtua/GemarBelajar"
      nextText="Lanjut ke Belajar"
    />

    <!-- History / Book View Section (Table format as requested by the book) -->
    <div class="history-section">
      <div class="section-header">
        <div class="header-left">
          <div class="icon-box">
            <Icon name="ph:table-duotone" class="section-icon" />
          </div>
          <h2 class="section-title">
            Riwayat Makan Sehat {{ months[selectedMonth] }}
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

      <!-- Modern Table Layout -->
      <div class="table-container">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="8%" class="text-center">Tanggal</th>
                <th width="15%">Nasi</th>
                <th width="15%">Lauk</th>
                <th width="15%">Sayur</th>
                <th width="15%">Buah</th>
                <th width="15%">Susu</th>
                <th width="17%">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="day in days"
                :key="day.date"
                :class="{
                  'is-today': isToday(day.date),
                  'is-missed': isPastDate(day.date) && !day.saved,
                  'is-future': isFutureDate(day.date),
                }"
              >
                <td class="date-cell text-center">
                  <span class="date-num">{{ day.date }}</span>
                  <span class="today-badge" v-if="isToday(day.date)"
                    >Hari Ini</span
                  >
                </td>

                <!-- Food Columns -->
                <td
                  v-if="
                    day.saved || (!isFutureDate(day.date) && !isToday(day.date))
                  "
                >
                  <div class="food-text" v-if="day.nasi">{{ day.nasi }}</div>
                  <div class="food-dash" v-else>-</div>
                </td>
                <td v-else><div class="future-text">-</div></td>

                <td
                  v-if="
                    day.saved || (!isFutureDate(day.date) && !isToday(day.date))
                  "
                >
                  <div class="food-text" v-if="day.lauk">{{ day.lauk }}</div>
                  <div class="food-dash" v-else>-</div>
                </td>
                <td v-else><div class="future-text">-</div></td>

                <td
                  v-if="
                    day.saved || (!isFutureDate(day.date) && !isToday(day.date))
                  "
                >
                  <div class="food-text" v-if="day.sayur">{{ day.sayur }}</div>
                  <div class="food-dash" v-else>-</div>
                </td>
                <td v-else><div class="future-text">-</div></td>

                <td
                  v-if="
                    day.saved || (!isFutureDate(day.date) && !isToday(day.date))
                  "
                >
                  <div class="food-text" v-if="day.buah">{{ day.buah }}</div>
                  <div class="food-dash" v-else>-</div>
                </td>
                <td v-else><div class="future-text">-</div></td>

                <td
                  v-if="
                    day.saved || (!isFutureDate(day.date) && !isToday(day.date))
                  "
                >
                  <div class="food-text" v-if="day.susu">{{ day.susu }}</div>
                  <div class="food-dash" v-else>-</div>
                </td>
                <td v-else><div class="future-text">-</div></td>

                <!-- Status Column -->
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
          placeholder="Tuliskan catatan atau observasi terkait pola makan anak bulan ini..."
        ></textarea>
        <div class="catatan-footer">
          <button
            class="btn-secondary"
            @click="saveCatatanBulanan"
            :disabled="isSavingCatatan"
          >
            <Icon
              :name="
                isSavingCatatan ? 'ph:spinner-gap-bold' : 'ph:floppy-disk-back'
              "
              class="btn-icon"
              :class="{ 'spin-icon': isSavingCatatan }"
            />
            {{ isSavingCatatan ? "Menyimpan..." : "Simpan Catatan" }}
          </button>
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
const catatan = ref("");
const isSavingCatatan = ref(false);

const loadCatatanBulanan = async () => {
  if (!pesertaDidikId.value) return;
  try {
    const { data } = await supabase
      .from("catatan_orang_tua")
      .select("catatan")
      .eq("peserta_didik_id", pesertaDidikId.value)
      .eq("jenis_jurnal", "Makan Sehat & Bergizi")
      .eq("bulan", selectedMonth.value + 1)
      .eq("tahun", selectedYear.value)
      .maybeSingle();

    catatan.value = data ? data.catatan : "";
  } catch (err) {
    console.error(err);
  }
};

const saveCatatanBulanan = async () => {
  if (!pesertaDidikId.value) return;
  isSavingCatatan.value = true;
  try {
    const { data: existing } = await supabase
      .from("catatan_orang_tua")
      .select("id")
      .eq("peserta_didik_id", pesertaDidikId.value)
      .eq("jenis_jurnal", "Makan Sehat & Bergizi")
      .eq("bulan", selectedMonth.value + 1)
      .eq("tahun", selectedYear.value)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("catatan_orang_tua")
        .update({ catatan: catatan.value })
        .eq("id", existing.id);
    } else {
      await supabase.from("catatan_orang_tua").insert({
        peserta_didik_id: pesertaDidikId.value,
        jenis_jurnal: "Makan Sehat & Bergizi",
        bulan: selectedMonth.value + 1,
        tahun: selectedYear.value,
        catatan: catatan.value,
      });
    }
    alert("Catatan bulanan berhasil disimpan!");
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan catatan bulanan.");
  } finally {
    isSavingCatatan.value = false;
  }
};

const todayForm = ref({
  nasi: "",
  lauk: "",
  sayur: "",
  buah: "",
  susu: "",
});
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
    return dayObj || { saved: false, hasPhoto: false };
  }
  return { saved: false, hasPhoto: false };
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
    let menuData = { nasi: "", lauk: "", sayur: "", buah: "", susu: "" };

    if (harian) {
      const jk = listJurnalKebiasaan.find(
        (k) => k.jurnal_harian_id === harian.id,
      );
      if (jk) {
        saved = true;
        try {
          if (jk.keterangan) {
            menuData = JSON.parse(jk.keterangan);
          }
        } catch (e) {
          console.error("Error parsing makan sehat json");
        }
      }
    }

    newDays.push({
      date: i,
      nasi: menuData.nasi,
      lauk: menuData.lauk,
      sayur: menuData.sayur,
      buah: menuData.buah,
      susu: menuData.susu,
      hasPhoto: saved ? true : false,
      saved: saved,
      harianId: harian ? harian.id : null,
      jurnalKebiasaanId: saved
        ? listJurnalKebiasaan.find((k) => k.jurnal_harian_id === harian?.id)?.id
        : null,
    });
  }

  days.value = newDays;

  await loadCatatanBulanan();
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
    .ilike("nama_kebiasaan", "%makan%")
    .single();
  if (!masterKebiasaan) {
    const { data: newK } = await supabase
      .from("kebiasaan")
      .insert({ nama_kebiasaan: "Makan sehat & Bergizi" })
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
  const tf = todayForm.value;

  const isValidMenu =
    (tf.nasi && tf.nasi !== "Tidak Konsumsi") ||
    (tf.lauk && tf.lauk !== "Tidak Konsumsi") ||
    (tf.sayur && tf.sayur !== "Tidak Konsumsi") ||
    (tf.buah && tf.buah !== "Tidak Konsumsi") ||
    (tf.susu && tf.susu !== "Tidak Konsumsi");

  if (!isValidMenu) {
    alert(
      "Mohon pilih minimal satu jenis makanan yang benar-benar dikonsumsi anak.",
    );
    return;
  }

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

    const payloadJSON = {
      ...tf,
    };
    const jsonKeterangan = JSON.stringify(payloadJSON);

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

    dayObj.nasi = tf.nasi;
    dayObj.lauk = tf.lauk;
    dayObj.sayur = tf.sayur;
    dayObj.buah = tf.buah;
    dayObj.susu = tf.susu;
    dayObj.saved = true;
    alert("Data Makan Sehat berhasil disimpan!");
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Hero Section */
.hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border-radius: 28px;
  padding: 3rem;
  box-shadow: 0 20px 40px -15px rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(249, 115, 22, 0.1) 0%,
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
  box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2);
  flex-shrink: 0;
}

.hero-icon {
  font-size: 3.5rem;
  color: #f97316;
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

.form-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-label {
  font-weight: 800;
  color: #334155;
  font-size: 1.2rem;
}

.form-hint {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.food-inputs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.food-input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
}

.food-input-group:focus-within {
  border-color: #f97316;
  background: white;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
}

.food-icon-box {
  width: 48px;
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
}

.food-icon-box.nasi {
  background: #cbd5e1;
  color: #334155;
}
.food-icon-box.lauk {
  background: #fca5a5;
  color: #991b1b;
}
.food-icon-box.sayur {
  background: #86efac;
  color: #166534;
}
.food-icon-box.buah {
  background: #fde047;
  color: #854d0e;
}
.food-icon-box.susu {
  background: #bfdbfe;
  color: #1e3a8a;
}

.food-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.8rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
}

.food-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.food-select {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.8rem 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.food-select:invalid {
  color: #94a3b8;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

/* Success Badges */
.today-success-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.success-badge {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid transparent;
  width: 100%;
}

.success-badge.good {
  background: #fff7ed;
  border-color: #ffedd5;
  flex-direction: row;
  align-items: flex-start;
}
.success-badge.good .success-icon {
  color: #f97316;
  font-size: 2.5rem;
  margin-top: -0.2rem;
}
.success-badge.good .success-text {
  color: #9a3412;
  font-size: 1.1rem;
  flex: 1;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tag.nasi {
  color: #475569;
  border-left: 3px solid #cbd5e1;
}
.tag.lauk {
  color: #991b1b;
  border-left: 3px solid #fca5a5;
}
.tag.sayur {
  color: #166534;
  border-left: 3px solid #86efac;
}
.tag.buah {
  color: #854d0e;
  border-left: 3px solid #fde047;
}
.tag.susu {
  color: #1e3a8a;
  border-left: 3px solid #bfdbfe;
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
  background: #fff7ed;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f97316;
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
.modern-select:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  background-color: white;
}

/* Modern Table */
.table-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px; /* Force minimum width to prevent squeezing */
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
  padding: 1rem 1.2rem;
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
  background: #fff7ed;
  border-bottom: 1px solid #fed7aa;
  border-top: 1px solid #fed7aa;
}
.modern-table tr.is-missed td {
  opacity: 0.8;
  background: #fafafa;
}
.modern-table tr.is-future td {
  opacity: 0.5;
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
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
  background: #f97316;
  color: white;
}

.today-badge {
  font-size: 0.65rem;
  font-weight: 800;
  background: #10b981;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.food-text {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.food-dash {
  color: #cbd5e1;
  font-weight: 800;
  font-size: 1.2rem;
  padding-left: 1rem;
}

.future-text {
  color: #cbd5e1;
  padding-left: 1rem;
}

.status-cell {
  font-weight: 700;
  font-size: 0.9rem;
}
.status-paraf {
  color: #f97316;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-paraf svg {
  font-size: 1.2rem;
}
.status-waiting {
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-waiting svg {
  font-size: 1.2rem;
}
.status-missed {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-missed svg {
  font-size: 1.2rem;
}
.status-locked {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.status-locked svg {
  font-size: 1.2rem;
}

/* Catatan Section */
.catatan-section {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
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
  color: #f97316;
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
  border-color: #f97316;
  border-style: solid;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);
}
.catatan-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .hero-card,
  .today-action-area {
    padding: 1.5rem;
  }
  .food-input-group {
    min-width: 100%;
  }
}

/* Standardized Buttons */
.btn-primary {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
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
  box-shadow: 0 8px 15px -8px rgba(244, 63, 94, 0.5);
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
  box-shadow: 0 12px 20px -8px rgba(244, 63, 94, 0.6);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-outline {
  background: transparent;
  color: #f43f5e;
  border: 2px solid #f43f5e;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #f43f5e;
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
  background: #f43f5e;
  color: white;
}
</style>
