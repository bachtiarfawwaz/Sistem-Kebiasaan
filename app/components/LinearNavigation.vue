<template>
  <div class="linear-navigation">
    <button v-if="prevLink" class="nav-btn prev-btn" @click="goToPrev">
      <Icon name="ph:arrow-left-bold" class="nav-icon" />
      <span class="nav-text">{{ prevText || 'Sebelumnya' }}</span>
    </button>
    <div v-else class="nav-spacer"></div>

    <button v-if="nextLink" class="nav-btn next-btn" @click="goToNext">
      <span class="nav-text">{{ nextText || 'Selanjutnya' }}</span>
      <Icon name="ph:arrow-right-bold" class="nav-icon" />
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  prevLink: {
    type: String,
    default: ''
  },
  prevText: {
    type: String,
    default: 'Sebelumnya'
  },
  nextLink: {
    type: String,
    default: ''
  },
  nextText: {
    type: String,
    default: 'Selanjutnya'
  }
})

const router = useRouter()

const goToPrev = () => {
  if (props.prevLink) {
    router.push(props.prevLink)
  }
}

const goToNext = () => {
  if (props.nextLink) {
    router.push(props.nextLink)
  }
}
</script>

<style scoped>
.linear-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
  margin-bottom: 2.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.prev-btn {
  background: #f8fafc;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.prev-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(-4px);
}

.next-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5);
  margin-left: auto;
}

.next-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 15px 25px -10px rgba(37, 99, 235, 0.6);
}

.nav-icon {
  font-size: 1.4rem;
}

/* Dark mode compatibility (jika sistem mendukung dark mode) */
body.dark-theme .linear-navigation {
  background: rgba(30, 41, 59, 0.95);
  border-color: #334155;
  box-shadow: 0 -10px 40px -10px rgba(0,0,0,0.5);
}

body.dark-theme .prev-btn {
  background: #0f172a;
  color: #94a3b8;
  border-color: #334155;
}

body.dark-theme .prev-btn:hover {
  background: #1e293b;
  border-color: #475569;
}

/* Responsiveness for Mobile Devices */
@media (max-width: 640px) {
  .linear-navigation {
    flex-direction: column-reverse;
    gap: 1rem;
    padding: 1.2rem;
  }
  
  .nav-btn {
    width: 100%;
    justify-content: center;
    margin-left: 0 !important;
  }
  
  .nav-spacer {
    display: none;
  }
}
</style>
