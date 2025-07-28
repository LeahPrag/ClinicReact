"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchAvailableQueuesForToday,
  fetchAvailableQueuesForSpecialization,
  fetchAvailableQueuesForDate,
  makeAppointment,
  fetchClientAppointments // ✅ הוספתי את ה-thunk החדש
} from "../../slices/queueSlice";
import Layout from "../Layout/Layout";
import "./ClientDashboard.css";

const specializations = [
  { value: "Gynecologist", label: "גינקולוגיה" },
  { value: "ENT", label: "אף אוזן גרון" },
  { value: "Pediatrician", label: "ילדים" },
  { value: "Adult", label: "מבוגרים" },
];

const ClientDashboard: React.FC = () => {
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { availableQueues, loading, clientAppointments } = useAppSelector((state) => state.queue);

  const [selectedQueue, setSelectedQueue] = useState<number | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [showDoctorFields, setShowDoctorFields] = useState(false);

  const formatDateForServer = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchClientAppointments(user.id)); // ✅ שליפת התורים של הלקוח
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!selectedDate) {
      if (selectedSpecialization) {
        dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization));
      } else {
        dispatch(fetchAvailableQueuesForToday());
      }
    }
  }, [dispatch, selectedSpecialization, selectedDate]);

  const handleSearchByDate = () => {
    if (!selectedDate) return;
    const formattedDate = formatDateForServer(selectedDate);
    dispatch(
      fetchAvailableQueuesForDate({
        date: formattedDate,
        firstName: doctorFirstName.trim() || undefined,
        lastName: doctorLastName.trim() || undefined,
      })
    );
  };

  const handleMakeAppointment = async (queueId: number, doctorId: number, appointmentDate: string) => {
    if (!user?.id) return;

    try {
      setSelectedQueue(queueId);
      const apiDoctorId = `1234567${doctorId}`;
      const dateObj = new Date(appointmentDate);
      const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${dateObj.getFullYear()}`;
      const hour = dateObj.getHours();

      const response = await dispatch(
        makeAppointment({
          idDoctor: apiDoctorId,
          idClient: user.id,
          date: formattedDate,
          hour,
        })
      ).unwrap();

      alert(response);
      if (selectedSpecialization) {
        dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization));
      } else {
        dispatch(fetchAvailableQueuesForToday());
      }
      dispatch(fetchClientAppointments(user.id)); // ✅ רענון התורים של הלקוח אחרי קביעת תור
    } catch (error: any) {
      alert(`שגיאה בקביעת התור: ${error.message}`);
    } finally {
      setSelectedQueue(null);
    }
  };

  return (
    <Layout title={`Welcome, ${user?.name}`}>
      <div className="client-dashboard" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <section className="welcome-section glass-card" style={{ padding: "1rem" }}>
          <h2>שלום {user?.name}</h2>
          <p>כאן תוכל לקבוע תורים ולנהל את הטיפולים שלך</p>
        </section>

        <section className="search-section glass-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <label htmlFor="date-select">בחר תאריך:</label>
              <input
                type="date"
                id="date-select"
                value={selectedDate ?? ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
                style={{ marginLeft: 8, padding: 4 }}
              />
            </div>

            <button onClick={() => setShowDoctorFields((v) => !v)} style={{ padding: "6px 12px", cursor: "pointer" }}>
              {showDoctorFields ? "הסתר שדות רופא" : "חפש לפי שם רופא"}
            </button>

            <button
              onClick={handleSearchByDate}
              disabled={!selectedDate}
              style={{ padding: "6px 12px", cursor: selectedDate ? "pointer" : "not-allowed" }}
            >
              חפש
            </button>
          </div>

          {showDoctorFields && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: 8 }}>
              <input
                type="text"
                placeholder="שם פרטי של רופא"
                value={doctorFirstName}
                onChange={(e) => setDoctorFirstName(e.target.value)}
                style={{ padding: 6, flex: "1 1 200px" }}
              />
              <input
                type="text"
                placeholder="שם משפחה של רופא"
                value={doctorLastName}
                onChange={(e) => setDoctorLastName(e.target.value)}
                style={{ padding: 6, flex: "1 1 200px" }}
              />
            </div>
          )}

          <div>
            <label htmlFor="specialization-select">בחר התמחות:</label>
            <select
              id="specialization-select"
              value={selectedSpecialization ?? ""}
              onChange={(e) => setSelectedSpecialization(e.target.value || null)}
              style={{ marginLeft: 8, padding: 6, minWidth: 150 }}
            >
              <option value="">כל ההתמחויות</option>
              {specializations.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="available-queues-section glass-card" style={{ padding: "1rem", maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            {selectedSpecialization
              ? `תורים זמינים - ${specializations.find((s) => s.value === selectedSpecialization)?.label || selectedSpecialization}`
              : "תורים זמינים"}
            {selectedDate && ` - ${new Date(selectedDate).toLocaleDateString("he-IL")}`}
          </h3>

          {loading ? (
            <p>טוען תורים זמינים...</p>
          ) : availableQueues.length === 0 ? (
            <p>אין תורים זמינים כרגע</p>
          ) : (
            availableQueues.map((queue) => (
              <div key={queue.queueId} style={{ border: "1px solid #ccc", padding: "0.5rem", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div>
                    <strong>תאריך:</strong> {new Date(queue.appointmentDate).toLocaleDateString("he-IL")} <strong>שעה:</strong>{" "}
                    {new Date(queue.appointmentDate).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div>
                    <strong>רופא מס':</strong> {queue.doctorId} | <strong>תור מס':</strong> {queue.queueId}
                  </div>
                </div>
                <button
                  disabled={selectedQueue === queue.queueId}
                  onClick={() => handleMakeAppointment(queue.queueId, queue.doctorId, queue.appointmentDate)}
                  style={{ padding: "6px 12px", cursor: selectedQueue === queue.queueId ? "not-allowed" : "pointer", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: 4 }}
                >
                  {selectedQueue === queue.queueId ? "מזמין..." : "קבע תור"}
                </button>
              </div>
            ))
          )}
        </section>

        <section className="my-appointments-section glass-card" style={{ padding: "1rem" }}>
          <h3>התורים שלי</h3>
          <div style={{ border: "1px dashed #aaa", borderRadius: 6, padding: "1rem", textAlign: "center", color: "#777" }}>
            {clientAppointments.length === 0 ? (
              <p>אין תורים שנקבעו</p>
            ) : (
              clientAppointments.map((appointment) => (
                <div key={appointment.queueId} style={{ border: "1px solid #ccc", padding: "0.5rem", borderRadius: 6, marginBottom: "0.5rem" }}>
                  <div>
                    <strong>תאריך:</strong> {new Date(appointment.appointmentDate).toLocaleDateString("he-IL")} <strong>שעה:</strong>{" "}
                    {new Date(appointment.appointmentDate).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div>
                    <strong>רופא מס':</strong> {appointment.doctorId} | <strong>תור מס':</strong> {appointment.queueId}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ClientDashboard;
