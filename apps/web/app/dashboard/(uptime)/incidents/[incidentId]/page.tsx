"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function IncidentDetailPage({ params }: { params: { incidentId: string } }) {
  const router = useRouter()
  const { incidentId } = params

  useEffect(() => {
    // Redirect to analytics page with the incident ID as a query parameter
    router.replace(`/dashboard/incidents/analytics?incidentId=${incidentId}`)
  }, [incidentId, router])

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="text-gray-600">Redirecting to incident analytics...</div>
        </div>
      </div>
    </div>
  )
}
