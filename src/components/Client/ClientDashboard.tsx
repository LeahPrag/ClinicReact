
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useUser } from "../../contexts/UserContext"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { fetchAvailableQueuesForToday, makeAppointment } from "../../slices/queueSlice"
import Layout from "../Layout/Layout"
import "./ClientDashboard.css"

const ClientDashboard: React.FC = () => {
  const { user } = useUser()
  const dispatch = useAppDispatch()
  const { availableQueues, loading } = useAppSelector((state) => state.queue)
  const [selectedQueue, setSelectedQueue] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchAvailableQueuesForToday())
  }, [dispatch])





  const handleMakeAppointment = async (
    queueId: number,
    doctorId: number,
    appointmentDate: string
  ) => {
    if (!user?.id) return;

    try {
      setSelectedQueue(queueId);

      const apiDoctorId = `1234567${doctorId}`;

      const dateObj = new Date(appointmentDate);

      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;

      const hour = dateObj.getHours();

      const response = await dispatch(
        makeAppointment({
          idDoctor: apiDoctorId,
          idClient: user.id,
          date: formattedDate,
          hour: hour,
        }),
      ).unwrap();

      alert(response);
      dispatch(fetchAvailableQueuesForToday());
    } catch (error: any) {
      console.error("Appointment error:", error);
      alert(`שגיאה בקביעת התור: ${error.message}`);
    } finally {
      setSelectedQueue(null);
    }
  };


  return (
    <Layout title={`ברוך הבא, ${user?.name}`}>
      <div className="client-dashboard">
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-icon">👋</div>
            <h2>שלום {user?.name}</h2>
            <p>כאן תוכל לקבוע תורים ולנהל את הטיפולים שלך</p>
          </div>
        </div>

        <div className="appointments-section">
          <h3 className="section-title">תורים זמינים להיום</h3>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>טוען תורים זמינים...</span>
              </div>
            </div>
          ) : availableQueues.length === 0 ? (
            <div className="no-queues">
              <div className="no-queues-icon">📅</div>
              <p>אין תורים זמינים להיום</p>
            </div>
          ) : (
            <div className="queues-grid">
              {availableQueues.map((queue) => (
                <div key={queue.queueId} className="queue-card">
                  <div className="queue-header">
                    <div className="queue-time">
                      {new Date(queue.appointmentDate).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="queue-date">{new Date(queue.appointmentDate).toLocaleDateString("he-IL")}</div>
                  </div>

                  <div className="queue-content">
                    <div className="doctor-info">
                      <div className="doctor-icon">👨‍⚕️</div>
                      <div className="doctor-details">
                        <div className="doctor-name">רופא מס' {queue.doctorId}</div>
                        <div className="queue-id">תור מס' {queue.queueId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="queue-actions">
                    <button
                      className="book-btn"
                      onClick={() =>
                        handleMakeAppointment(queue.queueId, queue.doctorId, queue.appointmentDate)
                      }
                      disabled={selectedQueue === queue.queueId}
                    >
                      {selectedQueue === queue.queueId ? "מזמין..." : "קביעת תור"}
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="my-appointments-section">
          <h3 className="section-title">התורים שלי</h3>
          <div className="my-appointments-placeholder">
            <div className="placeholder-icon">📋</div>
            <p>כאן יוצגו התורים שקבעת</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ClientDashboard