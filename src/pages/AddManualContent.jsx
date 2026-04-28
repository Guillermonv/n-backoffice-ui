import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const API = import.meta.env.VITE_API_BASE_URL

const STATUSES = ["PENDING", "PUBLISHED", "ERROR", "CANCELLED"]

const EMPTY_FORM = {
  title: "",
  slug: "",
  short_description: "",
  message: "",
  status: "PENDING",
  category: "",
  sub_category: "",
  image_url: "",
  image_prompt: "",
}

export default function AddManualContent() {
  const { apiFetch } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.title.trim()) {
      setError("Title is required")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    const body = {
      title: form.title,
      slug: form.slug,
      short_description: form.short_description,
      message: form.message,
      status: form.status,
      category: form.category,
      sub_category: form.sub_category,
      image_url: form.image_url,
      image_prompt: form.image_prompt,
    }

    const res = await apiFetch(`${API}/content-reviews/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (!res || !res.ok) {
      const json = res ? await res.json().catch(() => ({})) : {}
      setError(json.error || "Failed to update content")
      return
    }

    const updated = await res.json()
    setSuccess(`Content updated successfully — ID: ${updated.id}`)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="steps-page">
      <h1>Update Content</h1>

      <form className="manual-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">

          <label className="form-field">
            <span className="form-label">Title <span className="required">*</span></span>
            <input
              className="form-input"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
              placeholder="Article title"
            />
          </label>

          <label className="form-field">
            <span className="form-label">Slug</span>
            <input
              className="form-input"
              value={form.slug}
              onChange={e => handleChange("slug", e.target.value)}
              placeholder="article-slug"
            />
          </label>

          <label className="form-field">
            <span className="form-label">Status</span>
            <select
              className="form-input select-primary"
              value={form.status}
              onChange={e => handleChange("status", e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Category</span>
            <input
              className="form-input"
              value={form.category}
              onChange={e => handleChange("category", e.target.value)}
              placeholder="e.g. finance, tech"
            />
          </label>

          <label className="form-field">
            <span className="form-label">Sub Category</span>
            <input
              className="form-input"
              value={form.sub_category}
              onChange={e => handleChange("sub_category", e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="form-field">
            <span className="form-label">Image URL</span>
            <input
              className="form-input"
              value={form.image_url}
              onChange={e => handleChange("image_url", e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="form-field">
            <span className="form-label">Image Prompt</span>
            <input
              className="form-input"
              value={form.image_prompt}
              onChange={e => handleChange("image_prompt", e.target.value)}
              placeholder="Prompt used to generate the image"
            />
          </label>

          <label className="form-field form-field-full">
            <span className="form-label">Short Description</span>
            <input
              className="form-input"
              value={form.short_description}
              onChange={e => handleChange("short_description", e.target.value)}
              placeholder="Brief summary"
            />
          </label>

          <label className="form-field form-field-full">
            <span className="form-label">Message</span>
            <textarea
              className="form-input form-textarea"
              value={form.message}
              onChange={e => handleChange("message", e.target.value)}
              placeholder="Full article body"
              rows={10}
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary btn-submit" disabled={saving}>
            {saving ? "Updating…" : "Update Content"}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => { setForm(EMPTY_FORM); setSuccess(null); setError(null) }}
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}