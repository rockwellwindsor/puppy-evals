'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sortRunsForComparison } from '@/src/dashboard/compare'

interface Run {
  id: string
  runLabel: string
  createdAt: Date | null
  model: string | null
  puppy: string | null
  avgRetrieval: number | null
  avgGrounding: number | null
  avgPersona: number | null
  questionCount: number | null
}

function fmt(n: number | null, decimals = 2) {
  if (n == null) return '—'
  return Number(n).toFixed(decimals)
}

export default function RunsTable({ runs }: { runs: Run[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const router = useRouter()

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 2) next.add(id)
      return next
    })
  }

  function compare() {
    const sorted = sortRunsForComparison(runs, selected)
    if (!sorted) return
    router.push(`/compare?a=${sorted[0].id}&b=${sorted[1].id}`)
  }

  return (
    <div>
      {selected.size === 2 && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={compare}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Compare selected runs
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            Clear
          </button>
        </div>
      )}
      {selected.size === 1 && (
        <p className="mb-4 text-sm text-zinc-500">Select one more run to compare.</p>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            <th className="pb-2 pr-3 font-medium w-8"></th>
            <th className="pb-2 pr-4 font-medium">Label</th>
            <th className="pb-2 pr-4 font-medium">Puppy</th>
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Retrieval</th>
            <th className="pb-2 pr-4 font-medium">Grounding</th>
            <th className="pb-2 pr-4 font-medium">Persona</th>
            <th className="pb-2 pr-4 font-medium">Questions</th>
            <th className="pb-2 font-medium">Model</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <tr
              key={run.id}
              className={`border-b border-zinc-100 hover:bg-zinc-50 ${selected.has(run.id) ? 'bg-blue-50' : ''}`}
            >
              <td className="py-3 pr-3">
                <input
                  type="checkbox"
                  checked={selected.has(run.id)}
                  onChange={() => toggle(run.id)}
                  disabled={selected.size === 2 && !selected.has(run.id)}
                  className="cursor-pointer"
                />
              </td>
              <td className="py-3 pr-4">
                <Link href={`/runs/${run.id}`} className="text-blue-600 hover:underline font-medium">
                  {run.runLabel}
                </Link>
              </td>
              <td className="py-3 pr-4 capitalize">{run.puppy ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-500">
                {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="py-3 pr-4">{fmt(run.avgRetrieval ? run.avgRetrieval * 100 : null, 1)}%</td>
              <td className="py-3 pr-4">{fmt(run.avgGrounding)} / 5</td>
              <td className="py-3 pr-4">{fmt(run.avgPersona)} / 5</td>
              <td className="py-3 pr-4">{run.questionCount}</td>
              <td className="py-3 text-zinc-500">{run.model ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
