<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-left">
        <img src="/logo.png" alt="KAIH Logo" class="footer-logo" />
        <span class="footer-brand"><strong>KAIH</strong></span>
        <span class="footer-divider">|</span>
        <span class="footer-tagline">Membangun Karakter Hebat</span>
      </div>

      <div class="footer-right">
        <p class="copyright">
          © {{ new Date().getFullYear() }} bachtiarfawwaz. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.app-footer {
  font-family: "Nunito", sans-serif;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 1.25rem 2rem;
  width: 100%;
  margin-top: auto;
  box-shadow: 0 -10px 30px -10px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

.app-footer * {
  box-sizing: border-box;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  height: 28px;
  object-fit: contain;
}

.footer-brand {
  color: #1e293b;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

.footer-brand strong {
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-divider {
  color: #cbd5e1;
  font-weight: 300;
  margin: 0 0.25rem;
}

.footer-tagline {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.footer-right {
  display: flex;
  align-items: center;
}

.copyright {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 1.25rem 1rem;
  }

  .footer-container {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .footer-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-divider {
    display: none;
  }

  .footer-logo {
    height: 36px;
    margin-bottom: 0.25rem;
  }
}
</style>

<style>
/* Global Dark Mode Overrides for Footer */
body.dark-theme .app-footer {
  background-color: #0f172a;
  border-top-color: #334155;
  box-shadow: 0 -10px 30px -10px rgba(0, 0, 0, 0.5);
}

body.dark-theme .footer-brand {
  color: #f8fafc;
}

body.dark-theme .footer-divider {
  color: #475569;
}

body.dark-theme .footer-tagline {
  color: #94a3b8;
}

body.dark-theme .copyright {
  color: #94a3b8;
}
</style>
