<template>
  <div class="loading-container">
    <Icon name="ph:spinner-gap-duotone" class="spinner" />
    <p>Memuat halaman ibadah...</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";

definePageMeta({
  layout: "orangtua",
});

const router = useRouter();
const sessionCookie = useCookie("user_session");

onMounted(() => {
  const agama = sessionCookie.value?.agama || "Islam";
  const agamaLower = agama.toLowerCase();

  const nonIslamReligions = [
    "kristen",
    "katholik",
    "katolik",
    "hindu",
    "budha",
    "buddha",
    "konghucu",
    "nonislam",
  ];

  // Periksa apakah agama mengandung salah satu kata kunci non-islam (contoh: "kristen protestan" mengandung "kristen")
  const isNonIslam = nonIslamReligions.some((r) => agamaLower.includes(r));

  if (isNonIslam) {
    router.push("/Orangtua/Ibadah/NonIslam");
  } else {
    router.push("/Orangtua/Ibadah/Islam");
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap");

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-family: "Nunito", sans-serif;
  color: #64748b;
  gap: 1rem;
}

.spinner {
  font-size: 3rem;
  color: #3b82f6;
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
</style>
