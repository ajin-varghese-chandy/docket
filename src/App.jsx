import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import ClientProjects from './pages/ClientProjects.jsx'
import ClientFreelancers from './pages/ClientFreelancers.jsx'
import ClientInvoices from './pages/ClientInvoices.jsx'
import FreelancerDashboard from './pages/FreelancerDashboard.jsx'
import FreelancerProjects from './pages/FreelancerProjects.jsx'
import FreelancerClients from './pages/FreelancerClients.jsx'
import FreelancerInvoices from './pages/FreelancerInvoices.jsx'
import Profile from './pages/Profile.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading DOCKET…</div>
  }

  if (!user) {
    return <Login />
  }

  const isFreelancer = user.role === 'freelancer'

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={isFreelancer ? <FreelancerDashboard /> : <ClientDashboard />}
        />
        <Route
          path="/projects"
          element={isFreelancer ? <FreelancerProjects /> : <ClientProjects />}
        />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route
          path="/clients"
          element={isFreelancer ? <FreelancerClients /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/freelancers"
          element={isFreelancer ? <Navigate to="/dashboard" replace /> : <ClientFreelancers />}
        />
        <Route
          path="/files"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/invoices" element={isFreelancer ? <FreelancerInvoices /> : <ClientInvoices />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
