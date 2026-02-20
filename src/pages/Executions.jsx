import React, { useEffect, useState, useRef } from "react"

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
   Reusable Resizable TH
====================== */
const ResizableTH = ({
  children,
  columnKey,
  widths,
  setWidths,
  defaultWidth
}) => {
  const ref = useRef(null)

  const startResize = e => {
    e.preventDefault()

    const startX = e.clientX
    const startWidth = ref.current.offsetWidth

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = e => {
      const newWidth = Math.max(80, startWidth + (e.clientX - startX))
      setWidths(prev => ({ ...prev, [columnKey]: newWidth }))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  return (
    <th
      ref={ref}
      style={{
        width: widths[columnKey] || defaultWidth,
        minWidth: 80
      }}
    >
      {children}
      <div className="col-resizer" onMouseDown={startResize} />
    </th>
  )
}

export default function Execution() {
  const [executions, setExecutions] = useState([])
  const [expanded, setExpanded] = useState({})
  const [expandedOutput, setExpandedOutput] = useState({})

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  /* widths MAIN table */
  const [mainWidths, setMainWidths] = useState({})

  /* widths NESTED table */
  const [nestedWidths, setNestedWidths] = useState({})

  const defaultMain = {
    execution: 120,
    status: 120,
    workflow: 260,
    description: 350,
    created: 200
  }

  const defaultNested = {
    stepid: 100,
    name: 200,
    status: 120,
    output: 400
  }

  const toggle = id =>
    setExpanded(e => ({ ...e, [id]: !e[id] }))

  const toggleOutput = id =>
    setExpandedOutput(o => ({ ...o, [id]: !o[id] }))

  const load = async () => {
    const params = new URLSearchParams()
    params.append("page", page)
    params.append("pageSize", pageSize)

    const res = await fetch(
      `${API}/step-executions-grouped?${params.toString()}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )

    const json = await res.json()
    setExecutions(json.data)
    setTotalPages(json.pagination?.totalPages || 1)
  }

  useEffect(() => {
    load()
  }, [page, pageSize])

  return (
    <div className="steps-page">
      <h1>Executions</h1>

      {/* ================= MAIN TABLE ================= */}
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 40 }} />
            <ResizableTH columnKey="execution" widths={mainWidths} setWidths={setMainWidths} defaultWidth={defaultMain.execution}>Execution</ResizableTH>
            <ResizableTH columnKey="status" widths={mainWidths} setWidths={setMainWidths} defaultWidth={defaultMain.status}>Status</ResizableTH>
            <ResizableTH columnKey="workflow" widths={mainWidths} setWidths={setMainWidths} defaultWidth={defaultMain.workflow}>Workflow</ResizableTH>
            <ResizableTH columnKey="description" widths={mainWidths} setWidths={setMainWidths} defaultWidth={defaultMain.description}>Description</ResizableTH>
            <ResizableTH columnKey="created" widths={mainWidths} setWidths={setMainWidths} defaultWidth={defaultMain.created}>Created</ResizableTH>
          </tr>
        </thead>

        <tbody>
          {executions.map(e => {
            const exec = e.execution
            const open = expanded[exec.id]

            return (
              <React.Fragment key={exec.id}>
                <tr>
                  <td>
                    <button className="btn-icon" onClick={() => toggle(exec.id)}>
                      {open ? "▾" : "▸"}
                    </button>
                  </td>

                  <td style={{ width: mainWidths.execution || defaultMain.execution }}>{exec.id}</td>
                  <td style={{ width: mainWidths.status || defaultMain.status }}>
                    <span className={statusClass(exec.status)}>
                      {exec.status}
                    </span>
                  </td>
                  <td style={{ width: mainWidths.workflow || defaultMain.workflow }}>
                    {exec.workflow?.name}
                  </td>
                  <td style={{ width: mainWidths.description || defaultMain.description }}>
                    {exec.workflow?.description}
                  </td>
                  <td style={{ width: mainWidths.created || defaultMain.created }}>
                    {e.created_at ? new Date(e.created_at).toLocaleString() : "-"}
                  </td>
                </tr>

                {open && (
                  <tr>
                    <td colSpan={6} className="execution-expanded indent-bar-deep">
                      
                      {/* ============== NESTED TABLE ============== */}
                      <table className="table">
                        <thead>
                          <tr>
                            <ResizableTH columnKey="stepid" widths={nestedWidths} setWidths={setNestedWidths} defaultWidth={defaultNested.stepid}>Step ID</ResizableTH>
                            <ResizableTH columnKey="name" widths={nestedWidths} setWidths={setNestedWidths} defaultWidth={defaultNested.name}>Name</ResizableTH>
                            <ResizableTH columnKey="status" widths={nestedWidths} setWidths={setNestedWidths} defaultWidth={defaultNested.status}>Status</ResizableTH>
                            <ResizableTH columnKey="output" widths={nestedWidths} setWidths={setNestedWidths} defaultWidth={defaultNested.output}>Output</ResizableTH>
                          </tr>
                        </thead>

                        <tbody>
                          {e.steps?.map(s => (
                            <tr key={s.id}>
                              <td style={{ width: nestedWidths.stepid || defaultNested.stepid }}>{s.step_id}</td>
                              <td style={{ width: nestedWidths.name || defaultNested.name }}>{s.step?.Name}</td>
                              <td style={{ width: nestedWidths.status || defaultNested.status }}>
                                <span className={statusClass(s.status)}>
                                  {s.status}
                                </span>
                              </td>
                              <td style={{ width: nestedWidths.output || defaultNested.output }}>
                                <pre
                                  style={{ cursor: "pointer" }}
                                  onClick={() => toggleOutput(s.id)}
                                >
                                  {expandedOutput[s.id]
                                    ? s.output
                                    : s.output?.slice(0, 300)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}