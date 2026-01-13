import { useEffect, useMemo, useState } from "react"

const API = import.meta.env.VITE_API_BASE_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

export default function Steps() {
  const [steps, setSteps] = useState([])
  const [agents, setAgents] = useState([])
  const [workflows, setWorkflows] = useState([])

  const [workflowFilter, setWorkflowFilter] = useState("all")

  const [selected, setSelected] = useState(null)
  const [selectedAgentId, setSelectedAgentId] = useState("")

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    orderIndex: 1,
    operationType: "AI_CLIENT_CALL",
    workflowId: "",
    agentId: "",
    prompt: ""
  })

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  /* ======================
     Column widths
  ====================== */
  const [columnWidths, setColumnWidths] = useState({
    id: 80,
    name: 180,
    operationType: 220,
    order: 100,
    agent: 160,
    workflow: 260,
    actions: 80
  })

  /* ======================
     Resize handler
  ====================== */
  const startResize = (key, startX) => {
    const startWidth = columnWidths[key]

    const onMouseMove = e => {
      const newWidth = Math.max(60, startWidth + (e.clientX - startX))
      setColumnWidths(w => ({ ...w, [key]: newWidth }))
    }

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  /* ======================
     LOADERS
  ====================== */
  const loadSteps = async () => {
    const res = await fetch(`${API}/steps`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    setSteps(await res.json())
  }

  const loadStepsByWorkflow = async workflowId => {
    const res = await fetch(`${API}/steps/by-workflow/${workflowId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    setSteps(await res.json())
  }

  const loadAll = async () => {
    const [agentsRes, workflowsRes] = await Promise.all([
      fetch(`${API}/agents`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      fetch(`${API}/workflows`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
    ])

    setAgents(
      (await agentsRes.json()).map(a => ({
        id: a.ID,
        provider: a.Provider
      }))
    )

    setWorkflows(await workflowsRes.json())
    await loadSteps()
  }

  useEffect(() => {
    loadAll()
  }, [])

  /* ======================
     CREATE
  ====================== */
  const createStep = async () => {
    setError(null)

    if (!createForm.name || !createForm.workflowId) {
      setError("Name and workflow are required")
      return
    }

    const res = await fetch(`${API}/steps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Name: createForm.name,
        OrderIndex: createForm.orderIndex,
        OperationType: createForm.operationType,
        WorkflowID: Number(createForm.workflowId),
        AgentID: createForm.agentId
          ? Number(createForm.agentId)
          : null,
        Prompt: createForm.prompt
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.error || "Create failed")
      return
    }

    setShowCreate(false)
    setCreateForm({
      name: "",
      orderIndex: 1,
      operationType: "AI_CLIENT_CALL",
      workflowId: "",
      agentId: "",
      prompt: ""
    })

    workflowFilter === "all"
      ? loadSteps()
      : loadStepsByWorkflow(workflowFilter)
  }

  /* ======================
     UPDATE
  ====================== */
  const save = async () => {
    setError(null)

    const res = await fetch(`${API}/steps/${selected.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: selected.name,
        orderIndex: selected.orderIndex,
        operationType: selected.operationType,
        workflowId: selected.workflow.id,
        agentId: selectedAgentId
          ? Number(selectedAgentId)
          : null,
        prompt: selected.prompt
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.error || "Update failed")
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 1200)

    workflowFilter === "all"
      ? loadSteps()
      : loadStepsByWorkflow(workflowFilter)
  }

  /* ======================
     DELETE
  ====================== */
  const deleteStep = async id => {
    if (!window.confirm("Delete this step?")) return

    await fetch(`${API}/steps/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` }
    })

    setSelected(null)

    workflowFilter === "all"
      ? loadSteps()
      : loadStepsByWorkflow(workflowFilter)
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="steps-page">
      <h1>Steps</h1>

      {/* Header */}
      <div className="steps-header">
        <div className="steps-header-left">
          <button
            className="btn-primary"
            onClick={() => setShowCreate(v => !v)}
          >
            {showCreate ? "Cancel Step" : "+ New Step"}
          </button>
        </div>

        <div className="steps-header-center">
          <select
            className="select-primary"
            value={workflowFilter}
            onChange={async e => {
              const value = e.target.value
              setWorkflowFilter(value)
              value === "all"
                ? await loadSteps()
                : await loadStepsByWorkflow(value)
            }}
          >
            <option value="all">All workflows</option>
            {workflows.map(w => (
              <option key={w.ID} value={w.ID}>
                {w.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="steps-header-right" />
      </div>

      {/* Create */}
      {showCreate && (
        <section className="editor">
          <h3>Create Step</h3>

          {error && <div className="error">{error}</div>}

          <label>Name</label>
          <input
            value={createForm.name}
            onChange={e =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
          />

          <label>Order</label>
          <input
            type="number"
            value={createForm.orderIndex}
            onChange={e =>
              setCreateForm({
                ...createForm,
                orderIndex: Number(e.target.value)
              })
            }
          />

          <label>Operation Type</label>
          <input
            value={createForm.operationType}
            onChange={e =>
              setCreateForm({
                ...createForm,
                operationType: e.target.value
              })
            }
          />

          <label>Workflow</label>
          <select
            value={createForm.workflowId}
            onChange={e =>
              setCreateForm({
                ...createForm,
                workflowId: e.target.value
              })
            }
          >
            <option value="">Select workflow</option>
            {workflows.map(w => (
              <option key={w.ID} value={w.ID}>
                {w.Name}
              </option>
            ))}
          </select>

          <label>Agent (optional)</label>
          <select
            value={createForm.agentId}
            onChange={e =>
              setCreateForm({
                ...createForm,
                agentId: e.target.value
              })
            }
          >
            <option value="">None</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.provider}
              </option>
            ))}
          </select>

          <label>Prompt</label>
          <textarea
            rows="6"
            value={createForm.prompt}
            onChange={e =>
              setCreateForm({ ...createForm, prompt: e.target.value })
            }
          />

          <button className="btn-primary" onClick={createStep}>
            Create
          </button>
        </section>
      )}

      {/* Table */}
      <table className="table">
        <thead>
          <tr>
            {[
              ["id", "ID"],
              ["name", "Name"],
              ["operationType", "Operation Type"],
              ["order", "Order"],
              ["agent", "Agent"],
              ["workflow", "Workflow"],
              ["actions", "Actions"]
            ].map(([key, label]) => (
              <th key={key} style={{ width: columnWidths[key] }}>
                {label}
                <span
                  className="col-resizer"
                  onMouseDown={e => startResize(key, e.clientX)}
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {steps.map(s => (
            <tr
              key={s.id}
              className={selected?.id === s.id ? "active" : ""}
              onClick={() => {
                setSelected({ ...s })
                setSelectedAgentId(
                  s.agent?.id ? String(s.agent.id) : ""
                )
                setError(null)
              }}
            >
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.operationType}</td>
              <td>{s.orderIndex}</td>
              <td>{s.agent?.provider || "-"}</td>
              <td>
                <span className="badge-workflow">
                  {s.workflow?.name}
                </span>
              </td>
              <td>
                <button
                  className="btn-icon danger"
                  onClick={e => {
                    e.stopPropagation()
                    deleteStep(s.id)
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit */}
      {selected && (
        <section className="editor">
          <h3>
            Edit Step #{selected.id}
            {saved && <span className="saved-check">✔</span>}
          </h3>

          {error && <div className="error">{error}</div>}

          <label>Name</label>
          <input
            value={selected.name}
            onChange={e =>
              setSelected({ ...selected, name: e.target.value })
            }
          />

          <label>Order</label>
          <input
            type="number"
            value={selected.orderIndex}
            onChange={e =>
              setSelected({
                ...selected,
                orderIndex: Number(e.target.value)
              })
            }
          />

          <label>Operation Type</label>
          <input
            value={selected.operationType}
            onChange={e =>
              setSelected({
                ...selected,
                operationType: e.target.value
              })
            }
          />

          <label>Agent</label>
          <select
            value={selectedAgentId}
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">None</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.provider}
              </option>
            ))}
          </select>

          <label>Prompt</label>
          <textarea
            rows="8"
            value={selected.prompt}
            onChange={e =>
              setSelected({ ...selected, prompt: e.target.value })
            }
          />

          <button className="btn-primary" onClick={save}>
            Save
          </button>
        </section>
      )}
    </div>
  )
}
