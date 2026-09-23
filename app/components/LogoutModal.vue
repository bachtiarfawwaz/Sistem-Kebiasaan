<template>
  <div v-if="show" class="logout-modal-overlay" @click.self="handleCancel">
    <div class="logout-modal-content">
      <div class="logout-icon-wrapper">
        <Icon name="ph:sign-out-bold" class="logout-icon" />
      </div>
      <h3 class="logout-title">Keluar Akun?</h3>
      <p class="logout-text">Apakah Anda yakin ingin keluar dari sistem?</p>
      <div class="logout-actions">
        <button class="btn-cancel" @click="handleCancel">Batal</button>
        <button class="btn-confirm" @click="handleConfirm">Ya, Keluar!</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["cancel", "confirm"]);

const handleCancel = () => {
  emit("cancel");
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<style scoped>
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.logout-modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
  padding: 2.5rem 2rem;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.logout-icon-wrapper {
  background: #fee2e2;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.logout-icon {
  font-size: 3rem;
  color: #ef4444;
}

.logout-title {
  margin: 0 0 1rem 0;
  color: #0f172a;
  font-size: 1.6rem;
  font-weight: 800;
}

.logout-text {
  color: #475569;
  margin: 0 0 2rem 0;
  line-height: 1.5;
  font-size: 1.05rem;
}

.logout-actions {
  display: flex;
  gap: 1rem;
}

.logout-actions button {
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #ef4444;
  color: white;
}

.btn-confirm:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
}

/* Dark mode */
:global(body.dark-theme) .logout-modal-overlay {
  background: rgba(15, 23, 42, 0.8);
}
:global(body.dark-theme) .logout-modal-content {
  background: #1e293b;
}
:global(body.dark-theme) .logout-title {
  color: #f1f5f9;
}
:global(body.dark-theme) .logout-text {
  color: #94a3b8;
}
:global(body.dark-theme) .btn-cancel {
  background: #334155;
  color: #cbd5e1;
}
:global(body.dark-theme) .btn-cancel:hover {
  background: #475569;
}
</style>
