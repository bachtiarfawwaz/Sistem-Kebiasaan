<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const isDarkMode = ref(false);
const router = useRouter();
const sessionCookie = useCookie("user_session");

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (import.meta.client) {
    if (isDarkMode.value) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("orangtua-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("orangtua-theme", "light");
    }
  }
};

const showLogoutModal = ref(false);
const supabase = useSupabase();

const handleLogout = () => {
  showLogoutModal.value = true;
};

const performLogout = async () => {
  showLogoutModal.value = false;
  try {
    await supabase.auth.signOut();
  } catch (err) {}
  sessionCookie.value = null;
  router.push("/Login");
};

const userName = ref("");

onMounted(async () => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem("orangtua-theme");
    if (savedTheme === "dark") {
      isDarkMode.value = true;
      document.body.classList.add("dark-theme");
    }

    // Fetch user name
    if (
      sessionCookie.value &&
      sessionCookie.value.id &&
      sessionCookie.value.role === "orangtua"
    ) {
      const { data } = await supabase
        .from("orang_tua")
        .select("nama")
        .eq("user_id", sessionCookie.value.id)
        .single();
      if (data && data.nama) {
        userName.value = data.nama.split(" ")[0];
      }
    }
  }
});
</script>

<template>
  <div class="layout-orangtua">
    <header class="navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <img src="/logo.png" alt="KAIH Logo" class="logo" />
        </div>

        <div class="navbar-right">
          <nav class="desktop-nav">
            <NuxtLink
              to="/Orangtua/Dashboard"
              class="nav-item hide-mobile"
              exact-active-class="active"
            >
              <Icon name="ph:house" class="nav-icon" />
              <span class="nav-text">Home</span>
            </NuxtLink>

            <NuxtLink
              to="/Orangtua/Laporan"
              class="nav-item hide-mobile"
              exact-active-class="active"
            >
              <Icon name="ph:calendar-blank" class="nav-icon" />
              <span class="nav-text">Laporan</span>
            </NuxtLink>

            <NuxtLink
              to="/Orangtua/Akun"
              class="user-profile-badge hide-mobile"
              exact-active-class="active"
            >
              <Icon name="ph:user-circle-duotone" class="profile-icon" />
              <span class="profile-name">{{ userName || "Akun" }}</span>
              <span class="role-dot" v-if="userName"></span>
            </NuxtLink>
          </nav>

          <button
            class="nav-item icon-only logout hide-mobile"
            title="Keluar"
            @click="handleLogout"
          >
            <Icon name="ph:sign-out" class="nav-icon" />
          </button>

          <button
            class="nav-item icon-only"
            title="Ganti Tema"
            @click="toggleDarkMode"
          >
            <Icon :name="isDarkMode ? 'ph:moon' : 'ph:moon'" class="nav-icon" />
          </button>
        </div>
      </div>
    </header>

    <!-- Tempat komponen halaman (seperti Dashboard, dll) akan ditampilkan -->
    <main class="main-content-wrapper">
      <slot />
    </main>

    <AppFooter />

    <!-- ChatBot AI Asisten -->
    <ChatBot />

    <!-- Mobile Bottom Navigation (Floating Dock) -->
    <nav class="mobile-bottom-nav">
      <NuxtLink
        to="/Orangtua/Dashboard"
        class="mobile-nav-item nav-home"
        exact-active-class="active"
      >
        <Icon name="ph:house" class="nav-icon-mobile" />
        <span class="nav-label">Home</span>
      </NuxtLink>

      <NuxtLink
        to="/Orangtua/Laporan"
        class="mobile-nav-item nav-laporan"
        exact-active-class="active"
      >
        <Icon name="ph:calendar-blank" class="nav-icon-mobile" />
        <span class="nav-label">Laporan</span>
      </NuxtLink>

      <NuxtLink
        to="/Orangtua/Akun"
        class="mobile-nav-item nav-profil"
        exact-active-class="active"
      >
        <Icon name="ph:user" class="nav-icon-mobile" />
        <span class="nav-label">Profil</span>
      </NuxtLink>

      <button
        class="mobile-nav-item logout-mobile"
        title="Keluar"
        @click="handleLogout"
      >
        <Icon name="ph:sign-out" class="nav-icon-mobile" />
        <span class="nav-label">Keluar</span>
      </button>
    </nav>
    <LogoutModal
      :show="showLogoutModal"
      @cancel="showLogoutModal = false"
      @confirm="performLogout"
    />
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.layout-orangtua {
  font-family: "Nunito", sans-serif;
  min-height: 100vh;
  background-color: #f1f5f9;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.layout-orangtua * {
  box-sizing: border-box;
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  max-width: 1440px;
  margin: 0 auto;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #475569;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
  background: transparent;
}

.nav-item:hover {
  color: #10b981;
}

.nav-item.active {
  background: #ecfdf5;
  color: #10b981;
}

.nav-item.active .nav-icon {
  color: #10b981;
}

.nav-icon {
  font-size: 1.3rem;
  transition: all 0.2s ease;
}

.icon-only {
  padding: 0.6rem;
  border-radius: 50%;
}

.logout-mobile {
  color: #ef4444;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.user-profile-badge:hover {
  background: #e2e8f0;
}

.user-profile-badge.active {
  background: #ecfdf5;
  border-color: #10b981;
}

.profile-icon {
  font-size: 1.2rem;
  color: #3b82f6;
}

.profile-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
}

.role-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  margin-left: 2px;
}

body.dark-theme .user-profile-badge {
  background: #1e293b;
  border-color: #334155;
}

body.dark-theme .profile-name {
  color: #cbd5e1;
}

.logout:hover {
  color: #ef4444;
}

.main-content-wrapper {
  padding: 2.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

/* Dynamic Floating Dock */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  padding: 0.6rem 1.8rem;
  border-radius: 100px;
  box-shadow:
    0 10px 40px -10px rgba(0, 0, 0, 0.15),
    0 4px 10px -5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  align-items: center;
  gap: 2rem;
  width: max-content; /* Key for the dock look */
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.mobile-nav-item {
  color: #94a3b8;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.3rem 0.5rem;
  gap: 0.25rem;
}

.nav-icon-mobile {
  font-size: 1.4rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
}

.mobile-nav-item:hover, .mobile-nav-item.active {
  transform: translateY(-2px);
}

.nav-home:hover, .nav-home.active {
  color: #3b82f6; /* Blue */
}

.nav-laporan:hover, .nav-laporan.active {
  color: #8b5cf6; /* Violet */
}

.nav-profil:hover, .nav-profil.active {
  color: #f59e0b; /* Amber */
}

.logout-mobile:hover {
  color: #ef4444; /* Red */
}

@media (min-width: 769px) {
  .layout-orangtua {
    padding-bottom: 0;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }
  .hide-mobile {
    display: none !important;
  }
  .mobile-bottom-nav {
    display: flex;
  }
  .main-content-wrapper {
    padding: 1.5rem 1rem;
  }
}
</style>

<style>
/* Global Responsive Fixes untuk Halaman Habit di HP (Memaksa agar konten menyesuaikan layar) */
@media (max-width: 480px) {
  .page-container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .hero-card {
    padding: 1.5rem 1rem !important;
    border-radius: 20px !important;
  }

  .hero-title {
    font-size: 1.8rem !important;
  }

  .today-action-area {
    padding: 1.5rem 1rem !important;
  }

  .time-input-wrapper {
    min-width: 0 !important;
    width: 100% !important;
  }

  .btn-primary {
    padding: 0.8rem 1rem !important;
    font-size: 0.95rem !important;
    white-space: normal !important;
    height: auto !important;
    text-align: center !important;
    width: 100% !important;
    justify-content: center !important;
  }

  .success-badge {
    flex-direction: column !important;
    text-align: center !important;
    padding: 1rem !important;
  }

  .action-buttons {
    flex-direction: column !important;
    width: 100% !important;
  }

  .upload-area {
    padding: 1.5rem 1rem !important;
  }

  .input-group {
    flex-direction: column !important;
    align-items: stretch !important;
    text-align: center !important;
  }

  .input-icon {
    margin: 0 auto 0.5rem auto !important;
  }

  /* Tambahan untuk Bermasyarakat & Berolahraga */
  .activity-input-wrapper {
    min-width: 0 !important;
    width: 100% !important;
  }

  .form-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
  }

  .file-upload-wrapper {
    height: auto !important;
    min-height: 60px !important;
  }

  .file-upload-label {
    flex-wrap: wrap !important;
    padding: 1rem !important;
    text-align: center !important;
  }

  .upload-text {
    max-width: 100% !important;
    white-space: normal !important;
  }
}

/* Global Dark Mode Styles untuk Orangtua */
body.dark-theme .layout-orangtua {
  background-color: #0f172a;
  color: #f8fafc;
}
body.dark-theme .navbar {
  background: rgba(15, 23, 42, 0.95) !important;
  border-bottom: 1px solid #334155 !important;
}
body.dark-theme .nav-item {
  color: #cbd5e1 !important;
}
body.dark-theme .nav-item:hover {
  color: #34d399 !important;
}
body.dark-theme .nav-item.active {
  background: #064e3b !important;
  color: #34d399 !important;
}
body.dark-theme .nav-item.active .nav-icon {
  color: #34d399 !important;
}
body.dark-theme .nav-icon {
  color: #94a3b8 !important;
}

body.dark-theme .logout:hover {
  color: #ef4444 !important;
}

body.dark-theme .mobile-bottom-nav {
  background: #1e293b;
  border: 1px solid #334155;
}
body.dark-theme .mobile-nav-item {
  color: #94a3b8;
}
body.dark-theme .mobile-nav-item:hover,
body.dark-theme .mobile-nav-item.active {
  color: #34d399;
}
</style>
