

// "use client"

// import React, { useEffect, useState } from "react"
// import { useUser } from "../../contexts/UserContext"
// import { useAppDispatch, useAppSelector } from "../../hooks/redux"
// import {
//   fetchAvailableQueuesForToday,
//   fetchAvailableQueuesForSpecialization,
//   fetchAvailableQueuesForDate,
//   makeAppointment,
// } from "../../slices/queueSlice"
// import Layout from "../Layout/Layout"
// import "./ClientDashboard.css"

// const specializations = ["Gynecologist", "ENT", "Pediatrician", "Adult"]

// const ClientDashboard: React.FC = () => {
//   const { user } = useUser()
//   const dispatch = useAppDispatch()
//   const { availableQueues, loading } = useAppSelector((state) => state.queue)

//   const [selectedQueue, setSelectedQueue] = useState<number | null>(null)
//   const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
//   const [selectedDate, setSelectedDate] = useState<string | null>(null)
//   const [doctorFirstName, setDoctorFirstName] = useState("")
//   const [doctorLastName, setDoctorLastName] = useState("")
//   const [showDoctorFields, setShowDoctorFields] = useState(false)

//   const formatDateForServer = (dateStr: string): string => {
//     const [year, month, day] = dateStr.split("-")
//     return `${day}.${month}.${year}`
//   }

//   useEffect(() => {
//     if (!selectedDate) {
//       if (selectedSpecialization) {
//         dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
//       } else {
//         dispatch(fetchAvailableQueuesForToday())
//       }
//     }
//   }, [dispatch, selectedSpecialization])

// const handleSearchByDate = () => {
//   console.log("Search initiated with:", {
//     date: selectedDate,
//     firstName: doctorFirstName,
//     lastName: doctorLastName
//   });

//   if (!selectedDate) {
//     console.log("No date selected!");
//     return;
//   }

//   const formattedDate = formatDateForServer(selectedDate);
//   console.log("Formatted date:", formattedDate);

//   dispatch(fetchAvailableQueuesForDate({
//     date: formattedDate,
//     firstName: doctorFirstName.trim() || undefined,
//     lastName: doctorLastName.trim() || undefined,
//   }))
//   .unwrap()
//   .then((queues) => {
//     console.log("Fetched queues:", queues);
//   })
//   .catch((error) => {
//     console.error("Search error:", error);
//   });
// };

//   const handleMakeAppointment = async (queueId: number, doctorId: number, appointmentDate: string) => {
//     if (!user?.id) return

//     try {
//       setSelectedQueue(queueId)
//       const apiDoctorId = `1234567${doctorId}`
//       const dateObj = new Date(appointmentDate)
//       const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1)
//         .toString()
//         .padStart(2, "0")}.${dateObj.getFullYear()}`
//       const hour = dateObj.getHours()

//       const response = await dispatch(
//         makeAppointment({
//           idDoctor: apiDoctorId,
//           idClient: user.id,
//           date: formattedDate,
//           hour,
//         }),
//       ).unwrap()

//       alert(response)
//       if (selectedSpecialization) {
//         dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
//       } else {
//         dispatch(fetchAvailableQueuesForToday())
//       }
//     } catch (error: any) {
//       console.error("Appointment error:", error)
//       alert(`שגיאה בקביעת התור: ${error.message}`)
//     } finally {
//       setSelectedQueue(null)
//     }
//   }

//   return (
//     <Layout title={`ברוך הבא, ${user?.name}`}>
//       <div className="client-dashboard">
//         <div className="welcome-section">
//           <div className="welcome-card">
//             <div className="welcome-icon">👋</div>
//             <h2>שלום {user?.name}</h2>
//             <p>כאן תוכל לקבוע תורים ולנהל את הטיפולים שלך</p>
//           </div>
//         </div>

//         {/* בחירת תאריך */}
//         <div style={{ marginBottom: "1rem", textAlign: "center" }}>
//           <label htmlFor="date-select" style={{ marginRight: "0.5rem" }}>בחר תאריך:</label>
//           <input
//             type="date"
//             id="date-select"
//             value={selectedDate ?? ""}
//             onChange={(e) => setSelectedDate(e.target.value || null)}
//           />
//         </div>

//         {/* כפתור פתיחת שדות שם רופא */}
//         <div style={{ textAlign: "center", marginBottom: "1rem" }}>
//           <button onClick={() => setShowDoctorFields(!showDoctorFields)}>
//             {showDoctorFields ? "הסתר שדות רופא" : "חפש לפי שם רופא"}
//           </button>
//         </div>

//         {/* קלט לשם פרטי ומשפחה של הרופא */}
//         {showDoctorFields && (
//           <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
//             <input
//               type="text"
//               placeholder="שם פרטי של רופא"
//               value={doctorFirstName}
//               onChange={(e) => setDoctorFirstName(e.target.value)}
//               style={{ margin: "0.5rem", padding: "0.5rem" }}
//             />
//             <input
//               type="text"
//               placeholder="שם משפחה של רופא"
//               value={doctorLastName}
//               onChange={(e) => setDoctorLastName(e.target.value)}
//               style={{ margin: "0.5rem", padding: "0.5rem" }}
//             />
//           </div>
//         )}

//         {/* כפתור חיפוש לפי תאריך + שם רופא */}
//         <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//           <button onClick={handleSearchByDate}>חפש לפי תאריך</button>
//         </div>

//         {/* בחירת התמחות */}
//         <div
//           className="specialization-filter"
//           style={{ marginBottom: "1.5rem", textAlign: "center" }}
//         >
//           <label htmlFor="specialization-select" style={{ marginRight: "0.5rem" }}>
//             בחר לפי התמחות:
//           </label>
//           <select
//             id="specialization-select"
//             value={selectedSpecialization ?? ""}
//             onChange={(e) => setSelectedSpecialization(e.target.value || null)}
//           >
//             <option value="">כל התורים להיום</option>
//             {specializations.map((spec) => (
//               <option key={spec} value={spec}>
//                 {spec}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* תצוגת תורים */}
//         <div className="appointments-section">
//           <h3 className="section-title">
//             {selectedSpecialization ? `תורים זמינים - ${selectedSpecialization}` : "תורים זמינים להיום"}
//           </h3>

//           {loading ? (
//             <div className="loading-container">
//               <div className="loading-spinner">
//                 <div className="spinner"></div>
//                 <span>טוען תורים זמינים...</span>
//               </div>
//             </div>
//           ) : availableQueues.length === 0 ? (
//             <div className="no-queues">
//               <div className="no-queues-icon">📅</div>
//               <p>אין תורים זמינים</p>
//             </div>
//           ) : (
//             <div className="queues-grid">
//               {availableQueues.map((queue) => (
//                 <div key={queue.queueId} className="queue-card">
//                   <div className="queue-header">
//                     <div className="queue-time">
//                       {new Date(queue.appointmentDate).toLocaleTimeString("he-IL", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </div>
//                     <div className="queue-date">{new Date(queue.appointmentDate).toLocaleDateString("he-IL")}</div>
//                   </div>
//                   <div className="queue-content">
//                     <div className="doctor-info">
//                       <div className="doctor-icon">👨‍⚕️</div>
//                       <div className="doctor-details">
//                         <div className="doctor-name">רופא מס' {queue.doctorId}</div>
//                         <div className="queue-id">תור מס' {queue.queueId}</div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="queue-actions">
//                     <button
//                       className="book-btn"
//                       onClick={() => handleMakeAppointment(queue.queueId, queue.doctorId, queue.appointmentDate)}
//                       disabled={selectedQueue === queue.queueId}
//                     >
//                       {selectedQueue === queue.queueId ? "מזמין..." : "קביעת תור"}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="my-appointments-section">
//           <h3 className="section-title">התורים שלי</h3>
//           <div className="my-appointments-placeholder">
//             <div className="placeholder-icon">📋</div>
//             <p>כאן יוצגו התורים שקבעת</p>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   )
// }

// export default ClientDashboard



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

const specializations = [
  { value: "Gynecologist", label: "גינקולוגיה" },
  { value: "ENT", label: "אף אוזן גרון" },
  { value: "Pediatrician", label: "ילדים" },
  { value: "Adult", label: "מבוגרים" }
]

const ClientDashboard: React.FC = () => {
  const { user } = useUser()
  const dispatch = useAppDispatch()
  const { availableQueues, loading } = useAppSelector((state) => state.queue)

  const [selectedQueue, setSelectedQueue] = useState<number | null>(null)
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [doctorFirstName, setDoctorFirstName] = useState("")
  const [doctorLastName, setDoctorLastName] = useState("")
  const [showDoctorFields, setShowDoctorFields] = useState(false)

  const formatDateForServer = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-")
    return `${day}.${month}.${year}`
  }

  useEffect(() => {
    if (!selectedDate) {
      if (selectedSpecialization) {
        dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization))
      } else {
        dispatch(fetchAvailableQueuesForToday())
      }
    }
  }, [dispatch, selectedSpecialization])

  const handleSearchByDate = () => {
    if (!selectedDate) return
    const formattedDate = formatDateForServer(selectedDate)
    dispatch(fetchAvailableQueuesForDate({
      date: formattedDate,
      firstName: doctorFirstName.trim() || undefined,
      lastName: doctorLastName.trim() || undefined,
    }))
  }

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
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card glass-card">
            <div className="welcome-icon">👋</div>
            <h2>שלום {user?.name}</h2>
            <p>כאן תוכל לקבוע תורים ולנהל את הטיפולים שלך</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-container glass-card">
          <div className="search-row">
            <div className="form-group">
              <label htmlFor="date-select">📅 בחר תאריך</label>
              <input
                type="date"
                id="date-select"
                value={selectedDate ?? ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
                className="form-input"
              />
            </div>

            <button 
              className="toggle-doctor-btn"
              onClick={() => setShowDoctorFields(!showDoctorFields)}
            >
              {showDoctorFields ? "✖ הסתר" : "👨‍⚕️ חפש לפי רופא"}
            </button>
          </div>

          {showDoctorFields && (
            <div className="doctor-fields">
              <div className="form-group">
                <label>👤 שם פרטי</label>
                <input
                  type="text"
                  value={doctorFirstName}
                  onChange={(e) => setDoctorFirstName(e.target.value)}
                  placeholder="הזן שם פרטי"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>👥 שם משפחה</label>
                <input
                  type="text"
                  value={doctorLastName}
                  onChange={(e) => setDoctorLastName(e.target.value)}
                  placeholder="הזן שם משפחה"
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="search-actions">
            <button 
              onClick={handleSearchByDate}
              className="search-btn"
              disabled={!selectedDate}
            >
              🔍 חפש תורים
            </button>
          </div>

          <div className="form-group specialization-group">
            <label>🏥 בחר התמחות</label>
            <select
              value={selectedSpecialization ?? ""}
              onChange={(e) => setSelectedSpecialization(e.target.value || null)}
              className="form-input"
            >
              <option value="">כל ההתמחויות</option>
              {specializations.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="appointments-section glass-card">
          <h3 className="section-title">
            {selectedSpecialization 
              ? `תורים זמינים - ${specializations.find(s => s.value === selectedSpecialization)?.label || selectedSpecialization}` 
              : "תורים זמינים"}
            {selectedDate && ` - ${new Date(selectedDate).toLocaleDateString('he-IL')}`}
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
              <p>
                {selectedDate || selectedSpecialization 
                  ? "לא נמצאו תורים זמינים לפי החיפוש שלך" 
                  : "אין תורים זמינים כרגע"}
              </p>
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
                    <div className="queue-date">
                      {new Date(queue.appointmentDate).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  
                  <div className="queue-content">
                    <div className="doctor-info">
                      <div className="doctor-avatar">👨‍⚕️</div>
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
                      {selectedQueue === queue.queueId ? (
                        <>
                          <span className="spinner"></span> מתבצע...
                        </>
                      ) : (
                        "קבע תור"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Appointments Section */}
        <div className="my-appointments-section glass-card">
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