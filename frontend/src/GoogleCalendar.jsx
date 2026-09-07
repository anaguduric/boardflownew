import { useEffect, useMemo, useState } from "react";
import "./GoogleCalendar.css";

const API_URL = "http://localhost:3000";

const WEEK_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);

  // JS: Sunday = 0, Monday = 1...
  // Pretvaramo da je Monday = 0
  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previousMonthDays = new Date(year, month, 0).getDate();

  const days = [];

  // Dani prethodnog meseca
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, previousMonthDays - i),
      currentMonth: false,
    });
  }

  // Dani trenutnog meseca
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }

  // Dani sledećeg meseca
  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(year, month + 1, nextDay),
      currentMonth: false,
    });

    nextDay++;
  }

  return days;
}

function formatMonth(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getEventDate(event) {
  const value = event?.start?.dateTime || event?.start?.date;

  if (!value) {
    return null;
  }

  return new Date(value);
}

function formatEventTime(event) {
  if (event?.start?.date) {
    return "All day";
  }

  if (!event?.start?.dateTime) {
    return "";
  }

  return new Date(event.start.dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GoogleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today] = useState(new Date());

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem("token");

  const days = useMemo(() => {
    return getMonthDays(currentDate);
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setEvents([]);
        return;
      }

      const response = await fetch(`${API_URL}/google-calendar/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load Google Calendar events.");
      }

      const data = await response.json();

      setEvents(data.events || []);
    } catch (err) {
      console.error("Google Calendar error:", err);
      setError("Could not load calendar events.");
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  }

  function goToNextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getEventsForDay(day) {
    return events.filter((event) => {
      const eventDate = getEventDate(event);

      if (!eventDate) {
        return false;
      }

      return isSameDay(eventDate, day);
    });
  }

  return (
    <div className="google-calendar">
      {/* HEADER */}

      <div className="google-calendar-header">
        <div className="google-calendar-left">
          <button
            className="calendar-today-btn"
            onClick={goToToday}
          >
            Today
          </button>

          <div className="calendar-navigation">
            <button
              className="calendar-nav-btn"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              ‹
            </button>

            <button
              className="calendar-nav-btn"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <h2>{formatMonth(currentDate)}</h2>
        </div>

        <div className="google-calendar-right">
          <span className="calendar-view-label">
            Month
          </span>

          <button
            className="calendar-refresh-btn"
            onClick={loadEvents}
            title="Refresh calendar"
          >
            ↻
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="calendar-loading">
          Loading your Google Calendar...
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="calendar-error">
          {error}
        </div>
      )}

      {/* WEEK DAYS */}

      <div className="calendar-weekdays">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="calendar-weekday"
          >
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}

      <div className="calendar-grid">
        {days.map((dayInfo, index) => {
          const dayEvents = getEventsForDay(dayInfo.date);

          const isToday = isSameDay(
            dayInfo.date,
            today
          );

          return (
            <div
              key={index}
              className={`calendar-day ${
                !dayInfo.currentMonth
                  ? "calendar-day-other-month"
                  : ""
              }`}
            >
              <div
                className={`calendar-day-number ${
                  isToday
                    ? "calendar-day-today"
                    : ""
                }`}
              >
                {dayInfo.date.getDate()}
              </div>

              <div className="calendar-day-events">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    className="calendar-event"
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    <span className="calendar-event-title">
                      {event.summary || "Untitled event"}
                    </span>

                    <span className="calendar-event-time">
                      {formatEventTime(event)}
                    </span>
                  </button>
                ))}

                {dayEvents.length > 3 && (
                  <button
                    className="calendar-more-events"
                    onClick={() =>
                      setSelectedEvent(dayEvents[3])
                    }
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EVENT MODAL */}

      {selectedEvent && (
        <div
          className="calendar-event-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="calendar-event-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="calendar-modal-close"
              onClick={() =>
                setSelectedEvent(null)
              }
            >
              ×
            </button>

            <h3>
              {selectedEvent.summary ||
                "Untitled event"}
            </h3>

            {selectedEvent.start?.dateTime && (
              <p>
                <strong>Start:</strong>{" "}
                {new Date(
                  selectedEvent.start.dateTime
                ).toLocaleString()}
              </p>
            )}

            {selectedEvent.start?.date && (
              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  selectedEvent.start.date
                ).toLocaleDateString()}
              </p>
            )}

            {selectedEvent.end?.dateTime && (
              <p>
                <strong>End:</strong>{" "}
                {new Date(
                  selectedEvent.end.dateTime
                ).toLocaleString()}
              </p>
            )}

            {selectedEvent.location && (
              <p>
                <strong>Location:</strong>{" "}
                {selectedEvent.location}
              </p>
            )}

            {selectedEvent.description && (
              <p className="calendar-event-description">
                {selectedEvent.description}
              </p>
            )}

            {selectedEvent.htmlLink && (
              <a
                href={selectedEvent.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="open-google-event"
              >
                Open in Google Calendar
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}