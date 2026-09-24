<template>
  <div
    class="chatbot-wrapper"
    :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
  >
    <!-- Tombol Mengambang (FAB) -->
    <button
      class="chatbot-fab"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="toggleChat"
      :class="{ 'is-open': isOpen }"
      title="Tanya AI Asisten"
    >
      <Icon v-if="!isOpen" name="ph:robot-duotone" class="fab-icon" />
      <Icon v-else name="ph:x-bold" class="fab-icon" />
    </button>

    <!-- Jendela Chat -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-info">
            <div class="bot-avatar">
              <Icon name="ph:robot-bold" class="avatar-icon" />
            </div>
            <div>
              <h3 class="bot-name">Asisten KAIH</h3>
              <p class="bot-status connected">Asisten KAIH Online</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn" @click="toggleChat" title="Minimalisir">
              <Icon name="ph:minus-bold" />
            </button>
          </div>
        </div>

        <!-- Body / Messages -->
        <div class="chat-body" ref="chatBody">
          <div class="message bot-message">
            Halo Ayah/Bunda! Ada yang bisa saya bantu terkait perkembangan
            ananda atau penggunaan aplikasi KAIH hari ini?
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="[
              'message',
              msg.sender === 'user' ? 'user-message' : 'bot-message',
            ]"
          >
            <div class="message-content">{{ msg.text }}</div>
            <div class="message-meta">{{ msg.time }}</div>
          </div>

          <div v-if="isTyping" class="message bot-message typing-indicator">
            <div class="typing-text">Sedang mengetik<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
          </div>
        </div>

        <!-- Footer / Input -->
        <div class="chat-footer">
          <input
            type="text"
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Ketik pesan Anda di sini..."
            class="chat-input"
            :disabled="isInputDisabled"
          />
          <button
            class="send-btn"
            @click="sendMessage"
            :disabled="!newMessage.trim() || isInputDisabled"
          >
            <Icon name="ph:paper-plane-right-fill" class="send-icon" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

const isOpen = ref(false);
const newMessage = ref("");
const isTyping = ref(false);
const chatBody = ref(null);

const isInputDisabled = ref(false);

const messages = ref([]);

// Dragging logic
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const startPosition = ref({ x: 0, y: 0 });
let draggedDistance = 0;

const startDrag = (e) => {
  isDragging.value = true;
  draggedDistance = 0;

  const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

  dragStart.value = { x: clientX, y: clientY };
  startPosition.value = { x: position.value.x, y: position.value.y };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  if (e.cancelable) e.preventDefault();

  const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

  const dx = clientX - dragStart.value.x;
  const dy = clientY - dragStart.value.y;

  draggedDistance = Math.abs(dx) + Math.abs(dy);

  position.value.x = startPosition.value.x + dx;
  position.value.y = startPosition.value.y + dy;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", stopDrag);
};

const toggleChat = (e) => {
  if (draggedDistance > 5) {
    if (e && e.preventDefault) e.preventDefault();
    return;
  }
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollToBottom();
  }
};

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Send message to AI
const sendMessage = async () => {
  if (!newMessage.value.trim() || isInputDisabled.value) return;

  const userText = newMessage.value;
  const time = formatTime();
  messages.value.push({ sender: "user", text: userText, time });
  newMessage.value = "";
  scrollToBottom();

  isTyping.value = true;
  isInputDisabled.value = true;

  try {
    const response = await $fetch("/api/generate", {
      method: "POST",
      body: {
        prompt: userText,
      },
    });

    isTyping.value = false; // Matikan indikator "..."

    if (response && response.response) {
      const botMsg = {
        sender: "bot",
        text: "",
        time: formatTime(),
      };
      messages.value.push(botMsg);
      
      const fullText = response.response;
      let i = 0;
      
      // Fungsi rekursif untuk efek mengetik
      const typeWriter = () => {
        if (i < fullText.length) {
          botMsg.text += fullText.charAt(i);
          i++;
          scrollToBottom();
          setTimeout(typeWriter, 15); // Kecepatan mengetik 15ms per karakter
        } else {
          isInputDisabled.value = false; // Aktifkan input kembali setelah selesai mengetik
        }
      };
      
      typeWriter();
      
    } else {
      throw new Error("Format respon tidak sesuai");
    }
  } catch (error) {
    console.error("Chat error:", error);
    isTyping.value = false;
    messages.value.push({
      sender: "bot",
      text: `Maaf Ayah/Bunda, saya gagal terhubung dengan AI. Pastikan koneksi internet stabil atau coba lagi nanti.`,
      time: formatTime(),
    });
    isInputDisabled.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.chatbot-wrapper {
  font-family: "Nunito", sans-serif;
  position: fixed;
  bottom: 2rem;
  right: 2.5rem;
  z-index: 9999;
}

/* Floating Action Button */
.chatbot-fab {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 10px 25px rgba(67, 56, 202, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 15px 30px rgba(67, 56, 202, 0.5);
}

.chatbot-fab.is-open {
  background: #ef4444;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
}

.fab-icon {
  font-size: 2.2rem;
}

/* Chat Window */
.chat-window {
  position: absolute;
  bottom: 85px;
  right: 0;
  width: 380px;
  height: 520px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bot-avatar {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 1.8rem;
}

.bot-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.bot-status {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #dbeafe;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.bot-status::before {
  content: "";
  width: 8px;
  height: 8px;
  background: #ef4444; /* Default disconnected */
  border-radius: 50%;
  display: inline-block;
}

.bot-status.connected::before {
  background: #10b981; /* Connected green */
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.header-btn.active {
  background: rgba(255, 255, 255, 0.25);
}

/* Settings Panel */
.settings-panel {
  position: absolute;
  top: 75px; /* right below header */
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(10%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.settings-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-header h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.settings-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.settings-close:hover {
  color: #1e293b;
}

.settings-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

.settings-input,
.settings-select {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  color: #334155;
  outline: none;
  background-color: #ffffff;
  transition: all 0.2s;
}

.settings-input:focus,
.settings-select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.model-select-wrapper {
  position: relative;
}

.settings-help {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.test-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon.spinning {
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

.status-alert {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.status-alert.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.status-alert.warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.status-alert.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

/* Chat Body */
.chat-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
}

/* Messages */
.message {
  max-width: 85%;
  padding: 0.8rem 1.2rem;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.message-content {
  white-space: pre-wrap;
}

.message-meta {
  font-size: 0.7rem;
  align-self: flex-end;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.bot-message {
  align-self: flex-start;
  background: #ffffff;
  color: #334155;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid #e2e8f0;
}

.bot-message .message-meta {
  color: #64748b;
}

.user-message {
  align-self: flex-end;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.user-message .message-meta {
  color: #e0e7ff;
}

/* Typing Indicator */
.typing-text {
  display: flex;
  align-items: flex-end;
  font-weight: 500;
}
.typing-indicator .dot {
  display: inline-block;
  animation: typing 1.4s infinite;
  font-size: 1.2rem;
  line-height: 1;
}
.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* Chat Footer */
.chat-footer {
  padding: 1rem 1.2rem;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.chat-input {
  flex: 1;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 99px;
  padding: 0.8rem 1.2rem;
  font-family: inherit;
  font-size: 0.95rem;
  color: #334155;
  outline: none;
  transition: all 0.3s;
}

.chat-input:focus {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.chat-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.send-btn {
  background: #4f46e5;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: #4338ca;
  transform: scale(1.05);
}

.send-icon {
  font-size: 1.2rem;
}

/* Vue Transition for slide up */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* Dark Mode Styles */
body.dark-theme .chat-window {
  background: #1e293b;
  border-color: #334155;
}

body.dark-theme .chat-body {
  background: #0f172a;
}

body.dark-theme .bot-message {
  background: #1e293b;
  color: #f8fafc;
  border-color: #334155;
}

body.dark-theme .bot-message .message-meta {
  color: #cbd5e1;
}

body.dark-theme .chat-footer {
  background: #1e293b;
  border-top-color: #334155;
}

body.dark-theme .chat-input {
  background: #0f172a;
  color: #f8fafc;
}

body.dark-theme .chat-input:focus {
  border-color: #4f46e5;
}

body.dark-theme .settings-panel {
  background: #1e293b;
}

body.dark-theme .settings-header {
  border-bottom-color: #334155;
}

body.dark-theme .settings-header h4 {
  color: #f8fafc;
}

body.dark-theme .settings-close {
  color: #94a3b8;
}

body.dark-theme .settings-close:hover {
  color: #f8fafc;
}

body.dark-theme .form-group label {
  color: #cbd5e1;
}

body.dark-theme .settings-input,
body.dark-theme .settings-select {
  background-color: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}

body.dark-theme .settings-input:focus,
body.dark-theme .settings-select:focus {
  border-color: #6366f1;
}

body.dark-theme .test-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

body.dark-theme .test-btn:hover:not(:disabled) {
  background: #334155;
  color: #f8fafc;
}

body.dark-theme .settings-help {
  color: #94a3b8;
}

/* Mobile Adjustments */
@media (max-width: 480px) {
  .chatbot-wrapper {
    right: 1.5rem;
    bottom: 1.5rem;
  }
  .chat-window {
    width: calc(100vw - 3rem);
    height: 60vh;
    bottom: 75px;
    right: 0;
  }
}
</style>
