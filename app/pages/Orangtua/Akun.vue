<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/Orangtua/Dashboard" class="btn-back">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </NuxtLink>
        <h1 class="page-title">Profil</h1>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="profile-content">
      <!-- Main Card: Profil Orang Tua & Data Siswa -->
      <div class="card main-card">
        <div class="card-cover"></div>
        <div class="card-body">
          <div class="card-profile-header">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                {{
                  parentForm.namaLengkap
                    ? parentForm.namaLengkap.charAt(0).toUpperCase()
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

          <h3 class="section-subtitle">Data Orang Tua</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nama Lengkap Orang Tua</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.namaLengkap"
                readonly
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.email"
                readonly
              />
            </div>
            <div class="form-group">
              <label>No. Hp</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.noHp"
                :readonly="!isEditing"
              />
            </div>
          </div>

          <hr class="section-divider" />

          <h3 class="section-subtitle">Data Siswa</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nama Lengkap Siswa</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.namaSiswa"
                readonly
              />
            </div>
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.tempatLahir"
                :readonly="!isEditing"
              />
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input
                type="date"
                class="form-input"
                v-model="parentForm.tanggalLahir"
                :readonly="!isEditing"
              />
            </div>

            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select
                class="form-input"
                v-model="parentForm.jenisKelamin"
                :disabled="!isEditing"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Agama</label>
              <select
                class="form-input"
                v-model="parentForm.agama"
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

            <div class="form-group">
              <label>Kelas</label>
              <select
                class="form-input"
                v-model="parentForm.kelas"
                :disabled="!isEditing"
              >
                <option value="">-- Pilih Kelas --</option>
                <option
                  v-for="k in daftarKelas"
                  :key="k.id"
                  :value="k.nama_kelas"
                >
                  {{ k.nama_kelas }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>NIS (Nomor Induk Siswa)</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.nis"
                :readonly="!isEditing"
              />
            </div>
            <div class="form-group">
              <label>No. Absen</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.noAbsen"
                :readonly="!isEditing"
              />
            </div>

            <div class="form-group full-width">
              <label>Alamat Siswa</label>
              <input
                type="text"
                class="form-input"
                v-model="parentForm.alamat"
                :readonly="!isEditing"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Side Card: Akun Siswa -->
      <div class="card side-card">
        <h2 class="side-card-title">Akun Siswa</h2>
        <div class="form-col">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              class="form-input"
              v-model="studentForm.username"
              :readonly="!isEditing"
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input
                :type="showStudentPassword ? 'text' : 'password'"
                class="form-input password-input"
                v-model="studentForm.password"
                :readonly="!isEditing"
              />
              <button
                type="button"
                class="toggle-password-btn"
                @click="showStudentPassword = !showStudentPassword"
                title="Tampilkan Password"
              >
                <Icon :name="showStudentPassword ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

definePageMeta({
  layout: "orangtua",
});

const supabase = useSupabase();
const isEditing = ref(false);
const showStudentPassword = ref(false);
const isLoading = ref(true);

const sessionCookie = useCookie("user_session");

// Data Session
const currentUser = ref(null);
const orangTuaId = ref(null);
const pesertaDidikId = ref(null);

// Data Referensi
const daftarKelas = ref([]);

const parentForm = ref({
  namaLengkap: "",
  tempatLahir: "",
  tanggalLahir: "",
  namaSiswa: "",
  alamat: "",
  noAbsen: "",
  nis: "",
  noHp: "",
  kelas: "",
  email: "",
  jenisKelamin: "",
  agama: "Islam",
});

const studentForm = ref({
  username: "",
  password: "",
});

const fetchProfileData = async () => {
  isLoading.value = true;
  try {
    const { data: listKelas } = await supabase.from("kelas").select("*");
    if (listKelas) daftarKelas.value = listKelas;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    currentUser.value = user;
    parentForm.value.email = user.email;

    // Load akun siswa dan profil dari metadata parent (hasil dari Daftar.vue)
    const meta = user.user_metadata || {};
    if (meta.student_username) {
      studentForm.value.username = meta.student_username;
      studentForm.value.password = meta.student_password;
    }
    if (meta.name) {
      parentForm.value.namaLengkap = meta.name;
    }
    if (meta.child_name) {
      parentForm.value.namaSiswa = meta.child_name;
    }

    const { data: orangTuaData, error: otError } = await supabase
      .from("orang_tua")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (orangTuaData) {
      orangTuaId.value = orangTuaData.id;
      // Prioritaskan nama dari database, jika tidak ada gunakan yang dari metadata
      parentForm.value.namaLengkap =
        orangTuaData.nama || parentForm.value.namaLengkap;
      parentForm.value.noHp = orangTuaData.no_hp || "";
    }

    if (orangTuaId.value) {
      const { data: pdData, error: pdError } = await supabase
        .from("peserta_didik")
        .select("*")
        .eq("orang_tua_id", orangTuaId.value)
        .single();

      if (pdData) {
        pesertaDidikId.value = pdData.id;
        // Prioritaskan nama dari database, jika tidak ada gunakan yang dari metadata
        parentForm.value.namaSiswa = pdData.nama || parentForm.value.namaSiswa;
        parentForm.value.noAbsen = pdData.no_absen || "";
        parentForm.value.nis = pdData.nis || "";
        parentForm.value.agama = pdData.agama || "Islam";
        parentForm.value.tempatLahir = pdData.tempat_lahir || "";
        parentForm.value.tanggalLahir = pdData.tanggal_lahir || "";
        parentForm.value.alamat = pdData.alamat || "";
        parentForm.value.jenisKelamin = pdData.jenis_kelamin || "";

        if (pdData.kelas_id) {
          const { data: kelasData } = await supabase
            .from("kelas")
            .select("nama_kelas")
            .eq("id", pdData.kelas_id)
            .single();
          if (kelasData) parentForm.value.kelas = kelasData.nama_kelas;
        }

        if (pdData.user_id) {
          const { data: userData } = await supabase
            .from("users")
            .select("email, password")
            .eq("id", pdData.user_id)
            .single();
          if (userData && userData.email) {
            // override jika di database ada
            studentForm.value.username = userData.email.replace(
              "@siswa.com",
              "",
            );
            studentForm.value.password =
              userData.password || studentForm.value.password;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  } finally {
    isLoading.value = false;
  }
};

const toggleEdit = async () => {
  if (isEditing.value) {
    // Mode Simpan
    await simpanProfil();
  } else {
    // Beralih ke mode edit
    isEditing.value = true;
  }
};

const simpanProfil = async () => {
  if (!currentUser.value) return;

  try {
    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const { error: pUserErr } = await supabase.from("users").upsert(
      {
        id: currentUser.value.id,
        email: currentUser.value.email,
        password: "password_terenkripsi_di_auth", // Placeholder karena auth asli ada di auth.users
        role: "orang_tua", // Sesuai dengan tipe data enum role yang mungkin ada
      },
      { onConflict: "id" },
    );

    if (pUserErr && !pUserErr.message.includes("duplicate key")) {
      await supabase.from("users").upsert(
        {
          id: currentUser.value.id,
          email: currentUser.value.email,
          password: "password_terenkripsi_di_auth",
          role: "orangtua",
        },
        { onConflict: "id" },
      );
    }

    const payloadOrangTua = {
      user_id: currentUser.value.id,
      nama: parentForm.value.namaLengkap,
      no_hp: parentForm.value.noHp,
    };

    let savedOrangTuaId = orangTuaId.value;

    if (savedOrangTuaId) {
      const { error: otErr } = await supabase
        .from("orang_tua")
        .update(payloadOrangTua)
        .eq("id", savedOrangTuaId);
      if (otErr) throw new Error("Gagal update orang tua: " + otErr.message);
    } else {
      const { data: newOt, error: otErr } = await supabase
        .from("orang_tua")
        .insert(payloadOrangTua)
        .select()
        .single();
      if (otErr) throw new Error("Gagal simpan orang tua: " + otErr.message);
      if (newOt) savedOrangTuaId = newOt.id;
    }
    orangTuaId.value = savedOrangTuaId;

    if (savedOrangTuaId && parentForm.value.namaSiswa) {
      let kelasId = null;
      if (parentForm.value.kelas) {
        const { data: kData } = await supabase
          .from("kelas")
          .select("id")
          .eq("nama_kelas", parentForm.value.kelas)
          .single();
        if (kData) kelasId = kData.id;
      }

      let studentUserId = null;
      const studentUsername =
        studentForm.value.username ||
        parentForm.value.namaSiswa.toLowerCase().replace(/\s+/g, "");
      const studentPassword = studentForm.value.password || "123456";

      if (pesertaDidikId.value) {
        const { error: pdErr } = await supabase
          .from("peserta_didik")
          .update({
            nama: parentForm.value.namaSiswa,
            no_absen: parentForm.value.noAbsen,
            nis: parentForm.value.nis,
            agama: parentForm.value.agama,
            kelas_id: kelasId,
            tempat_lahir: parentForm.value.tempatLahir,
            tanggal_lahir: parentForm.value.tanggalLahir || null,
            alamat: parentForm.value.alamat,
            jenis_kelamin: parentForm.value.jenisKelamin,
          })
          .eq("id", pesertaDidikId.value);
        if (pdErr)
          throw new Error("Gagal update peserta didik: " + pdErr.message);
      } else {
        const { data: newUser, error: userErr } = await supabase
          .from("users")
          .upsert(
            {
              email: studentUsername, // Kita simpan username di kolom email public.users
              password: studentPassword,
              role: "siswa",
            },
            { onConflict: "email" },
          )
          .select()
          .single();

        if (userErr)
          throw new Error("Gagal buat baris akun siswa: " + userErr.message);
        if (newUser) studentUserId = newUser.id;

        const { data: newPd, error: newPdErr } = await supabase
          .from("peserta_didik")
          .insert({
            user_id: studentUserId,
            orang_tua_id: savedOrangTuaId,
            kelas_id: kelasId,
            nama: parentForm.value.namaSiswa,
            agama: parentForm.value.agama,
            no_absen: parentForm.value.noAbsen,
            nis: parentForm.value.nis,
            tempat_lahir: parentForm.value.tempatLahir,
            tanggal_lahir: parentForm.value.tanggalLahir || null,
            alamat: parentForm.value.alamat,
            jenis_kelamin: parentForm.value.jenisKelamin,
          })
          .select()
          .single();

        if (newPdErr)
          throw new Error("Gagal simpan peserta didik: " + newPdErr.message);
        if (newPd) pesertaDidikId.value = newPd.id;
      }
    }

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Profil dan Akun Siswa berhasil disimpan!",
      confirmButtonColor: "#4f46e5",
    });

    if (sessionCookie.value) {
      sessionCookie.value.agama = parentForm.value.agama;
    }

    isEditing.value = false;
    await fetchProfileData();
  } catch (err) {
    console.error("Error saving profile:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan",
      text: err.message || "Terjadi kesalahan saat menyimpan ke database.",
    });
  }
};

onMounted(() => {
  fetchProfileData();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.profile-container {
  font-family: "Nunito", sans-serif;
  max-width: 1100px;
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
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
}

/* Cards */
.card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.main-card {
  overflow: hidden; /* So the cover image border-radius matches the card */
}

.card-cover {
  height: 140px;
  background: #f8fafc;
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
}

.card-body {
  padding: 0 2.5rem 2.5rem 2.5rem;
}

.side-card {
  padding: 2.5rem;
  height: fit-content;
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
  background: #4f46e5;
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
  color: #4f46e5;
  border-color: #c7d2fe;
  background: #eef2ff;
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
  gap: 1.5rem 2.5rem;
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

.full-width {
  grid-column: 1 / -1;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 800;
  color: #4f46e5;
  margin: 0 0 1.2rem 0;
  display: flex;
  align-items: center;
}

.section-divider {
  border: 0;
  height: 1px;
  background: #e2e8f0;
  margin: 2.5rem 0;
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
.form-input[readonly],
.form-input[disabled] {
  background: #f1f5f9;
  color: #64748b;
  border-color: transparent;
  cursor: default;
}

.form-input:not([readonly]):not([disabled]):focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

select.form-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
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

.side-card-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.side-card-title::before {
  content: "";
  display: block;
  width: 4px;
  height: 24px;
  background: #4f46e5;
  border-radius: 4px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 2.8rem;
}

.toggle-password-btn {
  position: absolute;
  right: 0.8rem;
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  padding: 0;
}

.toggle-password-btn:hover {
  color: #0f172a;
}

/* Responsiveness */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-body,
  .side-card {
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
</style>
