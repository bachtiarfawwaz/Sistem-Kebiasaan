<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
body.dark-theme {
  background-color: #0f172a;
}

/* Global Dark Mode Fixes for all pages (Akun, Laporan, 7 Habit) */
body.dark-theme .page-container {
  color: #f8fafc !important;
}

body.dark-theme .card,
body.dark-theme .main-card,
body.dark-theme .side-card,
body.dark-theme .table-container,
body.dark-theme .today-action-area,
body.dark-theme .section-header,
body.dark-theme .catatan-section,
body.dark-theme .hero-card {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .hero-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
}

body.dark-theme .page-title,
body.dark-theme .hero-title,
body.dark-theme .side-card-title,
body.dark-theme .catatan-header h3,
body.dark-theme .section-title {
  color: #f8fafc !important;
}

body.dark-theme .page-subtitle,
body.dark-theme .hero-subtitle,
body.dark-theme .time-label,
body.dark-theme label {
  color: #cbd5e1 !important;
}

body.dark-theme .form-input,
body.dark-theme .modern-select,
body.dark-theme .modern-textarea,
body.dark-theme .input-group {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .form-input[readonly] {
  background-color: #1e293b !important;
  color: #94a3b8 !important;
}

body.dark-theme .day-card {
  background: #0f172a !important;
  border-color: #334155 !important;
}
body.dark-theme .day-card.is-today {
  background: rgba(245, 158, 11, 0.15) !important;
  border-color: #d97706 !important;
}
body.dark-theme .day-card.is-future {
  background: #1e293b !important;
  opacity: 0.5 !important;
}

body.dark-theme .btn-secondary,
body.dark-theme .btn-outline,
body.dark-theme .back-btn,
body.dark-theme .settings-btn {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

body.dark-theme .btn-secondary:hover,
body.dark-theme .btn-outline:hover,
body.dark-theme .back-btn:hover,
body.dark-theme .settings-btn:hover {
  background-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .hero-icon-wrapper {
  background: #0f172a !important;
}

body.dark-theme .time-input {
  color: #f8fafc !important;
}

body.dark-theme .today-action-area.not-current-month {
  background: rgba(30, 41, 59, 0.7) !important;
}

body.dark-theme .today-action-area.not-current-month p {
  color: #cbd5e1 !important;
}

body.dark-theme .table-card {
  background: #1e293b !important;
  border-color: #334155 !important;
}

body.dark-theme .report-table th,
body.dark-theme .report-table td {
  border-color: #334155 !important;
}
body.dark-theme .report-table th {
  background-color: #0f172a !important;
  color: #f8fafc !important;
}

/* Modals & History Tables */
body.dark-theme .modal-content {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}
body.dark-theme .modal-header {
  background: #0f172a !important;
  border-bottom-color: #334155 !important;
}
body.dark-theme .modal-title {
  color: #f8fafc !important;
}
body.dark-theme .btn-close {
  color: #cbd5e1 !important;
}
body.dark-theme .btn-close:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
}
body.dark-theme .history-table th {
  background: #0f172a !important;
  color: #f8fafc !important;
  border-bottom-color: #334155 !important;
}
body.dark-theme .history-table td {
  border-bottom-color: #334155 !important;
  color: #cbd5e1 !important;
}
body.dark-theme .history-table tr:hover td {
  background-color: #334155 !important;
}

/* Avatars & Icon Boxes */
body.dark-theme .avatar-circle {
  border-color: #1e293b !important;
}
body.dark-theme .icon-box,
body.dark-theme .modal-icon-box {
  background: #0f172a !important;
}

/* Status & Success Badges */
body.dark-theme .success-badge.good,
body.dark-theme .time-badge.filled.good {
  background: rgba(16, 185, 129, 0.2) !important;
  border-color: #10b981 !important;
  color: #34d399 !important;
}
body.dark-theme .success-badge.good .success-text,
body.dark-theme .success-badge.good .highlight-time {
  color: #34d399 !important;
  background: transparent !important;
  box-shadow: none !important;
}

body.dark-theme .success-badge.warning,
body.dark-theme .time-badge.filled.warning {
  background: rgba(245, 158, 11, 0.2) !important;
  border-color: #f59e0b !important;
  color: #fbbf24 !important;
}
body.dark-theme .success-badge.warning .success-text,
body.dark-theme .success-badge.warning .highlight-time {
  color: #fbbf24 !important;
  background: transparent !important;
  box-shadow: none !important;
}

body.dark-theme .success-badge.danger,
body.dark-theme .time-badge.filled.danger {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #f87171 !important;
}
body.dark-theme .success-badge.danger .success-text,
body.dark-theme .success-badge.danger .highlight-time {
  color: #f87171 !important;
  background: transparent !important;
  box-shadow: none !important;
}

body.dark-theme .time-badge.empty,
body.dark-theme .time-badge.missed {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #f87171 !important;
}

/* Habit Page Specifics (Ibadah, Olahraga, dll) */
body.dark-theme .day-row,
body.dark-theme .summary-card,
body.dark-theme .prayer-checkbox-label,
body.dark-theme .file-upload-label {
  background: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .day-row:hover,
body.dark-theme .prayer-checkbox-label:hover,
body.dark-theme .file-upload-label:hover {
  background: #1e293b !important;
  border-color: #475569 !important;
}

body.dark-theme .day-row.is-today,
body.dark-theme .table-row.row-today {
  background: rgba(245, 158, 11, 0.15) !important;
  border-color: #d97706 !important;
}

body.dark-theme .day-row.is-missed,
body.dark-theme .table-row.row-missed {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

body.dark-theme .prayer-checkbox-label.is-checked,
body.dark-theme .file-upload-wrapper.has-file .file-upload-label {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: #10b981 !important;
}

body.dark-theme .day-number,
body.dark-theme .activity-text,
body.dark-theme .sum-value,
body.dark-theme .prayer-name {
  color: #f8fafc !important;
}

body.dark-theme .date-num {
  background: #1e293b !important;
  color: #f8fafc !important;
}

body.dark-theme .static-check {
  background: #1e293b !important;
}

body.dark-theme .table-wrapper {
  background: #1e293b !important;
  border-color: #334155 !important;
}

body.dark-theme .table-row {
  border-bottom-color: #334155 !important;
}

body.dark-theme .table-row:hover {
  background: #0f172a !important;
}

body.dark-theme .hero-card::before {
  opacity: 0.1 !important;
}

/* Makan Sehat & Bermasyarakat */
body.dark-theme .food-input-group,
body.dark-theme .food-input,
body.dark-theme .text-input {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .modern-table {
  background: #1e293b !important;
  color: #f8fafc !important;
}
body.dark-theme .modern-table th {
  background: #0f172a !important;
  color: #f8fafc !important;
  border-bottom-color: #334155 !important;
}
body.dark-theme .modern-table td {
  border-bottom-color: #334155 !important;
}
body.dark-theme .modern-table tr:hover td {
  background: #334155 !important;
}
body.dark-theme .modern-table tr.is-today td {
  background: rgba(245, 158, 11, 0.15) !important;
  border-color: #d97706 !important;
}
body.dark-theme .modern-table tr.is-missed td {
  background: rgba(239, 68, 68, 0.1) !important;
}
body.dark-theme .modern-table tr.is-future td {
  background: #1e293b !important;
}

body.dark-theme .food-text {
  background: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .activity-cell,
body.dark-theme .food-dash,
body.dark-theme .future-text,
body.dark-theme .empty-text {
  color: #cbd5e1 !important;
}

body.dark-theme .status-waiting {
  color: #fbbf24 !important;
}
body.dark-theme .status-missed {
  color: #f87171 !important;
}
body.dark-theme .status-locked {
  color: #94a3b8 !important;
}

/* Admin Pages */
body.dark-theme .content-card,
body.dark-theme .bottom-card {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2) !important;
}

body.dark-theme .search-box,
body.dark-theme .search-inside {
  background: #0f172a !important;
  border-color: #334155 !important;
}
body.dark-theme .search-input,
body.dark-theme .search-inside input {
  color: #f8fafc !important;
}
body.dark-theme .search-input::placeholder,
body.dark-theme .search-inside input::placeholder {
  color: #64748b !important;
}

body.dark-theme .modern-input {
  background: #0f172a !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .kelas-cell strong,
body.dark-theme .user-info strong,
body.dark-theme .student-list-item .name {
  color: #f8fafc !important;
}

body.dark-theme .kelas-icon {
  background: #0f172a !important;
}

body.dark-theme .btn-icon {
  background: #0f172a !important;
  color: #cbd5e1 !important;
}
body.dark-theme .btn-icon:hover {
  background: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .student-selection-box {
  background: #1e293b !important;
  border-color: #334155 !important;
}
body.dark-theme .student-list-item {
  border-color: #334155 !important;
}
body.dark-theme .student-list-item:hover {
  background: #0f172a !important;
}
body.dark-theme .student-list-item .avatar {
  background: #334155 !important;
  color: #f8fafc !important;
}

body.dark-theme .empty-state,
body.dark-theme .more-indicator {
  background: #1e293b !important;
  color: #94a3b8 !important;
  border-color: #334155 !important;
}

body.dark-theme .page-info,
body.dark-theme .text-gray {
  color: #94a3b8 !important;
}

body.dark-theme .btn-page {
  background: #0f172a !important;
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}
body.dark-theme .btn-page:not([disabled]):hover {
  background: #334155 !important;
  border-color: #475569 !important;
}

/* SweetAlert2 Global & Dark Mode Overrides */
.swal2-popup {
  font-family: "Nunito", sans-serif !important;
  border-radius: 20px !important;
}

body.dark-theme .swal2-popup {
  background: #1e293b !important;
  color: #f8fafc !important;
  border: 1px solid #334155 !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
}
body.dark-theme .swal2-title,
body.dark-theme .swal2-html-container {
  color: #f8fafc !important;
}
body.dark-theme .swal2-success-circular-line-left,
body.dark-theme .swal2-success-circular-line-right,
body.dark-theme .swal2-success-fix {
  background: transparent !important;
}
body.dark-theme .swal2-cancel {
  background-color: #334155 !important;
  color: #f8fafc !important;
}
</style>
