"use client"
import { addQueues } from "../../slices/queueSlice"

import type React from "react"
import { useEffect, useState } from "react"
import { useUser } from "../../contexts/UserContext"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { fetchAllDoctors, addDoctor, deleteDoctor, updateDoctor } from "../../slices/doctorSlice"
import { fetchClients, addClient, deleteClient, updateClient } from "../../slices/clientSlice"
import type { M_Doctor, M_Client } from "../../types"
import Layout from "../Layout/Layout"
import "./SecretaryDashboard.css"

const SecretaryDashboard: React.FC = () => {
  const { user } = useUser()
  const dispatch = useAppDispatch()
  const { doctors, loading: doctorsLoading } = useAppSelector((state) => state.doctor)
  const { clients, loading: clientsLoading } = useAppSelector((state) => state.client)

  const [activeTab, setActiveTab] = useState<"doctors" | "clients">("doctors")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingClient, setEditingClient] = useState(false)
  const [newDoctor, setNewDoctor] = useState<Partial<M_Doctor>>({
    firstName: "",
    lastName: "",
    specialization: "",
    idNumber: "",
  })
  const [newClient, setNewClient] = useState<Partial<M_Client>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    idNumber: "",
  })

  useEffect(() => {
    dispatch(fetchAllDoctors())
    dispatch(fetchClients())
  }, [dispatch])

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newDoctor.firstName && newDoctor.lastName && newDoctor.specialization && newDoctor.idNumber) {
      console.log('Adding doctor:', newDoctor);

      if (editMode) {
        await dispatch(updateDoctor(newDoctor as M_Doctor))
      } else {
        await dispatch(addDoctor(newDoctor as M_Doctor))
      }
      await dispatch(fetchAllDoctors())
      setNewDoctor({ firstName: "", lastName: "", specialization: "", idNumber: "" })
      setShowAddForm(false)
      setEditMode(false)
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newClient.firstName && newClient.lastName && newClient.address && newClient.idNumber) {
      if (editingClient) {
        await dispatch(updateClient(newClient as M_Client))
      } else {
        await dispatch(addClient({ ...newClient, clinicQueues: [] } as M_Client))
      }
      await dispatch(fetchClients())
      setNewClient({ firstName: "", lastName: "", phone: "", email: "", address: "", idNumber: "" })
      setShowAddForm(false)
      setEditingClient(false)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את הרופא?")) {
      await dispatch(deleteDoctor(id))
      await dispatch(fetchAllDoctors())
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את המטופל?")) {
      await dispatch(deleteClient(id))
      await dispatch(fetchClients())
    }
  }

  const startEditDoctor = (doctor: M_Doctor) => {
    setNewDoctor(doctor)
    setEditMode(true)
    setShowAddForm(true)
  }

  const startEditClient = (client: M_Client) => {
    setNewClient(client)
    setEditingClient(true)
    setShowAddForm(true)
  }

  return (
    <Layout title="לוח בקרה - מזכירה">
      <div className="secretary-dashboard">
        <div className="dashboard-header">
          <h2>שלום {user?.name}</h2>
          <p>ניהול רופאים ומטופלים</p>
        </div>
        <button
          className="add-btn"
          style={{ background: "linear-gradient(135deg, #4caf50, #2e7d32)" }}
          onClick={async () => {
            try {
              const res = await dispatch(addQueues()).unwrap()
              alert("✔️ " + res)
            } catch (err) {
              alert("❌ שגיאה בהוספת תורים")
            }
          }}
        >
          ➕ צור תורים עתידיים
        </button>

        <div className="tabs-container">
          <div className="tabs">
            <button className={`tab ${activeTab === "doctors" ? "active" : ""}`} onClick={() => setActiveTab("doctors")}>
              👨‍⚕️ רופאים ({doctors.length})
            </button>
            <button className={`tab ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>
              👤 מטופלים ({clients.length})
            </button>
          </div>

          <button className="add-btn" onClick={() => {
            setShowAddForm(true)
            setEditMode(false)
            setEditingClient(false)
            if (activeTab === "doctors") {
              setNewDoctor({ firstName: "", lastName: "", specialization: "", idNumber: "" })
            } else {
              setNewClient({ firstName: "", lastName: "", phone: "", email: "", address: "", idNumber: "" })
            }
          }}>
            ➕ הוסף {activeTab === "doctors" ? "רופא" : "מטופל"}
          </button>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editMode || editingClient ? "עריכה" : `הוסף ${activeTab === "doctors" ? "רופא חדש" : "מטופל חדש"}`}</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>✕</button>
              </div>

              {activeTab === "doctors" ? (
                <form onSubmit={handleAddDoctor} className="add-form">
                  <div className="form-group"><label>שם פרטי</label>
                    <input type="text" value={newDoctor.firstName} onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>שם משפחה</label>
                    <input type="text" value={newDoctor.lastName} onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>התמחות</label>
                    <input type="text" value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>תעודת זהות</label>
                    <input type="text" value={newDoctor.idNumber} onChange={(e) => setNewDoctor({ ...newDoctor, idNumber: e.target.value })} required disabled={editMode} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{editMode ? "שמור שינויים" : "הוסף רופא"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>ביטול</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddClient} className="add-form">
                  <div className="form-group"><label>שם פרטי</label>
                    <input type="text" value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>שם משפחה</label>
                    <input type="text" value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>טלפון</label>
                    <input type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                  </div>
                  <div className="form-group"><label>אימייל</label>
                    <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                  </div>
                  <div className="form-group"><label>כתובת</label>
                    <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>תעודת זהות</label>
                    <input type="text" value={newClient.idNumber} onChange={(e) => setNewClient({ ...newClient, idNumber: e.target.value })} required disabled={editingClient} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{editingClient ? "שמור שינויים" : "הוסף מטופל"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>ביטול</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="content-section">
          {activeTab === "doctors" ? (
            <div className="items-grid">
              {doctorsLoading ? (
                <span>טוען רופאים...</span>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.idNumber} className="item-card doctor-card">
                    <div className="item-info">
                      <h4>{doctor.firstName} {doctor.lastName}</h4>
                      <p>{doctor.specialization}</p>
                      <p>ת.ז: {doctor.idNumber}</p>
                    </div>
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEditDoctor(doctor)}>✏️ עריכה</button>
                      <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor.idNumber)}>🗑️ מחיקה</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="items-grid">
              {clientsLoading ? (
                <span>טוען מטופלים...</span>
              ) : (
                clients.map((client) => (
                  <div key={client.idNumber} className="item-card client-card">
                    <div className="item-info">
                      <h4>{client.firstName} {client.lastName}</h4>
                      <p>📞 {client.phone || "לא צוין"}</p>
                      <p>📧 {client.email || "לא צוין"}</p>
                      <p>🏠 {client.address}</p>
                      <p>ת.ז: {client.idNumber}</p>
                    </div>
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEditClient(client)}>✏️ עריכה</button>
                      <button className="delete-btn" onClick={() => handleDeleteClient(client.idNumber)}>🗑️ מחיקה</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default SecretaryDashboard
