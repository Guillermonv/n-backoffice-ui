import { useEffect, useState } from "react"

const API = import.meta.env.VITE_API_BASE_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

export default function Execution() {
  const [executions, setExecutions] = useState([])
  const [expanded, setExpanded] = useState({})

  const toggle = id => {
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  const load = async () => {
    const res = await fetch(`${API}/step-executions-grouped`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    setExecutions(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="steps-page">
      <h1>Executions</h1>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 60 }} />
            <th style={{ width: 120 }}>Execution</th>
            <th style={{ width: 120 }}>Status</th>
            <th style={{ width: 260 }}>Workflow</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {executions.map(e => {
            const exec = e.execution
            const isOpen = expanded[exec.id]

            return (
              <>
                {/* MAIN ROW */}
                <tr
                  key={exec.id}
                  className={isOpen ? "active" : ""}
                >
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => toggle(exec.id)}
                    >
                      {isOpen ? "▾" : "▸"}
                    </button>
                  </td>

                  <td>{exec.id}</td>
                  <td>{exec.status}</td>

                  <td>
                    <span className="badge-workflow">
                      {exec.workflow.name}
                    </span>
                  </td>

                  <td>{exec.workflow.description}</td>
                </tr>

                {/* EXPANDED ROW */}
                {isOpen && (
                  <tr>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <table className="table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 80 }}>Step</th>
                            <th style={{ width: 120 }}>Status</th>
                            <th style={{ width: 220 }}>Name</th>
                            <th style={{ width: 220 }}>Operation</th>
                            <th>Output</th>
                          </tr>
                        </thead>

                        <tbody>
                          {e.steps.map(s => (
                            <tr key={s.id}>
                              <td>{s.step_id}</td>
                              <td>{s.status}</td>
                              <td>{s.step.Name}</td>
                              <td>{s.step.OperationType}</td>
                              <td>
                                <pre
                                  style={{
                                    maxHeight: 200,
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                    margin: 0
                                  }}
                                >
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
