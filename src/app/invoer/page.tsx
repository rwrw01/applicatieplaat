'use client'
import { useState } from 'react'
import { Upload, Table, Save, FileCode } from 'lucide-react'
import TabBalk, { type TabConfig } from '@/components/ui/TabBalk'
import CSVUpload from '@/components/invoer/CSVUpload'
import ArchiMateUpload from '@/components/invoer/ArchiMateUpload'
import HandmatigInvoer from '@/components/invoer/HandmatigInvoer'
import SessionBeheer from '@/components/invoer/SessionBeheer'

type Tab = 'csv' | 'archimate' | 'handmatig' | 'sessie'

const tabs: TabConfig<Tab>[] = [
  { id: 'csv',       label: 'CSV uploaden',             icoon: Upload },
  { id: 'archimate', label: 'ArchiMate',                icoon: FileCode },
  { id: 'handmatig', label: 'Handmatig invoeren',       icoon: Table },
  { id: 'sessie',    label: 'Sessie down- en uploaden', icoon: Save },
]

export default function InvoerPage() {
  const [actieveTab, setActieveTab] = useState<Tab>('csv')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1f2937", marginBottom: 24 }}>Data in/uitvoeren</h1>
      <TabBalk tabs={tabs} actief={actieveTab} onChange={setActieveTab} />
      {actieveTab === 'csv' && <CSVUpload />}
      {actieveTab === 'archimate' && <ArchiMateUpload />}
      {actieveTab === 'handmatig' && <HandmatigInvoer />}
      {actieveTab === 'sessie' && <SessionBeheer />}
    </div>
  )
}
