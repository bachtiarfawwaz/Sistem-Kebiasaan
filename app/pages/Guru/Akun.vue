<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/Guru/Dashboard" class="btn-back">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </NuxtLink>
        <h1 class="page-title">Profil</h1>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="profile-content">
      <!-- Main Card -->
      <div class="card main-card">
        <div class="card-cover"></div>
        <div class="card-body">
          <div class="card-profile-header">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                {{
                  guruForm.namaLengkap
                    ? guruForm.namaLengkap.charAt(0).toUpperCase()
                    : "-"
                }}
              </div>
            </div>
            <button
              class="settings-btn"
              :title="isEditing ? 'Simpan Profil' : 'Edit Profil'"
              @click="toggleEdit"
              :class="{ active: isEditing }"
            >
              <Icon
                :name="
                  isEditing
                    ? 'ph:floppy-disk-duotone'
                    : 'ph:pencil-simple-duotone'
                "
              />
            </button>
          </div>

          <div class="form-grid">
            <!-- Left Column -->
            <div class="form-col">
              <div class="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="guruForm.namaLengkap"
                  :readonly="!isEditing"
                />
              </div>
              <div class="form-group">
                <label>NIP</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="guruForm.nip"
                  :readonly="!isEditing"
                />
              </div>
              <div class="form-group">
                <label>Kelas yang Diampu</label>
                <!-- Tampilkan sebagai teks biasa jika sudah ditugaskan (tanpa panah dropdown) -->
                <input
                  v-if="hasAssignedClass"
                  type="text"
                  class="form-input"
                  :value="assignedClassName"
                  readonly
                  style="background-color: #f8fafc; color: #64748b"
                />

                <!-- Tampilkan dropdown jika belum ditugaskan sama sekali -->
                <select
                  v-else
                  class="form-input"
                  v-model="guruForm.kelas"
                  :disabled="!isEditing"
                >
                  <option value="">-- Pilih Kelas --</option>
                  <option v-for="k in listKelas" :key="k.id" :value="k.id">
                    {{ k.nama_kelas }}
                  </option>
                </select>
                <small
                  v-if="hasAssignedClass && isEditing"
                  style="
                    color: #ef4444;
                    font-size: 0.75rem;
                    display: block;
                    margin-top: 4px;
                  "
                  >Pemindahan kelas hanya bisa dilakukan oleh Admin.</small
                >
              </div>
              <div class="form-group">
                <label>Jenis Kelamin</label>
                <select
                  class="form-input"
                  v-model="guruForm.jenisKelamin"
                  :disabled="!isEditing"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nama sekolah</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="guruForm.namaSekolah"
                  :readonly="!isEditing"
                />
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-col">
              <div class="form-group">
                <label>Email</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="guruForm.email"
                  :readonly="!isEditing"
                />
              </div>
              <div class="form-group">
                <label>Alamat</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="guruForm.alamat"
                  :readonly="!isEditing"
                />
              </div>
              <div class="form-group">
                <label>Agama</label>
                <select
                  class="form-input"
                  v-model="guruForm.agama"
                  :disabled="!isEditing"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastState.show"
      class="toast-notification"
      :class="toastState.type"
    >
      <Icon
        :name="
          toastState.type === 'error'
            ? 'ph:warning-circle-fill'
            : 'ph:check-circle-fill'
        "
        class="toast-icon"
      />
      <span>{{ toastState.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: "guru",
});

const supabase = useSupabase();
const isEditing = ref(false);
const isLoading = ref(true);

const guruForm = ref({
  namaLengkap: "",
  nip: "",
  kelas: "",
  jenisKelamin: "Laki-laki",
  namaSekolah: "KAIH",
  email: "",
  alamat: "",
  agama: "Islam",
});

const listKelas = ref([]);
let currentGuruId = null;
let currentSekolahId = null;
const hasAssignedClass = ref(false);

const assignedClassName = computed(() => {
  const matchedKelas = listKelas.value.find(
    (k) => k.id === guruForm.value.kelas,
  );
  return matchedKelas ? matchedKelas.nama_kelas : "Belum ditugaskan";
});

const toastState = ref({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  toastState.value = { show: true, message, type };
  setTimeout(() => {
    toastState.value.show = false;
  }, 3000);
};

onMounted(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      guruForm.value.email = user.email;

      const { data: guruData } = await supabase
        .from("guru")
        .select("*, users!inner(email), sekolah(nama_sekolah)")
        .eq("users.email", user.email)
        .single();

      if (guruData) {
        if (guruData.user_id !== user.id) {
          await supabase
            .from("guru")
            .update({ user_id: user.id })
            .eq("id", guruData.id);
        }
        currentGuruId = guruData.id;
        currentSekolahId = guruData.sekolah_id;
        guruForm.value.namaLengkap = guruData.nama || "";
        guruForm.value.nip = guruData.nip || "";
        guruForm.value.jenisKelamin = guruData.jenis_kelamin || "Laki-laki";
        guruForm.value.namaSekolah =
          guruData.sekolah && guruData.sekolah.nama_sekolah
            ? guruData.sekolah.nama_sekolah
            : "Data Sekolah Kosong";
        guruForm.value.alamat = guruData.alamat || "";
        guruForm.value.agama = guruData.agama || "Islam";

        // Fetch semua kelas untuk dropdown
        const { data: semuaKelas } = await supabase
          .from("kelas")
          .select("id, nama_kelas");
        if (semuaKelas) listKelas.value = semuaKelas;

        // Fetch Kelas dari admin
        const { data: kelasData } = await supabase
          .from("kelas")
          .select("id, nama_kelas")
          .eq("wali_kelas_id", guruData.id)
          .single();
        if (kelasData) {
          guruForm.value.kelas = kelasData.id;
          hasAssignedClass.value = true;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  } finally {
    isLoading.value = false;
  }
});

const toggleEdit = async () => {
  if (isEditing.value) {
    // Mode Simpan
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("guru")
          .update({
            nama: guruForm.value.namaLengkap,
            nip: guruForm.value.nip,
            alamat: guruForm.value.alamat,
            jenis_kelamin: guruForm.value.jenisKelamin,
            agama: guruForm.value.agama,
          })
          .eq("id", currentGuruId);

        // Perbaikan untuk akun Guru lama yang belum memiliki sekolah_id
        let activeSekolahId = currentSekolahId;
        if (!activeSekolahId) {
          const { data: defaultSekolah } = await supabase
            .from("sekolah")
            .select("id")
            .limit(1)
            .single();

          if (defaultSekolah) {
            activeSekolahId = defaultSekolah.id;
          } else {
            const { data: newSekolah } = await supabase
              .from("sekolah")
              .insert({ nama_sekolah: "KAIH" })
              .select("id")
              .single();
            if (newSekolah) {
              activeSekolahId = newSekolah.id;
            }
          }

          if (activeSekolahId) {
            // Tautkan guru ini ke sekolah tersebut
            await supabase
              .from("guru")
              .update({ sekolah_id: activeSekolahId })
              .eq("id", currentGuruId);
            currentSekolahId = activeSekolahId;
          }
        }

        if (
          guruForm.value.namaSekolah &&
          guruForm.value.namaSekolah !== "Data Sekolah Kosong" &&
          activeSekolahId
        ) {
          await supabase
            .from("sekolah")
            .update({ nama_sekolah: guruForm.value.namaSekolah })
            .eq("id", activeSekolahId);
        }

        if (guruForm.value.kelas && currentGuruId && !hasAssignedClass.value) {
          // Pertama, hapus guru ini dari kelas lama (jika ada) agar tidak jadi wali di banyak kelas
          await supabase
            .from("kelas")
            .update({ wali_kelas_id: null })
            .eq("wali_kelas_id", currentGuruId);
          // Kemudian set sebagai wali kelas di kelas yang baru dipilih
          await supabase
            .from("kelas")
            .update({ wali_kelas_id: currentGuruId })
            .eq("id", guruForm.value.kelas);

          hasAssignedClass.value = true; // Setelah sukses memilih, kunci pilihan kelas
        }

        showToast("Profil berhasil disimpan!", "success");
        isEditing.value = false;
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      showToast("Gagal menyimpan profil", "error");
    }
  } else {
    // Masuk mode edit
    isEditing.value = true;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.profile-container {
  font-family: "Nunito", sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 0 4rem 0;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-bottom: 2.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
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

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

/* Content Layout */
.profile-content {
  width: 100%;
}

/* Cards */
.card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.main-card {
  overflow: hidden;
}

.card-cover {
  height: 140px;
  background: #f8fafc;
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
}

.card-body {
  padding: 0 3rem 3rem 3rem;
}

/* Avatar & Settings */
.card-profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -60px; /* Pulls the avatar up into the cover */
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.avatar-wrapper {
  position: relative;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  border: 6px solid #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.settings-btn {
  background: white;
  border: 1px solid #e2e8f0;
  font-size: 1.4rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px; /* Aligns with the middle of the avatar roughly */
}

.settings-btn:hover {
  color: #3b82f6;
  border-color: #bfdbfe;
  background: #eff6ff;
  transform: translateY(-2px);
}

.settings-btn.active {
  color: #10b981;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

/* Forms */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 4rem; /* 4rem gap between columns */
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  font-weight: 700;
  color: #475569;
  font-size: 0.95rem;
}

/* Input Fields - Refined */
.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1.2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  outline: none;
  transition: all 0.3s ease;
}

/* State changes */
.form-input[readonly] {
  background: #f1f5f9;
  color: #64748b;
  border-color: transparent;
  cursor: default;
}

.form-input[disabled] {
  background: #f1f5f9;
  color: #64748b;
  border-color: transparent;
  cursor: default;
}

.form-input:not([readonly]):not([disabled]):focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

select.form-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: 1.2em;
  padding-right: 3rem;
  cursor: pointer;
}

select.form-input[disabled] {
  background-color: #f1f5f9;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: 1.2em;
  cursor: default;
}

/* Responsiveness */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .avatar-circle {
    width: 90px;
    height: 90px;
    font-size: 2rem;
  }

  .card-profile-header {
    margin-top: -45px;
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-weight: 700;
  color: #0f172a;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.toast-notification.success {
  border-left: 4px solid #10b981;
}
.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 1.5rem;
}
.toast-notification.success .toast-icon {
  color: #10b981;
}
.toast-notification.error .toast-icon {
  color: #ef4444;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
