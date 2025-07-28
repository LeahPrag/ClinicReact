"use client"

import type React from "react"
import type { ReactNode } from "react"
import { useUser } from "../../contexts/UserContext"
import "./Layout.css"

interface LayoutProps {
  title: string
  children: ReactNode
  backgroundStyle?: React.CSSProperties
}

const Layout: React.FC<LayoutProps> = ({ title, children, backgroundStyle }) => {
  const { user, logout } = useUser()

  return (
    <div className="layout-container">
      <div className="layout-wrapper" style={backgroundStyle}>
        <header className="layout-header">
          <div className="header-content">
            <h1 className="header-title">🩺 Clinic Management System</h1>
            {user && (
              <div className="user-info">
                <span className="user-name">Hello {user.name}</span>
                <span className="user-type">({user.type})</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="layout-main">
          <h2 className="page-title">{title}</h2>
          {children}
        </main>
        <footer className="layout-footer">
          <p>© 2025 Clinic</p>
        </footer>
      </div>
    </div>
  )
}

export default Layout
