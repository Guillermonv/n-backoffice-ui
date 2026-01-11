import { useEffect, useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_TOKEN = import.meta.env.VITE_API_TOKEN

export default function Agents() {
  const [agents, setAgents] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [editForm, setEditForm] = useState({
    Provider: "",
    Secret: "",
  })

  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    Provider: "",
    Secret: "",
  })

  // ======================
  // Load agents
  // ======================
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    })
    setAgents(await res.json())
  }

  // ======================
  // Edit
  // ======================
  const startEdit = (agent) => {
    setEditingId(agent.ID)
    setEditForm({
      Provider: agent.Provider || "",
      Secret: agent.Secret || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id) => {
    await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Provider: editForm.Provider,
        Secret: editForm.Secret,
      }),
    })

    await loadAgents()
    setEditingId(null)
  }

  // ======================
  // Create
  // ======================
  const startCreate = () => {
    setCreating(true)
    setCreateForm({ Provider: "", Secret: "" })
  }

  const cancelCreate = () => {
    setCreating(false)
  }

  const saveCreate = async () => {
    if (!createForm.Provider) return

    await fetch(`${API_BASE_URL}/agents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Provider: createForm.Provider,
        Secret: createForm.Secret,
      }),
    })

    await loadAgents()
    setCreating(false)
  }

  // ======================
  // Delete
  // ======================
  const deleteAgent = async (id) => {
    const ok = window.confirm("Delete this agent?")
    if (!ok) return

    await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    })

    setAgents((prev) => prev.filter((a) => a.ID !== id))
  }

  return (
    <div>
      {/* ====================== */}
      {/* Header */}
      {/* ====================== */}
      <h1 className="page-header">
        Agents
        {!creating && (
          <button onClick={startCreate} className="btn-primary">
            + Add agent
          </button>
        )}
      </h1>

      {/* ====================== */}
      {/* Create form */}
      {/* ====================== */}
      {creating && (
        <div className="editor" style={{ marginBottom: "1rem" }}>
          <label>Provider</label>
          <input
            value={createForm.Provider}
            onChange={(e) =>
              setCreateForm({ ...createForm, Provider: e.target.value })
            }
          />

          <label>Secret</label>
          <input
            value={createForm.Secret}
            onChange={(e) =>
              setCreateForm({ ...createForm, Secret: e.target.value })
            }
          />

          <div>
            <button onClick={saveCreate} className="btn-icon success">
              ✔️ Save
            </button>
            <button onClick={cancelCreate} className="btn-icon">
              ✖️ Cancel
            </button>
          </div>
        </div>
      )}

      {/* ====================== */}
      {/* Table */}
      {/* ====================== */}
      <table className="table">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th className="col-name">Provider</th>
            <th className="col-name">Secret</th>
            <th className="col-order">Actions</th>
          </tr>
        </thead>

        <tbody>
          {agents.map((a) => {
            const editing = editingId === a.ID

            return (
              <tr key={a.ID} className={editing ? "active" : ""}>
                <td className="col-id">{a.ID}</td>

                <td className="col-name">
                  {editing ? (
                    <input
                      value={editForm.Provider}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          Provider: e.target.value,
                        })
                      }
                    />
                  ) : (
                    a.Provider
                  )}
                </td>

                <td className="col-name">
                  {editing ? (
                    <input
                      value={editForm.Secret}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          Secret: e.target.value,
                        })
                      }
                    />
                  ) : a.Secret ? (
                    "••••••••••"
                  ) : (
                    ""
                  )}
                </td>

                <td className="col-order">
                  {!editing ? (
                    <>
                      <button
                        onClick={() => startEdit(a)}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteAgent(a.ID)}
                        className="btn-icon danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => saveEdit(a.ID)}
                        className="btn-icon success"
                        title="Save"
                      >
                        ✔️
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="btn-icon"
                        title="Cancel"
                      >
                        ✖️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
