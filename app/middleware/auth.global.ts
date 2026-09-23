import { defineNuxtRouteMiddleware, useCookie, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  // Ambil data session dari cookie
  const session = useCookie<{ email: string; role: string } | null>('user_session')

  const path = to.path
  const rolePaths = ['/admin', '/guru', '/siswa', '/orangtua']
  
  // Tentukan path dashboard sesuai role
  const getDashboardPath = (role: string) => {
    if (role === 'admin') return '/Admin/Dashboard'
    if (role === 'guru') return '/Guru/Dashboard'
    if (role === 'siswa') return '/Siswa/Dashboard'
    if (role === 'orangtua') return '/Orangtua/Dashboard'
    return '/'
  }

  // Cari tahu apakah halaman yang dituju merupakan halaman portal (memerlukan login)
  const targetPortal = rolePaths.find(p => path.toLowerCase().startsWith(p))

  if (targetPortal) {
    // Jika belum login, redirect ke halaman Login
    if (!session.value) {
      return navigateTo('/Login')
    }

    // Jika sudah login, pastikan role sesuai dengan portal yang diakses
    const currentRole = session.value.role.toLowerCase()
    const targetRole = targetPortal.replace('/', '')

    if (currentRole !== targetRole) {
      // Jika role tidak sesuai, arahkan ke dashboard role yang benar
      return navigateTo(getDashboardPath(session.value.role))
    }
  }

  // Jika user sudah login dan mencoba mengakses halaman Login atau Daftar, redirect ke Dashboard mereka
  if (['/login', '/daftar'].includes(path.toLowerCase())) {
    if (session.value) {
      return navigateTo(getDashboardPath(session.value.role))
    }
  }
})
