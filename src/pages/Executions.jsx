import { useEffect, useState } from "react"

const API = import.meta.env.VITE_API_BASE_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

const statusClass = status => {
  if (!status) return "status status-yellow"

  const s = status.toLowerCase()
  if (s === "error" || s === "failed") return "status status-red"
  if (s === "done" || s === "success") return "status status-green"

  return "status status-yellow"
}

/* =====================
   Column resize helper
====================== */
const startResize = th => e => {
  e.preventDefault()

  const startX = e.clientX
  const startWidth = th.offsetWidth

  const onMouseMove = e => {
    const newWidth = Math.max(60, startWidth + (e.clientX - startX))
    th.style.width = `${newWidth}px`
  }

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("mouseup", onMouseUp)
}

const ResizableTH = ({ children, style }) => (
  <th style={{ position: "relative", whiteSpace: "nowrap", ...style }}>
    {children}
    <div
      onMouseDown={e =>
        startResize(e.currentTarget.parentElement)(e)
      }
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 6,
        height: "100%",
        cursor: "col-resize"
      }}
    />
  </th>
)

export default function Execution() {
  const [executions, setExecutions] = useState([])
  const [expanded, setExpanded] = useState({})
  const [expandedOutput, setExpandedOutput] = useState({})

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [status, setStatus] = useState("")
  const [workflowName, setWorkflowName] = useState("")

  // 🔥 paginación server-side
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const toggle = id =>
    setExpanded(e => ({ ...e, [id]: !e[id] }))

  const toggleOutput = id =>
    setExpandedOutput(o => ({ ...o, [id]: !o[id] }))

  const load = async () => {
    const params = new URLSearchParams()

    if (fromDate) params.append("from", new Date(fromDate).toISOString())
    if (toDate) params.append("to", new Date(toDate).toISOString())
    if (status) params.append("status", status)
    if (workflowName) params.append("name", workflowName)

    params.append("page", page)
    params.append("pageSize", pageSize)

    const res = await fetch(
      `${API}/step-executions-grouped?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }
    )

    const json = await res.json()
    setExecutions(json.data)
    setTotalPages(json.pagination.totalPages)
  }

  useEffect(() => {
    load()
  }, [page, pageSize])

  return (
    <div className="steps-page">
      {/* ======================
           Filters
      ====================== */}
      <div className="steps-header">
        <h1>Executions</h1>

        <input type="datetime-local" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <input type="datetime-local" value={toDate} onChange={e => setToDate(e.target.value)} />

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="DONE">DONE</option>
          <option value="ERROR">ERROR</option>
          <option value="RUNNING">RUNNING</option>
        </select>

        <input
          type="text"
          placeholder="Workflow name"
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
        />

        <button
          className="btn"
          onClick={() => {
            setPage(1)
            load()
          }}
        >
          Apply
        </button>
      </div>

      {/* ======================
           Pagination
      ====================== */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>

          <span style={{ margin: "0 8px" }}>
            Page {page} / {totalPages}
          </span>

          <button
            className="btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>

        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
            setPage(1)
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* ======================
           Table
      ====================== */}
      <table className="table">
        <thead>
          <tr>
            <th />
            <ResizableTH>Execution</ResizableTH>
            <ResizableTH>Status</ResizableTH>
            <ResizableTH>Workflow</ResizableTH>
            <ResizableTH>Description</ResizableTH>
            <ResizableTH>Created</ResizableTH>
          </tr>
        </thead>

        <tbody>
          {executions.map(e => {
            const exec = e.execution
            const open = expanded[exec.id]

            return (
              <>
                <tr key={exec.id}>
                  <td>
                    <button className="btn-icon" onClick={() => toggle(exec.id)}>
                      {open ? "▾" : "▸"}
                    </button>
                  </td>

                  <td>{exec.id}</td>
                  <td><span className={statusClass(exec.status)}>{exec.status}</span></td>
                  <td>{exec.workflow.name}</td>
                  <td>{exec.workflow.description}</td>
                  <td>{new Date(exec.created_at).toLocaleString()}</td>
                </tr>

                {open && (
                  <tr>
                    <td colSpan={6}>
                      <table className="table">
                        <tbody>
                          {e.steps.map(s => (
                            <tr key={s.id}>
                              <td>{s.step_id}</td>
                              <td>{s.step.Name}</td>
                              <td>{s.status}</td>
                              <td>
                                <pre onClick={() => toggleOutput(s.id)}>
                                  {s.output}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
