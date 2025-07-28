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
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      await dispatch(deleteDoctor(id))
      await dispatch(fetchAllDoctors())
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
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
    <Layout title="Secretary Dashboard">
      <div className="secretary-dashboard">
        <div className="dashboard-header">
          <h2>Hello {user?.name}</h2>
          <p>Manage Doctors and Clients</p>
        </div>
        <button
          className="add-btn"
          style={{ background: "linear-gradient(135deg, #4caf50, #2e7d32)" }}
          onClick={async () => {
            try {
              const res = await dispatch(addQueues()).unwrap()
              alert("✔️ " + res)
            } catch (err) {
              alert("❌ Error adding queues")
            }
          }}
        >
          ➕ Create Future Queues
        </button>

        <div className="tabs-container">
          <div className="tabs">
            <button className={`tab ${activeTab === "doctors" ? "active" : ""}`} onClick={() => setActiveTab("doctors")}>
              👨‍⚕️ Doctors ({doctors.length})
            </button>
            <button className={`tab ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>
              👤 Clients ({clients.length})
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
            ➕ Add {activeTab === "doctors" ? "Doctor" : "Client"}
          </button>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editMode || editingClient ? "Edit" : `Add ${activeTab === "doctors" ? "New Doctor" : "New Client"}`}</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>✕</button>
              </div>

              {activeTab === "doctors" ? (
                <form onSubmit={handleAddDoctor} className="add-form">
                  <div className="form-group"><label>First Name</label>
                    <input type="text" value={newDoctor.firstName} onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>Last Name</label>
                    <input type="text" value={newDoctor.lastName} onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>Specialization</label>
                    <input type="text" value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>ID Number</label>
                    <input type="text" value={newDoctor.idNumber} onChange={(e) => setNewDoctor({ ...newDoctor, idNumber: e.target.value })} required disabled={editMode} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{editMode ? "Save Changes" : "Add Doctor"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddClient} className="add-form">
                  <div className="form-group"><label>First Name</label>
                    <input type="text" value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>Last Name</label>
                    <input type="text" value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>Phone</label>
                    <input type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                  </div>
                  <div className="form-group"><label>Email</label>
                    <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                  </div>
                  <div className="form-group"><label>Address</label>
                    <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} required />
                  </div>
                  <div className="form-group"><label>ID Number</label>
                    <input type="text" value={newClient.idNumber} onChange={(e) => setNewClient({ ...newClient, idNumber: e.target.value })} required disabled={editingClient} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{editingClient ? "Save Changes" : "Add Client"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
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
                <span>Loading doctors...</span>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.idNumber} className="item-card doctor-card">
                    <div className="item-info">
                      <h4>{doctor.firstName} {doctor.lastName}</h4>
                      <p>{doctor.specialization}</p>
                      <p>ID: {doctor.idNumber}</p>
                    </div>
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEditDoctor(doctor)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor.idNumber)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="items-grid">
              {clientsLoading ? (
                <span>Loading clients...</span>
              ) : (
                clients.map((client) => (
                  <div key={client.idNumber} className="item-card client-card">
                    <div className="item-info">
                      <h4>{client.firstName} {client.lastName}</h4>
                      <p>📞 {client.phone || "Not provided"}</p>
                      <p>📧 {client.email || "Not provided"}</p>
                      <p>🏠 {client.address}</p>
                      <p>ID: {client.idNumber}</p>
                    </div>
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEditClient(client)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteClient(client.idNumber)}>🗑️ Delete</button>
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
