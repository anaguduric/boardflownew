import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import "./GoogleCalendar.css";

const API_URL = "http://localhost:3000";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);

  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const previousMonthDays = new Date(
    year,
    month,
    0
  ).getDate();

  const days = [];

  // Previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(
        year,
        month - 1,
        previousMonthDays - i
      ),
      currentMonth: false,
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }

  // Next month
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

function formatSelectedDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
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
  const value =
    event?.start?.dateTime ||
    event?.start?.date;

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

  return new Date(
    event.start.dateTime
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GoogleCalendar() {
  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [today] = useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [events, setEvents] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const token =
    localStorage.getItem("token");

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

      const response = await fetch(
        `${API_URL}/google-calendar/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load Google Calendar events."
        );
      }

      const data = await response.json();

      setEvents(data.events || []);
    } catch (err) {
      console.error(
        "Google Calendar error:",
        err
      );

      setError(
        "Could not load calendar events."
      );
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousMonth() {
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    setCurrentDate(previousMonth);
    setSelectedDate(previousMonth);
  }

  function goToNextMonth() {
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );

    setCurrentDate(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToToday() {
    const todayDate = new Date();

    setCurrentDate(todayDate);
    setSelectedDate(todayDate);
  }

  function getEventsForDay(day) {
    return events.filter((event) => {
      const eventDate =
        getEventDate(event);

      if (!eventDate) {
        return false;
      }

      return isSameDay(
        eventDate,
        day
      );
    });
  }

  const selectedDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventDate =
          getEventDate(event);

        if (!eventDate) {
          return false;
        }

        return isSameDay(
          eventDate,
          selectedDate
        );
      })
      .sort((a, b) => {
        const dateA =
          getEventDate(a);

        const dateB =
          getEventDate(b);

        return dateA - dateB;
      });
  }, [events, selectedDate]);

  return (
    <div className="google-calendar">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="calendar-header">

        <div className="calendar-header-title">

          <div className="calendar-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <h2>Calendar</h2>

            <span>
              {formatMonth(currentDate)}
            </span>
          </div>

        </div>

        <button
          className="calendar-refresh-btn"
          onClick={loadEvents}
          title="Refresh calendar"
          aria-label="Refresh calendar"
        >
          <FaSyncAlt />
        </button>

      </div>

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="calendar-controls">

        <button
          className="calendar-today-btn"
          onClick={goToToday}
        >
          Today
        </button>

        <div className="calendar-month-navigation">

          <button
            className="calendar-nav-btn"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <FaChevronLeft />
          </button>

          <button
            className="calendar-nav-btn"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <FaChevronRight />
          </button>

        </div>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="calendar-loading">
          Loading calendar...
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="calendar-error">
          {error}
        </div>
      )}

      {/* =====================================================
          WEEK DAYS
      ===================================================== */}

      <div className="calendar-weekdays">

        {WEEK_DAYS.map(
          (day, index) => (
            <div
              key={`${day}-${index}`}
              className={`calendar-weekday ${
                index >= 5
                  ? "calendar-weekend"
                  : ""
              }`}
            >
              {day}
            </div>
          )
        )}

      </div>

      {/* =====================================================
          CALENDAR GRID
      ===================================================== */}

      <div className="calendar-grid">

        {days.map(
          (dayInfo, index) => {

            const dayEvents =
              getEventsForDay(
                dayInfo.date
              );

            const isToday =
              isSameDay(
                dayInfo.date,
                today
              );

            const isSelected =
              isSameDay(
                dayInfo.date,
                selectedDate
              );

            return (
              <button
                key={index}
                type="button"
                className={`
                  calendar-day

                  ${
                    !dayInfo.currentMonth
                      ? "calendar-day-other-month"
                      : ""
                  }

                  ${
                    isSelected
                      ? "calendar-day-selected"
                      : ""
                  }
                `}
                onClick={() =>
                  setSelectedDate(
                    dayInfo.date
                  )
                }
              >

                <span
                  className={`
                    calendar-day-number

                    ${
                      isToday
                        ? "calendar-day-today"
                        : ""
                    }
                  `}
                >
                  {dayInfo.date.getDate()}
                </span>

                {/* SAMO MALA TAČKICA AKO POSTOJI EVENT */}

                {dayEvents.length > 0 && (
                  <span className="calendar-event-dot" />
                )}

              </button>
            );
          }
        )}

      </div>

      {/* =====================================================
          SELECTED DAY EVENTS
      ===================================================== */}

      <div className="calendar-upcoming">

        <div className="calendar-section-header">

          <div>
            <h3>Events</h3>

            <span className="selected-date-label">
              {formatSelectedDate(
                selectedDate
              )}
            </span>
          </div>

          {selectedDayEvents.length >
            0 && (
            <span className="calendar-event-count">
              {selectedDayEvents.length}
            </span>
          )}

        </div>

        {/* EMPTY */}

        {selectedDayEvents.length ===
          0 &&
          !loading && (
            <div className="calendar-empty">

              <FaCalendarAlt />

              <p>
                No events for this day
              </p>

            </div>
          )}

        {/* EVENTS */}

        {selectedDayEvents.length >
          0 && (
          <div className="calendar-event-list">

            {selectedDayEvents.map(
              (event) => (
                <button
                  key={event.id}
                  className="calendar-upcoming-event"
                  onClick={() =>
                    setSelectedEvent(
                      event
                    )
                  }
                  type="button"
                >

                  <div className="calendar-event-date">
                    <strong>
                      {formatEventTime(
                        event
                      )}
                    </strong>
                  </div>

                  <div className="calendar-event-info">

                    <strong>
                      {event.summary ||
                        "Untitled event"}
                    </strong>

                    {event.location && (
                      <span className="calendar-event-location">

                        <FaMapMarkerAlt />

                        {event.location}

                      </span>
                    )}

                  </div>

                </button>
              )
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          EVENT MODAL
      ===================================================== */}

      {selectedEvent && (
        <div
          className="calendar-event-overlay"
          onClick={() =>
            setSelectedEvent(null)
          }
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
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="calendar-modal-icon">
              <FaCalendarAlt />
            </div>

            <h3>
              {selectedEvent.summary ||
                "Untitled event"}
            </h3>

            {selectedEvent.start?.dateTime && (
              <p>
                <strong>Start</strong>

                {new Date(
                  selectedEvent.start.dateTime
                ).toLocaleString()}
              </p>
            )}

            {selectedEvent.start?.date && (
              <p>
                <strong>Date</strong>

                {new Date(
                  selectedEvent.start.date
                ).toLocaleDateString()}
              </p>
            )}

            {selectedEvent.end?.dateTime && (
              <p>
                <strong>End</strong>

                {new Date(
                  selectedEvent.end.dateTime
                ).toLocaleString()}
              </p>
            )}

            {selectedEvent.location && (
              <p>
                <strong>Location</strong>

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
                href={
                  selectedEvent.htmlLink
                }
                target="_blank"
                rel="noreferrer"
                className="open-google-event"
              >
                Open in Google Calendar

                <FaExternalLinkAlt />
              </a>
            )}

          </div>

        </div>
      )}

    </div>
  );
}