<template>
  <div class="login-page">
    <button class="theme-toggle-btn" @click="toggleDarkMode" title="Ganti Tema">
      <Icon :name="isDarkMode ? 'ph:sun-duotone' : 'ph:moon-duotone'" />
    </button>
    <div class="login-container">
      <!-- Logo Section -->
      <div class="logo-wrapper">
        <NuxtLink to="/">
          <img src="/logo.png" alt="KAIH Logo" class="logo" />
        </NuxtLink>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <h1 class="login-title">Log in</h1>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email atau Username</label>
            <div class="input-wrapper">
              <Icon name="ph:envelope-simple" class="input-icon" />
              <input
                type="text"
                id="email"
                v-model="email"
                class="form-input"
                placeholder="Masukkan email atau username Anda"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <Icon name="ph:lock-key" class="input-icon" />
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="form-input"
                placeholder="Masukkan password Anda"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input
                type="checkbox"
                v-model="rememberMe"
                class="checkbox-input"
              />
              <span class="checkbox-custom">
                <Icon
                  name="ph:check-bold"
                  class="check-icon"
                  v-if="rememberMe"
                />
              </span>
              <span class="remember-text">Ingat Saya</span>
            </label>
            <a href="#" @click.prevent="forgotPassword" class="forgot-password"
              >Lupa Password?</a
            >
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Log in</span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            Belum punya akun?
            <NuxtLink to="/Daftar" class="register-link"
              >Register di sini</NuxtLink
            >
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Dialog -->
    <div v-if="modalState.show" class="modal-overlay">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>{{ modalState.title }}</h2>
          <button class="btn-close" @click="modalState.show = false">
            <Icon name="ph:x-bold" />
          </button>
        </div>
        <div class="modal-body text-center">
          <div
            :style="{
              fontSize: '3rem',
              color: modalState.iconColor,
              marginBottom: '1rem',
            }"
          >
            <Icon :name="modalState.icon" />
          </div>
          <p
            style="font-size: 1.05rem; color: #475569"
            v-html="modalState.message"
          ></p>

          <div
            v-if="modalState.type === 'prompt'"
            style="margin-top: 1rem; text-align: left"
          >
            <label
              class="form-label"
              style="display: block; margin-bottom: 0.5rem"
              >{{ modalState.inputLabel }}</label
            >
            <input
              type="email"
              v-model="modalState.inputValue"
              class="modal-input"
              :placeholder="modalState.inputPlaceholder"
            />
            <p
              v-if="modalState.inputError"
              style="color: #ef4444; font-size: 0.85rem; margin-top: 0.5rem"
            >
              {{ modalState.inputError }}
            </p>
          </div>
        </div>
        <div class="modal-actions" style="justify-content: center">
          <button
            v-if="modalState.type === 'prompt'"
            class="btn-secondary"
            @click="modalState.show = false"
          >
            Batal
          </button>
          <button
            class="btn-primary"
            :style="{ backgroundColor: modalState.confirmBtnColor }"
            @click="handleModalConfirm"
          >
            {{ modalState.confirmBtnText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastState.show" class="toast-notification">
      <Icon
        name="ph:check-circle-fill"
        style="font-size: 1.5rem; color: #10b981"
      />
      <span>{{ toastState.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

definePageMeta({
  layout: false,
});

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (import.meta.client) {
    if (isDarkMode.value) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("landing-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("landing-theme", "light");
    }
  }
};

onMounted(() => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem("landing-theme");
    if (savedTheme === "dark") {
      isDarkMode.value = true;
      document.body.classList.add("dark-theme");
    }
  }
});

const supabase = useSupabase();
const router = useRouter();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const sessionCookie = useCookie("user_session");

const modalState = ref({
  show: false,
  type: "alert",
  icon: "ph:warning-circle-duotone",
  iconColor: "#ef4444",
  title: "",
  message: "",
  confirmBtnText: "OK",
  confirmBtnColor: "#2563eb",
  inputLabel: "",
  inputPlaceholder: "",
  inputValue: "",
  inputError: "",
  onConfirm: null,
});

const toastState = ref({
  show: false,
  message: "",
});

const showToast = (message) => {
  toastState.value = { show: true, message };
  setTimeout(() => {
    toastState.value.show = false;
  }, 2000);
};

const showAlert = (options) => {
  modalState.value = {
    ...modalState.value,
    show: true,
    type: "alert",
    confirmBtnText: "OK",
    confirmBtnColor: "#2563eb",
    ...options,
  };
};

const showPrompt = (options) => {
  modalState.value = {
    ...modalState.value,
    show: true,
    type: "prompt",
    inputValue: "",
    inputError: "",
    confirmBtnText: "OK",
    confirmBtnColor: "#2563eb",
    ...options,
  };
};

const handleModalConfirm = () => {
  if (modalState.value.type === "prompt") {
    if (!modalState.value.inputValue) {
      modalState.value.inputError = "Kolom ini wajib diisi!";
      return;
    }
  }

  if (modalState.value.onConfirm) {
    modalState.value.onConfirm(modalState.value.inputValue);
  } else {
    modalState.value.show = false;
  }
};

const handleLogin = async () => {
  isLoading.value = true;

  try {
    const isSiswa = !email.value.includes("@");
    const loginEmail = isSiswa ? `${email.value}@siswa.com` : email.value;

    let { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password.value,
    });

    // Auto-provisioning: Jika gagal login (Auth Supabase belum ada), coba cari di tabel public.users
    // Ini berlaku untuk Siswa (dibuat via Orangtua) maupun Guru/Admin (dibuat via Kelola Pengguna)
    if (error) {
      const { data: publicUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", isSiswa ? email.value : loginEmail)
        .eq("password", password.value)
        .single();

      if (publicUser) {
        // Akun terdaftar di database public, kita buatkan akun auth secara live agar dia bisa masuk
        const { data: signUpData, error: signUpErr } =
          await supabase.auth.signUp({
            email: loginEmail,
            password: password.value,
            options: { data: { role: publicUser.role } }, // Pakai role dari tabel public.users
          });
        if (!signUpErr && signUpData.user) {
          if (!signUpData.session) {
            showAlert({
              icon: "ph:warning-circle-duotone",
              iconColor: "#ef4444",
              title: "Email Belum Dikonfirmasi",
              message:
                'Akun berhasil didaftarkan di Auth, tetapi Supabase meminta konfirmasi email. Untuk keperluan Skripsi/Testing, <strong>mohon matikan fitur "Confirm Email"</strong> di menu Authentication > Providers > Email pada Dashboard Supabase Anda, lalu coba login lagi.',
            });
            isLoading.value = false;
            return;
          }

          // Kita set NULL dulu di tabel relasi agar tidak kena foreign key constraint error
          if (publicUser.role === "guru") {
            await supabase
              .from("guru")
              .update({ user_id: null })
              .eq("user_id", publicUser.id);
          } else if (publicUser.role === "orangtua") {
            await supabase
              .from("orang_tua")
              .update({ user_id: null })
              .eq("user_id", publicUser.id);
          } else if (publicUser.role === "siswa") {
            await supabase
              .from("peserta_didik")
              .update({ user_id: null })
              .eq("user_id", publicUser.id);
          }

          await supabase
            .from("users")
            .update({ id: signUpData.user.id })
            .eq("id", publicUser.id);

          // Pasang kembali relasi ke ID yang baru
          if (publicUser.role === "guru") {
            await supabase
              .from("guru")
              .update({ user_id: signUpData.user.id })
              .is("user_id", null);
          } else if (publicUser.role === "orangtua") {
            await supabase
              .from("orang_tua")
              .update({ user_id: signUpData.user.id })
              .is("user_id", null);
          } else if (publicUser.role === "siswa") {
            await supabase
              .from("peserta_didik")
              .update({ user_id: signUpData.user.id })
              .is("user_id", null);
          }

          data = signUpData;
          error = null;
        }
      }
    }

    if (error) {
      showAlert({
        icon: "ph:warning-circle-duotone",
        iconColor: "#ef4444",
        title: "Login Gagal",
        message:
          error.message === "Invalid login credentials"
            ? "Email atau password yang Anda masukkan salah."
            : error.message,
      });
      isLoading.value = false;
      return;
    }

    const userMetadata = data.user?.user_metadata || {};
    let userRole = userMetadata.role || "orangtua";
    if (isSiswa) userRole = "siswa";

    let userAgama = "Islam"; // Default fallback

    let needsProfileCompletion = false;
    try {
      if (userRole === "siswa") {
        const { data: pdData } = await supabase
          .from("peserta_didik")
          .select("agama")
          .eq("user_id", data.user.id)
          .single();
        if (pdData) {
          if (pdData.agama) userAgama = pdData.agama;
        } else {
          needsProfileCompletion = true;
        }
      } else if (userRole === "orangtua") {
        const { data: otData } = await supabase
          .from("orang_tua")
          .select("id")
          .eq("user_id", data.user.id)
          .single();
        if (otData) {
          const { data: pdData } = await supabase
            .from("peserta_didik")
            .select("agama")
            .eq("orang_tua_id", otData.id)
            .single();
          if (pdData && pdData.agama) userAgama = pdData.agama;
        } else {
          needsProfileCompletion = true;
        }
      }
    } catch (dbErr) {
      console.warn("Gagal menarik agama asli:", dbErr);
    }

    let redirectPath = "/Orangtua/Dashboard";
    if (userRole === "admin") {
      redirectPath = "/Admin/Dashboard";
    } else if (userRole === "guru") {
      redirectPath = "/Guru/Dashboard";
    } else if (userRole === "siswa") {
      redirectPath = needsProfileCompletion
        ? "/Siswa/Akun"
        : "/Siswa/Dashboard";
    } else if (userRole === "orangtua") {
      redirectPath = needsProfileCompletion
        ? "/Orangtua/Akun"
        : "/Orangtua/Dashboard";
    }

    sessionCookie.value = {
      email: data.user.email,
      role: userRole,
      agama: userAgama,
      id: data.user.id,
    };

    showToast("Login berhasil!");

    // Tunggu sedikit agar animasi toast terlihat sebelum pindah halaman
    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  } catch (err) {
    console.error("Login Error:", err);
    showAlert({
      icon: "ph:warning-circle-duotone",
      iconColor: "#ef4444",
      title: "Terjadi Kesalahan",
      message:
        "Tidak dapat terhubung ke server database. Silakan coba lagi nanti.",
    });
  } finally {
    isLoading.value = false;
  }
};

const forgotPassword = () => {
  showPrompt({
    icon: "ph:envelope-duotone",
    iconColor: "#2563eb",
    title: "Lupa Password?",
    message: "Masukkan email Anda yang telah terdaftar",
    inputLabel: "Email Anda",
    inputPlaceholder: "email@contoh.com",
    confirmBtnText: "Kirim Link Reset",
    onConfirm: (emailInput) => {
      modalState.value.show = false;
      setTimeout(() => {
        showAlert({
          icon: "ph:check-circle-duotone",
          iconColor: "#10b981",
          title: "Link Terkirim!",
          message: `Link untuk mengatur ulang kata sandi telah dikirim ke <strong>${emailInput}</strong>. Silakan cek kotak masuk email Anda.`,
        });
      }, 300);
    },
  });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.login-page {
  font-family: "Nunito", sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper {
  margin-bottom: 2rem;
  animation: slideDown 0.6s ease-out;
}

.logo {
  height: 80px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.login-card {
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2.5rem;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.1),
    0 10px 15px -3px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 700;
  color: #475569;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-family: "Nunito", sans-serif;
  font-size: 1rem;
  color: #0f172a;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #3b82f6;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background-color: white;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.check-icon {
  color: white;
  font-size: 0.8rem;
}

.remember-text {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 600;
  user-select: none;
}

.forgot-password {
  font-size: 0.9rem;
  color: #3b82f6;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 0.85rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-family: "Nunito", sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.btn-login:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-login:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
}

.register-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Demo Section Styles (Scoped) */
.demo-section {
  margin-top: 1.5rem;
  width: 100%;
}

.demo-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 1.25rem;
}

.demo-divider::before,
.demo-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.demo-divider:not(:empty)::before {
  margin-right: 0.75em;
}

.demo-divider:not(:empty)::after {
  margin-left: 0.75em;
}

.demo-divider span {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.demo-icon {
  font-size: 1.2rem;
}

/* Hover Colors based on Roles */
.admin-role:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.guru-role:hover {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.04);
}
.orangtua-role:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.04);
}
.siswa-role:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
}
</style>

<style>
/* Login Page Dark Mode Overrides */
.theme-toggle-btn {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: white;
  border: 1px solid #e2e8f0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #475569;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: 100;
}
.theme-toggle-btn:hover {
  background: #f8fafc;
  color: #3b82f6;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .theme-toggle-btn {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

body.dark-theme .login-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

body.dark-theme .login-card {
  background: rgba(30, 41, 59, 0.8);
  border-color: #334155;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

body.dark-theme .login-title {
  color: #f8fafc;
}
body.dark-theme .form-label {
  color: #cbd5e1;
}
body.dark-theme .remember-text {
  color: #cbd5e1;
}

body.dark-theme .checkbox-custom {
  background-color: #0f172a;
  border-color: #475569;
}

body.dark-theme .login-footer {
  color: #94a3b8;
}

body.dark-theme .theme-toggle-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}
body.dark-theme .theme-toggle-btn:hover {
  background: #334155;
  color: #f8fafc;
}

/* Demo Section Dark Mode Styles */
body.dark-theme .demo-divider::before,
body.dark-theme .demo-divider::after {
  border-bottom-color: #334155;
}

body.dark-theme .demo-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

body.dark-theme .admin-role:hover {
  border-color: #ef4444;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.12);
}
body.dark-theme .guru-role:hover {
  border-color: #10b981;
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.12);
}
body.dark-theme .orangtua-role:hover {
  border-color: #8b5cf6;
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.12);
}
body.dark-theme .siswa-role:hover {
  border-color: #3b82f6;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
}

/* Modal and Toast Overrides */
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
.modal-sm {
  max-width: 400px;
}
.text-center {
  text-align: center;
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
  font-family: inherit;
}
.btn-secondary:hover {
  background: #f8fafc;
  color: #0f172a;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.modal-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-family: "Nunito", sans-serif;
  font-size: 1rem;
  color: #0f172a;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  box-sizing: border-box;
}
.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

body.dark-theme .modal-content {
  background: #1e293b;
  border: 1px solid #334155;
}
body.dark-theme .modal-header {
  border-bottom-color: #334155;
}
body.dark-theme .modal-header h2 {
  color: #f8fafc;
}
body.dark-theme .btn-close {
  color: #94a3b8;
}
body.dark-theme .btn-close:hover {
  background: #334155;
  color: #f8fafc;
}
body.dark-theme .modal-actions {
  border-top-color: #334155;
}
body.dark-theme .btn-secondary {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}
body.dark-theme .btn-secondary:hover {
  background: #1e293b;
  color: #f8fafc;
}
body.dark-theme .modal-input {
  background: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}

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
  border-left: 4px solid #10b981;
}

body.dark-theme .toast-notification {
  background: #1e293b;
  color: #f8fafc;
  border-color: #10b981;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
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
</style>
