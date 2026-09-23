<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/Admin/Dashboard" class="btn-back">
          <Icon name="ph:arrow-left-bold" /> Kembali ke Dashboard
        </NuxtLink>
        <div>
          <h1 class="page-title">Kelola Pengguna</h1>
          <p class="page-subtitle">Manajemen data Guru, Orang Tua, dan Siswa</p>
        </div>
      </div>
      <button class="btn-primary" @click="tambahPengguna">
        <Icon name="ph:plus-bold" /> Tambah Pengguna
      </button>
    </div>

    <div class="content-card">
      <div class="table-toolbar">
        <div class="search-box">
          <Icon name="ph:magnifying-glass" class="search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            class="search-input"
            v-model="searchQuery"
          />
        </div>
        <div class="filter-group">
          <select class="modern-select" v-model="selectedRole">
            <option value="">Semua Peran</option>
            <option value="Admin">Admin</option>
            <option value="Guru">Guru</option>
            <option value="Orang Tua">Orang Tua</option>
            <option value="Siswa">Siswa</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Nama Pengguna</th>
              <th>Peran</th>
              <th>Email / Username</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="index">
              <td>
                <div class="user-cell">
                  <div class="avatar-small">{{ user.nama.charAt(0) }}</div>
                  <div class="user-info">
                    <strong>{{ user.nama }}</strong>
                    <span v-if="user.keterangan">{{ user.keterangan }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="getRoleClass(user.peran)">{{
                  user.peran
                }}</span>
              </td>
              <td class="text-gray">{{ user.kontak }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="user.aktif ? 'active' : 'inactive'"
                >
                  <span class="dot"></span>
                  {{ user.aktif ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons" v-if="!user.isSelf">
                  <button
                    class="btn-icon"
                    title="Edit"
                    @click="editPengguna(user)"
                  >
                    <Icon name="ph:pencil-simple" />
                  </button>
                  <button
                    class="btn-icon danger"
                    title="Hapus"
                    @click="hapusPengguna(user)"
                  >
                    <Icon name="ph:trash" />
                  </button>
                </div>
                <div v-else>
                  <span class="badge badge-gray" style="font-size: 0.75rem"
                    >Akun Anda</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span class="page-info"
          >Menampilkan {{ filteredUsers.length }} data</span
        >
        <div class="page-controls">
          <button class="btn-page" disabled>
            <Icon name="ph:caret-left-bold" />
          </button>
          <button class="btn-page active">1</button>
          <button class="btn-page" disabled>
            <Icon name="ph:caret-right-bold" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Pengguna -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru" }}</h2>
          <button class="btn-close" @click="showModal = false">
            <Icon name="ph:x-bold" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              v-model="form.nama"
              class="modern-input"
              placeholder="Nama Lengkap"
            />
          </div>
          <div class="form-group">
            <label>Peran</label>
            <select
              v-model="form.peran"
              class="modern-input"
              :disabled="
                isEdit &&
                (editingUser?.peran === 'Siswa' ||
                  editingUser?.peran === 'Orang Tua')
              "
            >
              <option value="Admin">Admin</option>
              <option value="Guru">Guru</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Siswa">Siswa</option>
            </select>
            <p
              v-if="
                isEdit &&
                (editingUser?.peran === 'Siswa' ||
                  editingUser?.peran === 'Orang Tua')
              "
              style="
                font-size: 0.82rem;
                color: #94a3b8;
                margin: 0.3rem 0 0;
                display: flex;
                align-items: center;
                gap: 4px;
              "
            >
              <Icon name="ph:lock-simple-fill" style="font-size: 0.9rem" />
              Peran
              <strong style="color: #64748b">{{ editingUser?.peran }}</strong>
              tidak dapat diubah karena terhubung ke data yang sudah ada.
            </p>
          </div>

          <div
            v-if="form.peran === 'Siswa' || form.peran === 'siswa'"
            class="form-group"
          >
            <label>Pilih Kelas (Opsional)</label>
            <select v-model="form.kelas_id" class="modern-input">
              <option value="">-- Belum Masuk Kelas --</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">
                {{ k.nama_kelas }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Email / Username</label>
            <input
              type="email"
              v-model="form.kontak"
              class="modern-input"
              placeholder="Email / Username"
            />
          </div>
          <div class="form-group">
            <label>{{
              isEdit ? "Password Baru (Opsional)" : "Password"
            }}</label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                class="modern-input"
                placeholder="Password"
                style="padding-right: 3rem"
              />
              <button
                class="toggle-password"
                @click="showPassword = !showPassword"
                type="button"
                :title="
                  showPassword ? 'Sembunyikan password' : 'Lihat password'
                "
              >
                <Icon
                  :name="
                    showPassword ? 'ph:eye-slash-duotone' : 'ph:eye-duotone'
                  "
                />
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showModal = false">
            Batal
          </button>
          <button class="btn-primary" @click="savePengguna">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 400px">
        <div class="modal-header">
          <h2>Hapus Pengguna?</h2>
          <button class="btn-close" @click="showDeleteModal = false">
            <Icon name="ph:x-bold" />
          </button>
        </div>
        <div class="modal-body text-center" style="text-align: center">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem">
            <Icon name="ph:warning-circle-duotone" />
          </div>
          <p style="font-size: 1.05rem; color: #475569">
            Apakah Anda yakin ingin menghapus pengguna
            <strong>{{ deleteTarget?.nama }}</strong
            >? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="modal-actions" style="justify-content: center">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Batal
          </button>
          <button
            class="btn-primary"
            style="background: #ef4444; box-shadow: none"
            @click="confirmHapus"
          >
            Ya, Hapus!
          </button>
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
  layout: "admin",
});

const supabase = useSupabase();

const users = ref([]);

const fetchUsers = async () => {
  try {
    const { data: usersData, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Ambil data nama dari masing-masing tabel relasi
    const [guruRes, otRes, pdRes] = await Promise.all([
      supabase.from("guru").select("user_id, nama"),
      supabase.from("orang_tua").select("user_id, nama"),
      supabase.from("peserta_didik").select("user_id, nama"),
    ]);

    const nameMap = {};
    if (guruRes.data)
      guruRes.data.forEach((g) => (nameMap[g.user_id] = g.nama));
    if (otRes.data) otRes.data.forEach((o) => (nameMap[o.user_id] = o.nama));
    if (pdRes.data) pdRes.data.forEach((p) => (nameMap[p.user_id] = p.nama));

    let fetchedUsers = [];
    if (usersData) {
      fetchedUsers = usersData.map((u) => {
        const roleRaw = (u.role || "").toLowerCase().replace(/[\s_]+/g, "");
        let peranLabel;
        if (roleRaw === "orangtua") peranLabel = "Orang Tua";
        else if (roleRaw === "guru") peranLabel = "Guru";
        else if (roleRaw === "siswa") peranLabel = "Siswa";
        else if (roleRaw === "admin") peranLabel = "Admin";
        else
          peranLabel = u.role
            ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
            : "Siswa";
        return {
          id: u.id,
          nama: nameMap[u.id] || u.email,
          keterangan: "",
          peran: peranLabel,
          kontak: u.email,
          aktif: true,
        };
      });
    }

    // Tambahkan Admin Utama (diri sendiri) ke daftar paling atas
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      fetchedUsers.unshift({
        id: authUser.id,
        nama: authUser.user_metadata?.name || "Administrator",
        keterangan: "Admin Utama",
        peran: "Admin",
        kontak: authUser.email,
        aktif: true,
        isSelf: true,
      });
    }

    users.value = fetchedUsers;
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

const searchQuery = ref("");
const selectedRole = ref("");
const kelasList = ref([]);
const orangTuaList = ref([]);

const fetchExtras = async () => {
  const { data: kData } = await supabase
    .from("kelas")
    .select("id, nama_kelas")
    .order("nama_kelas", { ascending: true });
  if (kData) kelasList.value = kData;

  const { data: oData } = await supabase
    .from("orang_tua")
    .select("id, nama, user_id");
  if (oData) {
    const { data: uData } = await supabase.from("users").select("id, email");
    if (uData) {
      oData.forEach((o) => {
        const user = uData.find((u) => u.id === o.user_id);
        o.user_email = user ? user.email : "";
      });
    }
    orangTuaList.value = oData;
  }
};

onMounted(() => {
  fetchUsers();
  fetchExtras();
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchRole =
      selectedRole.value === "" || user.peran === selectedRole.value;
    const matchSearch =
      user.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.kontak.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchRole && matchSearch;
  });
});

const showModal = ref(false);
const showDeleteModal = ref(false);
const isEdit = ref(false);
const editingUser = ref(null);
const deleteTarget = ref(null);
const showPassword = ref(false);
const form = ref({
  nama: "",
  peran: "Guru",
  kontak: "",
  password: "",
  kelas_id: "",
  orang_tua_id: "",
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

const getRoleClass = (role) => {
  if (role === "Admin") return "badge-red";
  if (role === "Guru") return "badge-purple";
  if (role === "Orang Tua") return "badge-blue";
  return "badge-orange";
};

const tambahPengguna = () => {
  isEdit.value = false;
  form.value = {
    nama: "",
    peran: "Guru",
    kontak: "",
    password: "",
    kelas_id: "",
    orang_tua_id: "",
  };
  showPassword.value = false;
  showModal.value = true;
};

const editPengguna = async (user) => {
  isEdit.value = true;
  editingUser.value = user;
  form.value = {
    nama: user.nama,
    peran: user.peran,
    kontak: user.kontak,
    password: "",
    kelas_id: "",
    orang_tua_id: "",
  };

  if (user.peran === "Siswa") {
    const { data: pdData } = await supabase
      .from("peserta_didik")
      .select("kelas_id, orang_tua_id")
      .eq("user_id", user.id)
      .single();
    if (pdData) {
      form.value.kelas_id = pdData.kelas_id || "";
      form.value.orang_tua_id = pdData.orang_tua_id || "";
    }
  }

  showPassword.value = false;
  showModal.value = true;
};

const savePengguna = async () => {
  if (!form.value.kontak) {
    showToast("Email/Username wajib diisi!", "error");
    return;
  }

  let roleFormatted = form.value.peran.toLowerCase();
  if (roleFormatted === "orang tua") roleFormatted = "orangtua";

  try {
    if (isEdit.value) {
      const updateData = {
        email: form.value.kontak,
        role: roleFormatted,
      };
      if (form.value.password) {
        updateData.password = form.value.password;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", editingUser.value.id);
      if (error) throw error;

      const { data: sekolahData } = await supabase
        .from("sekolah")
        .select("id")
        .limit(1)
        .single();
      const defaultSekolahId = sekolahData ? sekolahData.id : null;

      // Helper: check if row exists, then update or insert
      const updateOrInsertName = async (tableName) => {
        const { data: existing } = await supabase
          .from(tableName)
          .select("id")
          .eq("user_id", editingUser.value.id)
          .single();
        if (existing) {
          await supabase
            .from(tableName)
            .update({ nama: form.value.nama })
            .eq("user_id", editingUser.value.id);
        } else {
          const insertData = {
            user_id: editingUser.value.id,
            nama: form.value.nama,
          };
          if (defaultSekolahId && tableName === "guru")
            insertData.sekolah_id = defaultSekolahId;
          await supabase.from(tableName).insert(insertData);
        }
      };

      if (roleFormatted === "guru") {
        await updateOrInsertName("guru");
      } else if (roleFormatted === "orangtua") {
        await updateOrInsertName("orang_tua");
      } else if (roleFormatted === "siswa") {
        const { data: existing } = await supabase
          .from("peserta_didik")
          .select("id")
          .eq("user_id", editingUser.value.id)
          .single();
        if (existing) {
          await supabase
            .from("peserta_didik")
            .update({
              nama: form.value.nama,
              kelas_id: form.value.kelas_id || null,
              orang_tua_id: form.value.orang_tua_id || null,
            })
            .eq("user_id", editingUser.value.id);
        } else {
          await supabase.from("peserta_didik").insert({
            user_id: editingUser.value.id,
            nama: form.value.nama,
            kelas_id: form.value.kelas_id || null,
            orang_tua_id: form.value.orang_tua_id || null,
          });
        }
      }

      showToast("Data pengguna telah diperbarui.", "success");
    } else {
      if (!form.value.password) {
        showToast("Password wajib diisi untuk pengguna baru!", "error");
        return;
      }
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          email: form.value.kontak,
          password: form.value.password,
          role: roleFormatted,
        })
        .select()
        .single();
      if (error) throw error;

      if (newUser) {
        const { data: sekolahData } = await supabase
          .from("sekolah")
          .select("id")
          .limit(1)
          .single();
        const defaultSekolahId = sekolahData ? sekolahData.id : null;

        if (roleFormatted === "guru") {
          const insertData = { user_id: newUser.id, nama: form.value.nama };
          if (defaultSekolahId) insertData.sekolah_id = defaultSekolahId;
          await supabase.from("guru").insert(insertData);
        } else if (roleFormatted === "orangtua") {
          await supabase
            .from("orang_tua")
            .insert({ user_id: newUser.id, nama: form.value.nama });
        } else if (roleFormatted === "siswa") {
          await supabase.from("peserta_didik").insert({
            user_id: newUser.id,
            nama: form.value.nama,
            kelas_id: form.value.kelas_id || null,
            orang_tua_id: form.value.orang_tua_id || null,
          });
        }
      }

      showToast("Pengguna baru telah ditambahkan.", "success");
    }
    showModal.value = false;
    await fetchUsers();
  } catch (err) {
    console.error("Error saving user:", err);
    showToast("Gagal menyimpan pengguna", "error");
  }
};

const hapusPengguna = (user) => {
  deleteTarget.value = user;
  showDeleteModal.value = true;
};

const confirmHapus = async () => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", deleteTarget.value.id);
    if (error) throw error;
    showToast("Pengguna berhasil dihapus", "success");
    showDeleteModal.value = false;
    await fetchUsers();
  } catch (err) {
    console.error("Error deleting user:", err);
    showToast("Gagal menghapus pengguna", "error");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.admin-page {
  font-family: "Nunito", sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
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

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0.2rem 0 0 0;
  font-size: 1.05rem;
}

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

.btn-primary:hover {
  background: #2563eb;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

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

.search-box:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: #94a3b8;
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: inherit;
  color: #334155;
}

.modern-select {
  padding: 0.7rem 2.2rem 0.7rem 1.2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  transition: all 0.3s;
}

.modern-select:focus {
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.modern-table tr:hover td {
  background: #f8fafc;
}

.text-right {
  text-align: right;
}
.text-gray {
  color: #64748b;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  color: #0f172a;
  font-size: 1.05rem;
}

.user-info span {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Badges */
.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.badge-purple {
  background: #f3e8ff;
  color: #7e22ce;
}
.badge-blue {
  background: #e0f2fe;
  color: #0369a1;
}
.badge-orange {
  background: #ffedd5;
  color: #c2410c;
}
.badge-red {
  background: #fee2e2;
  color: #ef4444;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.status-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge.active {
  color: #10b981;
}
.status-badge.active .dot {
  background: #10b981;
  box-shadow: 0 0 0 3px #d1fae5;
}

.status-badge.inactive {
  color: #94a3b8;
}
.status-badge.inactive .dot {
  background: #94a3b8;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.btn-icon:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.btn-icon.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
}

.page-info {
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
}

.page-controls {
  display: flex;
  gap: 0.4rem;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-page:not([disabled]):hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-page.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-page[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    width: 100%;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
.toast-notification .toast-icon {
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
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Password Toggle Specific Styles */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .modern-input {
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #475569;
}
</style>
