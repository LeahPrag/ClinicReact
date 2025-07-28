"use client"

import type React from "react"
import { useEffect } from "react"
import { useUser } from "../../contexts/UserContext"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import {
  fetchDoctorQueuesForToday,
  fetchNumOfClientsForToday,
  deleteADayOfWork
} from "../../slices/doctorSlice"
import Layout from "../Layout/Layout"
import "./DoctorDashboard.css"

const DoctorDashboard: React.FC = () => {
  const { user } = useUser()
  const dispatch = useAppDispatch()
  const { todayQueues, clientsCount, loading } = useAppSelector((state) => state.doctor)

  const handleDeleteDay = async () => {
    const confirmed = window.confirm("האם את/ה בטוח/ה שברצונך למחוק את יום העבודה הזה?");
    if (!confirmed || !user?.id) return;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await dispatch(deleteADayOfWork({ idNumber: user.id, day: today })).unwrap();
      alert("היום נמחק בהצלחה!");
      dispatch(fetchDoctorQueuesForToday(user.id));
      dispatch(fetchNumOfClientsForToday(user.id));
    } catch (error) {
      alert("אירעה שגיאה בעת מחיקת היום: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDoctorQueuesForToday(user.id))
      dispatch(fetchNumOfClientsForToday(user.id))
    }
  }, [dispatch, user?.id])

  if (loading) {
    return (
      <Layout title="לוח בקרה - רופא">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>טוען נתונים...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`לוח בקרה - ד"ר ${user?.name}`}>
      <div className="doctor-dashboard">
        <div className="stats-grid">
          <div className="stat-card clients-today">
            <div className="stat-icon">👥</div>
            <button
              onClick={handleDeleteDay}
              className="action-btn complete"
              style={{ background: "linear-gradient(135deg, #e53935, #d32f2f)", color: "white" }}
            >
              מחיקת יום עבודה
            </button>
            <div className="stat-content">
              <h3>מטופלים היום</h3>
              <div className="stat-number">{clientsCount}</div>
            </div>
          </div>

          <div className="stat-card appointments-today">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>תורים היום</h3>
              <div className="stat-number">{todayQueues.length}</div>
            </div>
          </div>
        </div>

        <div className="appointments-section">
          <h3 className="section-title">תורים להיום</h3>
          {todayQueues.length === 0 ? (
            <div className="no-appointments">
              <div className="no-appointments-icon">📋</div>
              <p>אין תורים להיום</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {todayQueues.map((queue) => (
                <div key={queue.queueId} className="appointment-card">
                  <div className="appointment-header">
                    <div className="appointment-time">
                      {new Date(queue.appointmentDate).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="appointment-status">פעיל</div>
                  </div>
                  <div className="appointment-content">
                    <div className="patient-info">
                      <div className="patient-icon">👤</div>
                      <div className="patient-details">
                        <div className="patient-name">
                          {queue.clientFirstName} {queue.clientLastName}
                        </div>
                        <div className="patient-id">ת.ז: {queue.clientId}</div>
                      </div>
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button className="action-btn complete">סיום טיפול</button>
                    <button className="action-btn reschedule">דחיית תור</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default DoctorDashboard
