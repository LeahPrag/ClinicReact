"use client";

import type React from "react";
import { useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchDoctorQueuesForToday,
  fetchNumOfClientsForToday,
  deleteADayOfWork,
} from "../../slices/doctorSlice";
import Layout from "../Layout/Layout";
import "./DoctorDashboard.css";

const DoctorDashboard: React.FC = () => {
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { todayQueues, clientsCount, loading } = useAppSelector((state) => state.doctor);

  const handleDeleteDay = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this workday?");
    if (!confirmed || !user?.id) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      await dispatch(deleteADayOfWork({ idNumber: user.id, day: today })).unwrap();
      alert("The day was successfully deleted!");
      dispatch(fetchDoctorQueuesForToday(user.id));
      dispatch(fetchNumOfClientsForToday(user.id));
    } catch (error) {
      alert("An error occurred while deleting the day: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDoctorQueuesForToday(user.id));
      dispatch(fetchNumOfClientsForToday(user.id));
    }
  }, [dispatch, user?.id]);

  if (loading) {
    return (
      <Layout title="Dashboard - Doctor">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Dashboard - Dr. ${user?.name}`}>
      <div className="doctor-dashboard">
        <div className="stats-grid">
          <div className="stat-card clients-today">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Clients Today</h3>
              <div className="stat-number">{clientsCount}</div>
            </div>
            <button
              onClick={handleDeleteDay}
              className="delete-day-btn"
            >
              Delete Day
            </button>
          </div>

          <div className="stat-card appointments-today">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Appointments Today</h3>
              <div className="stat-number">{todayQueues.length}</div>
            </div>
          </div>
        </div>

        <div className="appointments-section">
          <h3 className="section-title">Today's Appointments</h3>
          {todayQueues.length === 0 ? (
            <div className="no-appointments">
              <div className="no-appointments-icon">📋</div>
              <p>No appointments for today</p>
            </div>
          ) : (
            <div className="appointments-container">
              <div className="appointments-grid">
                {todayQueues.map((queue) => (
                  <div key={queue.queueId} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-time">
                        {new Date(queue.appointmentDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="appointment-status">Active</div>
                    </div>
                    <div className="appointment-content">
                      <div className="patient-info">
                        <div className="patient-icon">👤</div>
                        <div className="patient-details">
                          <div className="patient-name">
                            {queue.clientFirstName} {queue.clientLastName}
                          </div>
                          <div className="patient-id">ID: {queue.clientId}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;