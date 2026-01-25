// Dashboard.jsx
import React from 'react';
import './Dashboard.css';

function Dashboard() {
  const token = localStorage.getItem('token');

  return (
    <div className="dashboard-container">
      {/* Floating spheres */}
      <div className="floating-sphere"></div>
      <div className="floating-sphere"></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="logo">Career Coaches</div>
          <nav>
            <ul>
              <li className="active">Dashboard</li>
              <li>Checklist</li>
              <li>Time off</li>
              <li>Attendance</li>
              <li>Payroll</li>
              <li>Performance</li>
              <li>Requirement</li>
            </ul>
          </nav>
        </div>
        <div className="sidebar-footer">
          Help Center<br />
          Settings<br />
          Logout
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Header */}
        <div className="header">
          <h2>Hi, Anderson N. Horvath</h2>
          <p>This is your HR report so far</p>
        </div>

        {/* Stats cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>4510</h4>
            <span>Total employees</span>
          </div>
          <div className="stat-card">
            <h4>1450</h4>
            <span>Job applicants</span>
          </div>
          <div className="stat-card">
            <h4>4510</h4>
            <span>New members</span>
          </div>
          <div className="stat-card">
            <h4>4510</h4>
            <span>Resigned members</span>
          </div>
        </div>

        {/* Middle grid */}
        <div className="middle-grid">
          {/* Bar chart */}
          <div className="cards">
            <h3>Team Performance</h3>
            <div className="bar-chart">
              <div className="bar" style={{ height: "60%" }}></div>
              <div className="bar" style={{ height: "80%" }}></div>
              <div className="bar" style={{ height: "40%" }}></div>
              <div className="bar" style={{ height: "90%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
            </div>
          </div>

          {/* Donut */}
          <div className="cards center">
            <h3>Total Employees</h3>
            <div className="donut">145</div>
            <p>Developers · Designers · Marketing</p>
          </div>
        </div>

        {/* Table */}
        <div className="cards">
          <h3>Employees</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Job Title</th>
                <th>Manager</th>
                <th>Department</th>
                <th>Office</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Brenda H. Branam</td>
                <td>Web Dev</td>
                <td>@Alexander12</td>
                <td>Product</td>
                <td>5 days</td>
              </tr>
              <tr>
                <td>Mark J. Lopez</td>
                <td>UI Designer</td>
                <td>@Keever45</td>
                <td>Project</td>
                <td>20 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Optional token check message */}
        {!token && (
          <div className="cards" style={{ marginTop: "20px" }}>
            <p>Prijavi se ili registruj da vidiš svoj sadržaj 🚀</p>
            <div className="button-group">
              <button onClick={() => window.location.href = '/login'}>Prijava</button>
              <button onClick={() => window.location.href = '/register'}>Registracija</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Dashboard;
