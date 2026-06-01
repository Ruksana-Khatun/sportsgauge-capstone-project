import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('profile')
    return savedProfile ? JSON.parse(savedProfile) : {
      name: '', age: '', education: '',
      sport: '', position: '', achievement: '',
      bio: '', documents: []
    }
  })

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile))
  }, [profile])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    
    // Pre-populate profile from backend user details if they exist
    setProfile(prev => ({
      ...prev,
      name: userData.name || prev.name,
      sport: userData.sport_type || prev.sport,
      state: userData.state || prev.state,
      city: userData.city || prev.city,
    }))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setProfile({
      name: '', age: '', education: '',
      sport: '', position: '', achievement: '',
      bio: '', documents: []
    })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
  }

  return (
    <AppContext.Provider value={{ profile, setProfile, user, setUser, token, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}