"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "BRT",
    services: 8,
    rates: 64,
  },
  {
    name: "GLS",
    services: 12,
    rates: 96,
  },
  {
    name: "DHL",
    services: 10,
    rates: 80,
  },
  {
    name: "Poste Italiane",
    services: 6,
    rates: 48,
  },
  {
    name: "InPost",
    services: 4,
    rates: 32,
  },
  {
    name: "Other",
    services: 8,
    rates: 22,
  },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="services" name="Services" fill="#122857" />
        <Bar dataKey="rates" name="Rates" fill="#1e3a80" />
      </BarChart>
    </ResponsiveContainer>
  )
}

