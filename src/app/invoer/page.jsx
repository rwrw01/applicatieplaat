'use client'
import { useState } from 'react'
import { Upload, Table } from 'lucide-react'
import clsx from 'clsx'
import CSVUpload from '@/components/invoer/CSVUpload'
import HandmatigInvoer from '@/components/invoer/HandmatigInvoer'

type Tab = 'csv' | 'handmatig'

export default function InvoerPage() {
  const [actieveTab, setActieveTab] = useState<Tab>('csv')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Data invoeren</h1>

      {/* Tabbladen */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActieveTab('csv')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            actieveTab === 'csv'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Upload size={16} /> CSV uploaden
        </button>
        <button
          onClick={() => setActieveTab('handmatig')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            actieveTab === 'handmatig'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Table size={16} /> Handmatig invoeren
        </button>
      </div>

      {actieveTab === 'csv'
        ? <CSVUpload />
        : <HandmatigInvoer />
      }
    </div>
  )
}