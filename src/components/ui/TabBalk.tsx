"use client"

interface TabConfig<T extends string> {
  id: T
  label: string
  icoon?: React.ComponentType<{ size?: number }>
}

interface TabBalkProps<T extends string> {
  tabs: TabConfig<T>[]
  actief: T
  onChange: (tab: T) => void
}

export type { TabConfig }

export default function TabBalk<T extends string>({ tabs, actief, onChange }: TabBalkProps<T>) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
      {tabs.map(({ id, label, icoon: Icoon }) => {
        const isActief = actief === id
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", fontSize: 14, fontWeight: 500,
            borderTop: "none", borderLeft: "none", borderRight: "none",
            borderBottomWidth: 2, borderBottomStyle: "solid",
            borderBottomColor: isActief ? "#2563eb" : "transparent",
            color: isActief ? "#2563eb" : "#6b7280",
            background: "none",
            cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
          }}>
            {Icoon && <Icoon size={16} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}
