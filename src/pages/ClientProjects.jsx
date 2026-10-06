import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import api from '../api.js'
import { money, date } from '../format.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  async function load() {
    const rows = (await api.get('/projects', { params: { clientId: user.id } })).data
    const everyone = (await api.get('/users')).data
    setProjects(rows)
    setUsers(everyone)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [user])

  function nameOf(id) {
    const person = users.find((row) => row.id === id)
    return person ? person.name : 'Unknown'
  }

  if (error) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {error}
      </p>
    )
  }
  if (!projects) return <p className="text-slate-500">Loading…</p>

  const activeCount = projects.filter((project) => project.status === 'active').length

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Projects</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {projects.length} total · {activeCount} active · shared with your freelancer
          </p>
        </div>
      </header>

      {projects.length === 0 ? (
        <p className="text-slate-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {projects.map((project) => (
            <Link
              className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-[18px] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600"
              key={project.id}
              to={'/projects/' + project.id}
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={project.status} />
                <span className="font-semibold tabular-nums">{money(project.budget)}</span>
              </div>

              <h3 className="text-[17px] font-bold">{project.title}</h3>
              <p className="m-0 line-clamp-2 text-sm text-slate-500">{project.description}</p>

              <div className="h-[7px] overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-300"
                  style={{ width: project.progress + '%' }}
                />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2.5 text-xs text-slate-500">
                <span>Freelancer: {nameOf(project.freelancerId)}</span>
                <span>Due {date(project.dueDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
