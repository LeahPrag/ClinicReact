
"use client"

import React, { useEffect, useState } from "react"
import { useUser } from "../../contexts/UserContext"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import {
  fetchAvailableQueuesForToday,
  fetchAvailableQueuesForSpecialization,
  fetchAvailableQueuesForDate,
  makeAppointment,
} from "../../slices/queueSlice"
import Layout from "../Layout/Layout"
import "./ClientDashboard.css"


const specializations = ["Gynecologist", "ENT", "Pediatrician", "Adult"]

const ClientDashboard: React.FC = () => {
  const { user } = useUser()
  const dispatch = useAppDispatch()
  const { availableQueues, loading } = useAppSelector((state) => state.queue)

  const [selectedQueue, setSelectedQueue] = useState<number | null>(null)
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const formatDateForServer = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
};


  useEffect(() => {
    if (selectedSpecialization) {
      dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
    } else {
      dispatch(fetchAvailableQueuesForToday())
    }
  }, [dispatch, selectedSpecialization])

  // useEffect(() => {
  //   if (selectedDate) {
  //     const formattedDate = formatDateForServer(selectedDate);
  //     dispatch(fetchAvailableQueuesForDate({ 
  //       date: formattedDate, 
  //       specialization: selectedSpecialization 
  //     }))
  //   } else if (selectedSpecialization) {
  //     dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
  //   } else {
  //     dispatch(fetchAvailableQueuesForToday())
  //   }
  // }, [dispatch, selectedDate, selectedSpecialization])

// Add this new state at the top of your component
const [doctorName, setDoctorName] = useState<string>('');

// Update the useEffect
useEffect(() => {
  if (selectedDate) {
    const formattedDate = formatDateForServer(selectedDate);
    dispatch(fetchAvailableQueuesForDate({ 
      date: formattedDate,
      doctorName: doctorName.trim() || undefined, // Send undefined if empty
      specialization: selectedSpecialization 
    }));
  } else if (selectedSpecialization) {
    dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization));
  } else {
    dispatch(fetchAvailableQueuesForToday());
  }
}, [dispatch, selectedDate, selectedSpecialization, doctorName]);

// Add this new input field in your render method, below the date picker
<div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
  <label htmlFor="doctor-name" style={{ marginRight: "0.5rem" }}>
    שם הרופא (אופציונלי):
  </label>
  <input
    type="text"
    id="doctor-name"
    value={doctorName}
    onChange={(e) => setDoctorName(e.target.value)}
    placeholder="הזן שם רופא"
  />
</div>

  const handleMakeAppointment = async (queueId: number, doctorId: number, appointmentDate: string) => {
    if (!user?.id) return

    try {
      setSelectedQueue(queueId)
      const apiDoctorId = `1234567${doctorId}`
      const dateObj = new Date(appointmentDate)
      const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${dateObj.getFullYear()}`
      const hour = dateObj.getHours()

      const response = await dispatch(
        makeAppointment({
          idDoctor: apiDoctorId,
          idClient: user.id,
          date: formattedDate,
          hour,
        }),
      ).unwrap()

      alert(response)
      // רענון תורים בהתאם לבחירה הנוכחית
      if (selectedSpecialization) {
        dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
      } else {
        dispatch(fetchAvailableQueuesForToday())
      }
    } catch (error: any) {
      console.error("Appointment error:", error)
      alert(`שגיאה בקביעת התור: ${error.message}`)
    } finally {
      setSelectedQueue(null)
    }
  }

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
   

        {/* choose date*/}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <label htmlFor="date-select" style={{ marginRight: "0.5rem" }}>בחר תאריך:</label>
          <input
            type="date"
            id="date-select"
            value={selectedDate ?? ""}
            onChange={(e) => setSelectedDate(e.target.value || null)}
          />
        </div>

       <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <label htmlFor="doctor-name" style={{ marginRight: "0.5rem" }}>
            חפש לפי שם רופא:
          </label>
          <input
            type="text"
            id="doctor-name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="הזן שם רופא"
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px"
            }}  
          />
</div>

        {/* בחירת התמחות */}
        <div
          className="specialization-filter"
          style={{ marginBottom: "1.5rem", textAlign: "center" }}
        >
          <label htmlFor="specialization-select" style={{ marginRight: "0.5rem" }}>
            בחר לפי התמחות:
          </label>
          <select
            id="specialization-select"
            value={selectedSpecialization ?? ""}
            onChange={(e) => setSelectedSpecialization(e.target.value || null)}
          >
            <option value="">כל התורים להיום</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div className="appointments-section">
          <h3 className="section-title">
            {selectedSpecialization ? `תורים זמינים - ${selectedSpecialization}` : "תורים זמינים להיום"}
          </h3>

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
              <p>אין תורים זמינים {selectedSpecialization ? `לתחום ${selectedSpecialization}` : "להיום"}</p>
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
                      onClick={() => handleMakeAppointment(queue.queueId, queue.doctorId, queue.appointmentDate)}
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

