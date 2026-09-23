import { defineNuxtRouteMiddleware, useCookie, navigateTo } from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
  const session = useCookie<{ email: string; role: string } | null>(
    "user_session",
  );

  const path = to.path;
  const rolePaths = ["/admin", "/guru", "/siswa", "/orangtua"];

  // Tentukan path dashboard sesuai role
  const getDashboardPath = (role: string) => {
    if (role === "admin") return "/Admin/Dashboard";
    if (role === "guru") return "/Guru/Dashboard";
    if (role === "siswa") return "/Siswa/Dashboard";
    if (role === "orangtua") return "/Orangtua/Dashboard";
    return "/";
  };

  const targetPortal = rolePaths.find((p) => path.toLowerCase().startsWith(p));

  if (targetPortal) {
    if (!session.value) {
      return navigateTo("/Login");
    }

    const currentRole = session.value.role.toLowerCase();
    const targetRole = targetPortal.replace("/", "");

    if (currentRole !== targetRole) {
      return navigateTo(getDashboardPath(session.value.role));
    }
  }

  if (["/login", "/daftar"].includes(path.toLowerCase())) {
    if (session.value) {
      return navigateTo(getDashboardPath(session.value.role));
    }
  }
});
