import "./Dashboard.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Dashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="dashboard guest">
        <h2>Dobrodošla u BoardFlow 👋</h2>
        <p>Prijavi se da vidiš svoj dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Pregled tvog rada i aktivnosti</p>
      </div>

      {/* Cards */}
      <div className="cards-grid">
        <div className="card">
          <h3>📌 Zadaci</h3>
          <span className="number">12</span>
          <p>Aktivni zadaci</p>
        </div>

        <div className="card">
          <h3>📅 Sastanci</h3>
          <span className="number">3</span>
          <p>Danas</p>
        </div>

        <div className="card">
          <h3>🚀 Projekti</h3>
          <span className="number">5</span>
          <p>U toku</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-card">
        <h3>Kalendar</h3>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          selectable={true}
          events={[
            { title: "Daily standup", date: "2026-01-28" },
            { title: "Deadline", date: "2026-01-30" },
          ]}
        />
      </div>
    </div>
  );
}
