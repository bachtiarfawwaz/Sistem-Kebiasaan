<template>
  <div class="dashboard-guru">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Daftar Siswa</h1>
        <p class="page-subtitle">
          Kelola dan pantau aktivitas siswa di kelas Anda.
        </p>
      </div>
      <div class="header-right">
        <div class="class-label">
          <span class="class-badge">{{
            currentClass ? currentClass.nama_kelas : "Belum Ditugaskan Kelas"
          }}</span>
        </div>

        <div class="filter-group">
          <!-- Global Segmented Filter untuk Grafik Tren -->
          <select
            v-model="periodFilter"
            class="modern-select"
            @change="fetchStudents"
          >
            <option value="hari_ini">Hari</option>
            <option value="minggu_ini">Minggu</option>
            <option value="bulan_ini">Bulan</option>
          </select>

          <select
            v-model="selectedTahunAjaran"
            class="modern-select"
            @change="fetchStudents"
          >
            <option v-for="thn in listTahunAjaran" :key="thn" :value="thn">
              {{ thn }}
            </option>
          </select>
          <select
            v-model="selectedSemester"
            class="modern-select"
            @change="fetchStudents"
          >
            <option value="Gasal">Gasal</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="5%" class="text-center">No</th>
            <th width="30%">Nama</th>
            <th width="15%">Agama</th>
            <th width="25%" class="text-center">Status Jurnal</th>
            <th width="25%" class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="5" class="text-center py-6 text-slate-500">
              Memuat data siswa...
            </td>
          </tr>
          <tr v-else-if="students.length === 0">
            <td colspan="5" class="text-center py-6 text-slate-500">
              Belum ada siswa di kelas ini.
            </td>
          </tr>
          <tr v-else v-for="(siswa, index) in students" :key="siswa.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="fw-bold name-cell">
              {{ siswa.nama }}
              <button
                class="mobile-action-btn"
                title="Lihat Detail Jurnal"
                @click.stop="navigateToDetail(siswa.id)"
              >
                <Icon name="ph:eye-duotone" />
              </button>
            </td>
            <td>{{ siswa.agama || "-" }}</td>
            <td class="text-center">
              <div
                class="sparkline-wrapper"
                @mouseenter="showOverlay($event, siswa)"
                @mouseleave="hideOverlay"
                @mousemove="updateMouse"
                @click="showOverlay($event, siswa)"
              >
                <!-- INDIKATOR HARI INI (7 Titik) -->
                <div v-if="periodFilter === 'hari_ini'" class="dots-indicator">
                  <div
                    v-for="(act, idx) in siswa.activitiesDetail"
                    :key="idx"
                    class="dot"
                    :class="{
                      'dot-green': act.statusLevel === 2,
                      'dot-yellow': act.statusLevel === 1,
                      'dot-red': act.statusLevel === 0,
                    }"
                  ></div>
                </div>

                <!-- GRAFIK TREN MINGGUAN/BULANAN -->
                <ClientOnly v-else>
                  <Line
                    v-if="siswa.mainSparklineData"
                    :data="siswa.mainSparklineData"
                    :options="mainSparklineOptions"
                    :style="{
                      width: '120px',
                      height: '35px',
                      margin: '0 auto',
                    }"
                  />
                  <span v-else class="text-slate-400 text-sm"
                    >Tidak ada data</span
                  >
                </ClientOnly>
              </div>
            </td>
            <td class="text-center">
              <button
                class="btn-action"
                title="Lihat Detail Jurnal"
                @click="navigateToDetail(siswa.id)"
              >
                <Icon name="ph:eye-duotone" class="btn-icon" />
                <span class="btn-text">Detail</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Custom Fixed Pop-up Details -->
      <Teleport to="body">
        <div
          v-if="hoveredStudent"
          class="custom-overlay"
          :style="overlayStyle"
          @mouseenter="clearHideTimeout"
          @mouseleave="hideOverlay"
        >
          <div class="popup-content">
            <div class="popup-header">
              <div>
                <h4 class="popup-title">{{ hoveredStudent.nama }}</h4>
                <p class="popup-subtitle">
                  Detail Aktivitas ({{ periodFilterLabel }})
                </p>
              </div>
            </div>

            <div class="activities-list mt-3">
              <div
                v-for="(act, idx) in hoveredStudent.activitiesDetail"
                :key="idx"
                class="activity-item"
              >
                <div class="act-label">
                  <Icon
                    :name="
                      act.statusLevel === 2
                        ? 'ph:check-circle-fill'
                        : act.statusLevel === 1
                          ? 'ph:warning-circle-fill'
                          : 'ph:x-circle-fill'
                    "
                    :class="
                      act.statusLevel === 2
                        ? 'text-green-500'
                        : act.statusLevel === 1
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    "
                    class="act-icon"
                  />
                  <span>{{ act.name }}</span>
                </div>
                <!-- Mikro Grafik Tren di Popup (hanya untuk minggu/bulan) -->
                <div class="act-sparkline" v-if="periodFilter !== 'hari_ini'">
                  <ClientOnly>
                    <Line
                      v-if="act.sparklineData"
                      :data="act.sparklineData"
                      :options="microSparklineOptions"
                      :style="{ width: '60px', height: '20px' }"
                    />
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Footer Action Section -->
    <div class="action-section">
      <button class="btn-export" @click="exportExcel">
        <Icon name="ph:file-xls" class="export-icon" />
        Export Excel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
);

definePageMeta({
  layout: "guru",
});

const router = useRouter();
const supabase = useSupabase();

const currentClass = ref(null);
const students = ref([]);
const isLoading = ref(true);

const currentYear = new Date().getFullYear();
const isGasal = new Date().getMonth() >= 6; // Juli - Des
const listTahunAjaran = [
  `${currentYear - 1}/${currentYear}`,
  `${currentYear}/${currentYear + 1}`,
  `${currentYear + 1}/${currentYear + 2}`,
];
const selectedTahunAjaran = ref(
  isGasal
    ? `${currentYear}/${currentYear + 1}`
    : `${currentYear - 1}/${currentYear}`,
);
const selectedSemester = ref(isGasal ? "Gasal" : "Genap");
const guruId = ref(null);

// Segmented filter state
const periodFilter = ref("hari_ini"); // 'hari_ini', 'minggu_ini', 'bulan_ini'

const periodFilterLabel = computed(() => {
  if (periodFilter.value === "hari_ini") return "Hari Ini";
  if (periodFilter.value === "minggu_ini") return "7 Hari Terakhir";
  return "30 Hari Terakhir";
});

// Pop-up Logic
const hoveredStudent = ref(null);
let hideTimeout = null;
const mouseX = ref(0);
const mouseY = ref(0);

const overlayStyle = computed(() => {
  return {
    top: `${mouseY.value + 15}px`,
    left: `${mouseX.value + 15}px`,
  };
});

const showOverlay = (event, student) => {
  clearHideTimeout();
  hoveredStudent.value = student;
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
};

const updateMouse = (event) => {
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
};

const hideOverlay = () => {
  hideTimeout = setTimeout(() => {
    hoveredStudent.value = null;
  }, 300);
};

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

onUnmounted(() => {
  clearHideTimeout();
});

const HABIT_NAMES = [
  "Bangun Pagi",
  "Beribadah",
  "Berolahraga",
  "Makan sehat & Bergizi",
  "Gemar Belajar",
  "Bermasyarakat",
  "Tidur tepat waktu",
];

const getStatusColor = (val, isTotal) => {
  if (isTotal) {
    if (val === 7)
      return { level: 2, color: "#22c55e", bg: "rgba(34,197,94,0.1)" }; // Green
    if (val >= 5 && val < 7)
      return { level: 1, color: "#eab308", bg: "rgba(234,179,8,0.1)" }; // Yellow
    return { level: 0, color: "#ef4444", bg: "rgba(239,68,68,0.1)" }; // Red (dibawah 5)
  } else {
    // 1 = Tuntas (Hijau), 0.1-0.9 = Sebagian/Terlambat (Kuning), 0 = Kosong (Merah)
    if (val === 1)
      return { level: 2, color: "#22c55e", bg: "rgba(34,197,94,0.1)" }; // Green
    if (val > 0 && val < 1)
      return { level: 1, color: "#eab308", bg: "rgba(234,179,8,0.1)" }; // Yellow
    return { level: 0, color: "#ef4444", bg: "rgba(239,68,68,0.1)" }; // Red
  }
};

const createSparklineOptions = (maxVal, showTooltip = false) => ({
  responsive: false,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: showTooltip },
  },
  scales: {
    x: { display: false },
    y: { display: false, min: 0, max: maxVal },
  },
  elements: {
    point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
    line: { tension: 0.4, borderWidth: 2.5 },
  },
  layout: { padding: 0 },
});

const mainSparklineOptions = computed(() => createSparklineOptions(7, true));
const microSparklineOptions = computed(() => createSparklineOptions(1, false));

const fetchStudents = async () => {
  if (!guruId.value) return;
  isLoading.value = true;

  try {
    const { data: kelasData } = await supabase
      .from("kelas")
      .select("*")
      .eq("wali_kelas_id", guruId.value)
      .single();
    if (!kelasData) {
      isLoading.value = false;
      return;
    }
    currentClass.value = kelasData;

    const isCurrentPeriod =
      selectedSemester.value === (isGasal ? "Gasal" : "Genap") &&
      selectedTahunAjaran.value ===
        (isGasal
          ? `${currentYear}/${currentYear + 1}`
          : `${currentYear - 1}/${currentYear}`);

    let studentsData = [];
    if (isCurrentPeriod) {
      const { data } = await supabase
        .from("peserta_didik")
        .select("*")
        .eq("kelas_id", kelasData.id);
      studentsData = data || [];
    } else {
      const { data: historyJurnal } = await supabase
        .from("jurnal_harian")
        .select("peserta_didik_id")
        .eq("kelas_id", kelasData.id)
        .eq("tahun_ajaran", selectedTahunAjaran.value)
        .eq("semester", selectedSemester.value);

      if (historyJurnal && historyJurnal.length > 0) {
        const uniqueStudentIds = [
          ...new Set(historyJurnal.map((h) => h.peserta_didik_id)),
        ];
        const { data } = await supabase
          .from("peserta_didik")
          .select("*")
          .in("id", uniqueStudentIds);
        studentsData = data || [];
      }
    }

    if (studentsData.length === 0) {
      students.value = [];
      isLoading.value = false;
      return;
    }

    const now = new Date();
    let daysToFetch =
      periodFilter.value === "hari_ini"
        ? 1
        : periodFilter.value === "minggu_ini"
          ? 7
          : 30;

    let dates = [];
    for (let i = daysToFetch - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }

    const startDateStr = dates[0];
    const endDateStr = dates[dates.length - 1];
    const studentIds = studentsData.map((s) => s.id);

    const { data: harianData } = await supabase
      .from("jurnal_harian")
      .select("id, peserta_didik_id, tanggal")
      .in("peserta_didik_id", studentIds)
      .gte("tanggal", startDateStr)
      .lte("tanggal", endDateStr);

    const harianIds = harianData ? harianData.map((h) => h.id) : [];

    const studentLogsMap = {};
    studentsData.forEach((s) => {
      studentLogsMap[s.id] = {};
      dates.forEach((d) => {
        studentLogsMap[s.id][d] = {
          totalCompleted: 0,
          activities: HABIT_NAMES.reduce((acc, curr) => {
            acc[curr] = 0;
            return acc;
          }, {}),
        };
      });
    });

    if (harianIds.length > 0) {
      const { data: masterKebiasaan } = await supabase
        .from("kebiasaan")
        .select("id, nama_kebiasaan");

      const harianMeta = {};
      harianData.forEach((h) => {
        harianMeta[h.id] = { studentId: h.peserta_didik_id, date: h.tanggal };
      });

      const { data: ibadahLogs } = await supabase
        .from("jurnal_ibadah")
        .select("jurnal_harian_id")
        .in("jurnal_harian_id", harianIds)
        .eq("status", true);
      const ibadahCounts = {};
      if (ibadahLogs) {
        ibadahLogs.forEach((log) => {
          ibadahCounts[log.jurnal_harian_id] =
            (ibadahCounts[log.jurnal_harian_id] || 0) + 1;
        });
      }

      const { data: kebLogs } = await supabase
        .from("jurnal_kebiasaan")
        .select("jurnal_harian_id, kebiasaan_id, keterangan")
        .in("jurnal_harian_id", harianIds)
        .eq("status", true);

      for (const hId of harianIds) {
        const meta = harianMeta[hId];
        if (!meta || !studentLogsMap[meta.studentId][meta.date]) continue;

        const dayLog = studentLogsMap[meta.studentId][meta.date];
        const studentObj = studentsData.find((s) => s.id === meta.studentId);
        const isIslam =
          !studentObj?.agama ||
          studentObj.agama.toLowerCase().trim() === "islam";
        const reqIbadahCount = isIslam ? 5 : 3;

        const iCount = ibadahCounts[hId] || 0;
        if (iCount >= reqIbadahCount) {
          dayLog.activities["Beribadah"] = 1;
          dayLog.totalCompleted++;
        } else if (iCount > 0) {
          dayLog.activities["Beribadah"] = 0.5; // Sebagian / Kuning
        }

        if (kebLogs && masterKebiasaan) {
          HABIT_NAMES.forEach((habitName) => {
            if (habitName === "Beribadah") return;
            const m = masterKebiasaan.find((k) =>
              k.nama_kebiasaan
                .toLowerCase()
                .includes(habitName.split(" ")[0].toLowerCase()),
            );
            if (m) {
              const logsForHabit = kebLogs.filter(
                (l) => l.jurnal_harian_id === hId && l.kebiasaan_id === m.id,
              );
              if (logsForHabit.length > 0) {
                const l = logsForHabit[0];
                let val = 1;

                if (habitName.includes("Bangun Pagi")) {
                  if (l.keterangan === "Lebih dari 06:00") val = 0.5;
                  else {
                    try {
                      const [h, m] = l.keterangan.split(":").map(Number);
                      if (h * 60 + m > 6 * 60) val = 0.5;
                    } catch (e) {}
                  }
                } else if (habitName.includes("Tidur")) {
                  if (l.keterangan === "Lebih dari 22:00") val = 0.5;
                  else {
                    try {
                      const [h, m] = l.keterangan.split(":").map(Number);
                      if (h * 60 + m > 22 * 60) val = 0.5;
                    } catch (e) {}
                  }
                } else if (
                  habitName === "Berolahraga" ||
                  habitName === "Gemar Belajar"
                ) {
                  let text = "";
                  try {
                    const parsed = JSON.parse(l.keterangan);
                    text = parsed.materi || parsed.keterangan || l.keterangan;
                  } catch (e) {
                    text = l.keterangan;
                  }
                  const match = text.match(/\((\d+)\s*Menit\)/i);
                  if (match) {
                    if (parseInt(match[1]) < 30) val = 0.5;
                  } else if (text) {
                    val = 0.5; // Ada isi tapi format menit tidak jelas
                  }
                } else if (habitName === "Makan sehat & Bergizi") {
                  try {
                    const parsed = JSON.parse(l.keterangan);
                    let missing = 0;
                    if (!parsed.nasi || parsed.nasi === "Tidak Konsumsi")
                      missing++;
                    if (!parsed.lauk || parsed.lauk === "Tidak Konsumsi")
                      missing++;
                    if (!parsed.sayur || parsed.sayur === "Tidak Konsumsi")
                      missing++;
                    if (!parsed.buah || parsed.buah === "Tidak Konsumsi")
                      missing++;
                    if (missing > 0 && missing < 4) val = 0.5;
                    else if (missing === 4) val = 0;
                  } catch (e) {}
                }

                dayLog.activities[habitName] = val;
                if (val === 1) {
                  dayLog.totalCompleted++;
                }
              }
            }
          });
        }
      }
    }

    students.value = studentsData.map((s) => {
      const datesData = dates.map((d) => studentLogsMap[s.id][d]);
      let mainPoints = datesData.map((d) => d.totalCompleted);

      const latestMainVal = datesData[datesData.length - 1].totalCompleted;
      const statusMain = getStatusColor(latestMainVal, true);

      const mainSparklineData = {
        labels: dates,
        datasets: [
          {
            data: mainPoints,
            fill: false,
            segment: {
              borderColor: (ctx) => {
                if (!ctx.p1) return "#ef4444";
                const val = ctx.p1.parsed.y;
                if (val === 7) return "#22c55e";
                if (val >= 5) return "#eab308";
                return "#ef4444";
              },
            },
          },
        ],
      };

      const activitiesDetail = HABIT_NAMES.map((habit) => {
        let points = datesData.map((d) => d.activities[habit]);

        const latestActVal = datesData[datesData.length - 1].activities[habit];
        const statusAct = getStatusColor(latestActVal, false);

        return {
          name: habit,
          statusLevel: statusAct.level, // 0=Red, 1=Yellow, 2=Green
          points,
          sparklineData: {
            labels: dates,
            datasets: [
              {
                data: points,
                fill: false,
                stepped: true,
                segment: {
                  borderColor: (ctx) => {
                    if (!ctx.p1) return "#ef4444";
                    const val = ctx.p1.parsed.y;
                    if (val === 1) return "#22c55e";
                    if (val > 0 && val < 1) return "#eab308";
                    return "#ef4444";
                  },
                },
              },
            ],
          },
        };
      });

      return {
        ...s,
        statusMainLevel: statusMain.level,
        mainSparklineData,
        activitiesDetail,
      };
    });

    // Perbarui referensi hoveredStudent agar pop-up bereaksi dengan data baru
    if (hoveredStudent.value) {
      const updatedStudent = students.value.find(
        (s) => s.id === hoveredStudent.value.id,
      );
      if (updatedStudent) {
        hoveredStudent.value = updatedStudent;
      }
    }
  } catch (error) {
    console.error("Error fetching students:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: guruData } = await supabase
        .from("guru")
        .select("id, users!inner(email)")
        .eq("users.email", user.email)
        .single();

      if (guruData) {
        guruId.value = guruData.id;
        await fetchStudents();
      }
    }
  } catch (error) {
    console.error("Error loading dashboard guru:", error);
  }
});

const navigateToDetail = (siswaId) => {
  router.push({ path: "/Guru/DetailSiswa", query: { id: siswaId } });
};

const exportExcel = async () => {
  if (!currentClass.value) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan Siswa");

  sheet.columns = [{ width: 8 }, { width: 40 }, { width: 25 }, { width: 35 }];

  sheet.mergeCells("A1:D1");
  const titleCell = sheet.getCell("A1");
  titleCell.value =
    "LAPORAN MONITORING 7 KEBIASAAN ANAK INDONESIA HEBAT (KAIH)";
  titleCell.font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 35;

  sheet.getCell("A2").value = "Kelas:";
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("B2").value = currentClass.value.nama_kelas;

  sheet.getCell("A3").value = "Tanggal Cetak:";
  sheet.getCell("A3").font = { bold: true };
  sheet.getCell("B3").value = new Date().toLocaleDateString("id-ID");

  sheet.addRow([]);

  const headerRow = sheet.addRow([
    "No",
    "Nama Lengkap",
    "Agama",
    "Status Jurnal Terbaru",
  ]);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDBEAFE" },
    };
    cell.font = { bold: true, color: { argb: "FF1E293B" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  headerRow.height = 25;

  students.value.forEach((row, index) => {
    const dataRow = sheet.addRow([
      index + 1,
      row.nama,
      row.agama || "-",
      row.statusMainLevel === 2
        ? "Lengkap (7/7)"
        : row.statusMainLevel === 1
          ? "Belum Lengkap (5-6)"
          : "Kurang (<5)",
    ]);

    dataRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
      if (colNumber === 1 || colNumber === 3 || colNumber === 4) {
        cell.alignment.horizontal = "center";
      }
    });

    const statusCell = dataRow.getCell(4);
    if (row.statusMainLevel === 2) {
      statusCell.font = { color: { argb: "FF166534" }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDCFCE7" },
      };
    } else if (row.statusMainLevel === 1) {
      statusCell.font = { color: { argb: "FF854D0E" }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF08A" },
      };
    } else {
      statusCell.font = { color: { argb: "FF991B1B" }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `Data_Siswa_${currentClass.value.nama_kelas.replace(/\s+/g, "_")}.xlsx`,
  );
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");

.dashboard-guru {
  font-family: "Nunito", sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0 3rem 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.popup-filter {
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
}

.modern-select {
  appearance: none;
  background-color: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 2.2rem 0.5rem 1rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}
.modern-select:hover {
  border-color: #cbd5e1;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.class-badge {
  background: #f1f5f9;
  color: #3b82f6;
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
}

.table-container {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  margin-bottom: 2.5rem;
  border: 1px solid #f1f5f9;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: transparent;
  padding: 1rem 1.5rem;
  font-weight: 700;
  color: #64748b;
  font-size: 0.95rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
  font-weight: 500;
  font-size: 1rem;
  vertical-align: middle;
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.text-center {
  text-align: center !important;
}
.fw-bold {
  font-weight: 700 !important;
  color: #1e293b !important;
}
.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.sparkline-wrapper {
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 130px;
  min-height: 45px;
}
.sparkline-wrapper:hover {
  background-color: #f1f5f9;
}

/* Dots Indicator for Hari Ini */
.dots-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e2e8f0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.dot:hover {
  transform: scale(1.3);
}
.dot-green {
  background-color: #22c55e;
  box-shadow: 0 0 4px rgba(34, 197, 94, 0.4);
}
.dot-yellow {
  background-color: #eab308;
  box-shadow: 0 0 4px rgba(234, 179, 8, 0.4);
}
.dot-red {
  background-color: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);
}

/* Custom Overlay Pop-up */
.custom-overlay {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  padding: 1.2rem;
  min-width: 280px;
  pointer-events: auto;
}

.popup-content {
  font-family: "Nunito", sans-serif;
}
.popup-header {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}
.popup-title {
  margin: 0 0 4px 0;
  font-weight: 800;
  color: #1e293b;
  font-size: 1.1rem;
}
.popup-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  gap: 1.5rem;
}
.act-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.act-icon {
  font-size: 1.2rem;
}

.btn-action {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.btn-action:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.btn-icon {
  font-size: 1.1rem;
}

.action-section {
  display: flex;
  justify-content: flex-end;
}
.btn-export {
  background-color: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.export-icon {
  font-size: 1.2rem;
}
.btn-export:hover {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.mobile-action-btn {
  display: none;
}

/* =========================================
   Responsive Mobile Layout (Card View)
   ========================================= */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-right {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    width: 100%;
  }

  .modern-select {
    width: 100%;
  }

  /* Transform Table to Cards */
  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
    min-width: unset;
  }

  .table-container {
    background: transparent;
    box-shadow: none;
    padding: 0;
    overflow-x: hidden;
  }

  .data-table tr {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    position: relative;
  }

  .data-table td {
    border: none;
    padding: 0;
    text-align: left !important;
  }

  /* Sembunyikan No */
  .data-table td:nth-child(1) {
    display: none;
  }

  /* Nama */
  .data-table td:nth-child(2) {
    font-size: 1.1rem;
    color: #1e293b;
    padding-right: 60px; /* Space for detail button on the right */
  }

  .mobile-action-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex !important;
    padding: 6px;
    font-size: 1.1rem;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    color: #3b82f6;
    border: none;
    cursor: pointer;
  }

  /* Agama */
  .data-table td:nth-child(3) {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 2px;
    margin-bottom: 12px;
  }

  /* Grafik Tren */
  .data-table td:nth-child(4) {
    width: 100%;
    display: flex;
    justify-content: center;
    border-top: 1px dashed #e2e8f0;
    padding-top: 12px;
  }

  .sparkline-wrapper {
    width: 100%;
    padding: 0;
  }

  /* Sembunyikan Aksi Button (Desktop) */
  .data-table td:nth-child(5) {
    display: none !important;
  }

  .btn-text {
    display: none;
  }

  .custom-overlay {
    width: 90%;
    left: 5% !important;
  }
}
</style>
