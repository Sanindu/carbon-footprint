// src/components/ResultChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function ResultChart({ result }) {
  const data = [
    { name: "Distance (km)", value: result.total_distance },
    { name: "Litres Used", value: result.litres_used },
    { name: "CO₂ (kg)", value: result.co2_emitted },
  ];

  return (
    <BarChart width={400} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={true} />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
}

export default ResultChart;
