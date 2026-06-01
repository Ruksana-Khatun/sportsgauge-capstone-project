import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import ProfileStep1 from './pages/ProfileStep1.jsx'
import ProfileStep2 from './pages/ProfileStep2.jsx'
import ProfileStep3 from './pages/ProfileStep3.jsx'
import TestsDashboard from './pages/TestsDashboard.jsx'
import UploadCenter from './pages/UploadCenter.jsx'
import Menu from './pages/Menu.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
    <div className="container-mobile">
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/1" element={<ProfileStep1 />} />
        <Route path="/profile/2" element={<ProfileStep2 />} />
        <Route path="/profile/3" element={<ProfileStep3 />} />
        <Route path="/tests" element={<TestsDashboard />} />
        <Route path="/upload" element={<UploadCenter />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}