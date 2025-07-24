"use client"

import type React from "react"
import { useState } from "react"
import { useUser } from "../../contexts/UserContext"
import Layout from "../Layout/Layout"
import "./Login.css"

const Login: React.FC = () => {
  const [idNumber, setIdNumber] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!idNumber.trim()) {
      setError("אנא הכנס תעודת זהות")
      return
    }

    const success = await login(idNumber.trim())
    if (!success) {
      setError("תעודת זהות לא נמצאה במערכת")
    }
  }

  return (
    <Layout title="כניסה למערכת">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🏥</div>
            <h2 className="login-title">כניסה למערכת</h2>
            <p className="login-subtitle">הכנס את תעודת הזהות שלך</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="idNumber" className="input-label">
                תעודת זהות
              </label>
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="login-input"
                placeholder="הכנס תעודת זהות"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>מתחבר...</span>
                </div>
              ) : (
                "כניסה"
              )}
            </button>
          </form>

          <div className="login-info">
            <h3>סוגי משתמשים:</h3>
            <div className="user-types">
              <div className="user-type-card">
                <span className="user-type-icon">👨‍⚕️</span>
                <span>רופא</span>
              </div>
              <div className="user-type-card">
                <span className="user-type-icon">👤</span>
                <span>מטופל</span>
              </div>
              <div className="user-type-card">
                <span className="user-type-icon">👩‍💼</span>
                <span>מזכירה</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Login
