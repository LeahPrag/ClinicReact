"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchAvailableQueuesForToday,
  fetchAvailableQueuesForSpecialization,
  fetchAvailableQueuesForDate,
  makeAppointment,
  fetchClientAppointments
} from "../../slices/queueSlice";
import Layout from "../Layout/Layout";
import "./ClientDashboard.css";

const specializations = [
  { value: "Gynecologist", label: "Gynecology" },
  { value: "ENT", label: "Ear, Nose, and Throat" },
  { value: "Pediatrician", label: "Pediatrics" },
  { value: "Adult", label: "Adults" },
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
  const [searchedDoctorName, setSearchedDoctorName] = useState<string>("");

  const formatDateForServer = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const clearDoctorSearch = () => {
    setDoctorFirstName("");
    setDoctorLastName("");
    setShowDoctorFields(false);
    setSearchedDoctorName("");
  };

  const getDoctorDisplayName = (queue: any) => {
    // אם חיפשנו לפי שם רופא ויש לנו תוצאות, נציג את השם שחיפשנו
    if (searchedDoctorName && (doctorFirstName || doctorLastName)) {
      return searchedDoctorName;
    }
    
    // אחרת, ננסה לקבל שם מהנתונים
    const firstName = queue.doctorFirstName || queue.DoctorFirstName || '';
    const lastName = queue.doctorLastName || queue.DoctorLastName || '';
    
    if (firstName && lastName) {
      return `Dr. ${firstName} ${lastName}`;
    } else if (firstName) {
      return `Dr. ${firstName}`;
    } else if (lastName) {
      return `Dr. ${lastName}`;
    }
    
    return `Doctor #${queue.doctorId || queue.DoctorId}`;
  };

  const refreshData = async () => {
    try {
      if (user?.id) {
        await dispatch(fetchClientAppointments(user.id)).unwrap();
      }
      
      // רענון התורים הזמינים - תמיד עם חיפוש לפי שם רופא אם זמין
      if (selectedDate) {
        const formattedDate = formatDateForServer(selectedDate);
        await dispatch(
          fetchAvailableQueuesForDate({
            date: formattedDate,
            firstName: doctorFirstName.trim() || undefined,
            lastName: doctorLastName.trim() || undefined,
          })
        ).unwrap();
      } else if (selectedSpecialization) {
        // גם בחיפוש לפי התמחות, נכלול חיפוש רופא אם יש
        await dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization)).unwrap();
      } else {
        await dispatch(fetchAvailableQueuesForToday()).unwrap();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchClientAppointments(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!selectedDate) {
      // כשאין תאריך, נקה את שם הרופא הנשמר
      setSearchedDoctorName("");
      if (selectedSpecialization) {
        dispatch(fetchAvailableQueuesForSpecialization(selectedSpecialization));
      } else {
        dispatch(fetchAvailableQueuesForToday());
      }
    }
  }, [dispatch, selectedSpecialization, selectedDate]);

  const handleSearchByDate = () => {
    if (!selectedDate) return;
    
    // שמירת שם הרופא שחיפשנו לתצוגה
    if (doctorFirstName || doctorLastName) {
      const searchName = `Dr. ${doctorFirstName} ${doctorLastName}`.trim();
      setSearchedDoctorName(searchName);
    } else {
      setSearchedDoctorName("");
    }
    
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
      await refreshData();
    } catch (error: any) {
      console.error('Error making appointment:', error);
      alert(`Error scheduling appointment: ${error.message}`);
    } finally {
      setSelectedQueue(null);
    }
  };

  return (
    <Layout title={`Welcome, ${user?.name}`}>
      <div className="client-dashboard">
        <section className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-icon">👋</div>
            <h2>Hello {user?.name}</h2>
            <p>Here you can schedule appointments and manage your treatments</p>
          </div>
        </section>

        <section className="search-section">
          <div className="search-controls">
            <div className="search-field">
              <label htmlFor="date-select">Date:</label>
              <input
                type="date"
                id="date-select"
                className="search-input"
                value={selectedDate ?? ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
              />
            </div>

            <div className="search-field">
              <label htmlFor="specialization-select">Specialization:</label>
              <select
                id="specialization-select"
                className="search-input"
                value={selectedSpecialization ?? ""}
                onChange={(e) => setSelectedSpecialization(e.target.value || null)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="toggle-doctor-btn"
              onClick={() => setShowDoctorFields(prev => !prev)}
            >
              {showDoctorFields ? "Hide Doctor Search" : "Search by Doctor"}
            </button>

            <button
              className={`search-btn ${!selectedDate ? 'disabled' : ''}`}
              onClick={handleSearchByDate}
              disabled={!selectedDate}
            >
              Search
            </button>
          </div>

          {showDoctorFields && (
            <div className="doctor-fields">
              <input
                type="text"
                className="search-input"
                placeholder="Doctor's First Name"
                value={doctorFirstName}
                onChange={(e) => setDoctorFirstName(e.target.value)}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Doctor's Last Name"
                value={doctorLastName}
                onChange={(e) => setDoctorLastName(e.target.value)}
              />
              <button className="clear-btn" onClick={clearDoctorSearch}>
                Clear
              </button>
            </div>
          )}
        </section>

        <section className="appointments-section">
          <h3 className="section-title">
            {selectedSpecialization
              ? `Available Appointments - ${specializations.find((s) => s.value === selectedSpecialization)?.label || selectedSpecialization}`
              : "Available Appointments"}
            {selectedDate && ` - ${new Date(selectedDate).toLocaleDateString("en-US")}`}
            {searchedDoctorName && ` - ${searchedDoctorName}`}
          </h3>

          <div className="appointments-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Loading available appointments...</span>
                </div>
              </div>
            ) : availableQueues.length === 0 ? (
              <div className="no-appointments">
                <div className="no-appointments-icon">📅</div>
                <p>No available appointments</p>
              </div>
            ) : (
              <div className="appointments-list">
                {availableQueues.map((queue) => (
                  <div key={queue.queueId} className="appointment-card">
                    <div className="appointment-info">
                      <div className="appointment-details">
                        <div className="appointment-datetime">
                          <span className="date">
                            {new Date(queue.appointmentDate).toLocaleDateString("en-US")}
                          </span>
                          <span className="time">
                            {new Date(queue.appointmentDate).toLocaleTimeString("en-US", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </span>
                        </div>
                        <div className="doctor-name">
                          {getDoctorDisplayName(queue)}
                        </div>
                        <div className="appointment-id">
                          Appointment #{queue.queueId}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className={`book-btn ${selectedQueue === queue.queueId || loading ? 'disabled' : ''}`}
                      disabled={selectedQueue === queue.queueId || loading}
                      onClick={() => handleMakeAppointment(queue.queueId, queue.doctorId, queue.appointmentDate)}
                    >
                      {selectedQueue === queue.queueId ? "Scheduling..." : "Schedule"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="my-appointments-section">
          <h3 className="section-title">My Appointments</h3>

          <div className="appointments-container">
            {clientAppointments.length === 0 ? (
              <div className="no-appointments">
                <div className="no-appointments-icon">📝</div>
                <p>No appointments scheduled</p>
              </div>
            ) : (
              <div className="appointments-list">
                {clientAppointments.map((appointment) => (
                  <div key={appointment.queueId} className="appointment-card my-appointment">
                    <div className="appointment-info">
                      <div className="appointment-details">
                        <div className="appointment-datetime">
                          <span className="date">
                            {new Date(appointment.appointmentDate).toLocaleDateString("en-US")}
                          </span>
                          <span className="time">
                            {new Date(appointment.appointmentDate).toLocaleTimeString("en-US", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </span>
                        </div>
                        <div className="doctor-name">
                          {getDoctorDisplayName(appointment)}
                        </div>
                        <div className="appointment-id">
                          Appointment #{appointment.queueId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ClientDashboard;