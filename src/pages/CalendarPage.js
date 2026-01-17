import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import enGB from "date-fns/locale/en-GB";
import Modal from "react-modal";
import Navbar from "../components/Navbar";
import { colors } from "../styles/theme";
import { useLocation, useNavigate } from "react-router-dom";


import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/CalendarStyles.css";

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
   format,
   parse,
   startOfWeek,
   getDay,
   locales,
});

// Google Login
async function connectGoogle() {
   try {
      const res = await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/google/login", {
         method: "GET",
         credentials: "include",
      });

      const data = await res.json();
      if (data.auth_url) {
         window.open(data.auth_url, "_blank", "width=500,height=600");
      }
   } catch (err) {
      console.error("Google login error:", err);
   }
}

function extractImageFromDescription(desc) {
   if (!desc) return null;
   const match = desc.match(/IMAGE_URL:\s*(.*)/i);
   return match ? match[1].trim() : null;
}

function CalendarPage() {
   const [events, setEvents] = useState([]);
   const [wardrobe, setWardrobe] = useState([]);
   const [selectedDate, setSelectedDate] = useState(null);
   const [selectedItem, setSelectedItem] = useState(null);
   const [eventTitle, setEventTitle] = useState("");
   const [modalOpen, setModalOpen] = useState(false);
   const [modalStep, setModalStep] = useState("wardrobe");
   const [loading, setLoading] = useState(false);

   const [calendarLoading, setCalendarLoading] = useState(true);

   const [startHour, setStartHour] = useState(9);
   const [startMinute, setStartMinute] = useState(0);
   const [endHour, setEndHour] = useState(10);
   const [endMinute, setEndMinute] = useState(0);

   const hours = Array.from({ length: 24 }, (_, i) => i);
   const minutes = [0, 15, 30, 45];

   // Load Google Calendar events
   const loadGoogleEvents = useCallback(async () => {
      try {
         setCalendarLoading(true);

         const res = await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/calendar/list", {
            credentials: "include",
         });

         const data = await res.json();

         if (!Array.isArray(data)) {
            setCalendarLoading(false);
            return;
         }

         const mapped = data
            .filter((ev) => ev.summary?.startsWith("Outfit: "))
            .map((ev) => {
               const isAllDay = !!ev.start.date;
               const start = ev.start.date
                  ? new Date(ev.start.date + "T00:00:00")
                  : new Date(ev.start.dateTime);
               const end = ev.end.date
                  ? new Date(ev.end.date + "T00:00:00")
                  : new Date(ev.end.dateTime);

               return {
                  id: ev.id,
                  title: ev.summary.replace("Outfit: ", ""),
                  start,
                  end,
                  allDay: isAllDay,
                  image: extractImageFromDescription(ev.description),
               };
            });

         setEvents(mapped);
      } catch (err) {
         console.error("Error loading Google Calendar events:", err);
      } finally {
         setTimeout(() => setCalendarLoading(false), 200);
      }
   }, []);
   useEffect(() => {
      loadGoogleEvents();
   }, [loadGoogleEvents]);

   const location = useLocation();
   const navigate = useNavigate();


   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const items = params.get("items");

      if (items) {
         const today = new Date();
         const parsedItems = JSON.parse(items);

         parsedItems.forEach((item, index) => {
            // Set start time staggered by 1 hour each
            const start = new Date(today);
            start.setHours(today.getHours() + index, 0, 0);

            const end = new Date(today);
            end.setHours(today.getHours() + index + 1, 0, 0);

            // Auto add without showing modal
            fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/calendar/add", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({
                  item: item.type,
                  start: start.toISOString(),
                  end: end.toISOString(),
                  image_url: item.image_path,
               }),
            }).then(() => loadGoogleEvents());
         });

         alert(`Added ${parsedItems.length} outfits to today's calendar!`);
         setTimeout(() => navigate("/calendar"), 500);
      }
   }, [location.search, loadGoogleEvents, navigate]);


   // Load wardrobe from backend
   const loadWardrobe = async () => {
      try {
         setLoading(true);
         const res = await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/wardrobe");
         const data = await res.json();
         setWardrobe(data.wardrobe || []);
      } catch (err) {
         console.error("Error loading wardrobe:", err);
      } finally {
         setLoading(false);
      }
   };

   // Click empty slot (month / week / day)
   const handleSelectSlot = ({ start }) => {
      setSelectedDate(start);
      setSelectedItem(null);
      setEventTitle("");
      setModalStep("wardrobe");
      loadWardrobe();
      setModalOpen(true);

      const base = start || new Date();
      const sh = base.getHours();
      setStartHour(sh);
      setStartMinute(0);
      setEndHour((sh + 1) % 24);
      setEndMinute(0);
   };

   // Confirm time + outfit → local + Google Calendar
   const handleConfirmOutfit = useCallback(
      async () => {
         if (!selectedDate || !selectedItem) return;

         const start = new Date(selectedDate);
         start.setHours(startHour, startMinute, 0, 0);

         const end = new Date(selectedDate);
         end.setHours(endHour, endMinute, 0, 0);

         const title = eventTitle.trim() || selectedItem.type;
         const outfitName = title;

         const newEvent = {
            id: Date.now() + Math.random(),
            title,
            start,
            end,
            allDay: false,
            image: selectedItem.image_path,
         };

         setEvents((prev) => [...prev, newEvent]);
         setModalOpen(false);

         try {
            await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/calendar/add", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({
                  item: outfitName,
                  date: format(selectedDate, "yyyy-MM-dd"), // still sent, unused now but harmless
                  start: start.toISOString(),
                  end: end.toISOString(),
                  image_url: selectedItem.image_path,
               }),
            });

            loadGoogleEvents();
         } catch (err) {
            console.error("Google Calendar save error:", err);
         }
      },
      [
         selectedDate,
         selectedItem,
         startHour,
         startMinute,
         endHour,
         endMinute,
         eventTitle,
         loadGoogleEvents,
      ]
   );

   // Delete event locally + Google Calendar
   const handleDelete = useCallback(
      async (event) => {
         // Remove from local UI
         setEvents((prev) => prev.filter((e) => e.id !== event.id));

         if (typeof event.id === "string") {
            try {
               await fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/calendar/delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ event_id: event.id }),
               });
            } catch (error) {
               console.error("Failed to delete Google event:", error);
            }
         }
      },
      []
   );

   // Month cell UI
   const CustomMonthDateHeader = ({ date }) => {
      const dayEvents = events.filter((e) => isSameDay(e.start, date));

      return (
         <div className="custom-month-cell">
            <div
               className="cell-date"
               onClick={() => handleSelectSlot({ start: date })}
            >
               {format(date, "d")}
            </div>

            <div className="cell-outfits scrollable">
               {dayEvents.map((event) =>
                  event.image ? (
                     <div
                        key={event.id}
                        className="calendar-outfit"
                        style={{
                           backgroundImage: event.image
                              ? `url(${event.image})`
                              : undefined,
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                     >
                        <button
                           className="delete-btn"
                           onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event);
                           }}
                        >
                           ×
                        </button>
                     </div>
                  ) : null
               )}
            </div>
         </div>
      );
   };

   // Week/day view event UI
   const ImageEvent = ({ event }) => (
      <div
         className="week-event"
         onMouseDown={(e) => e.stopPropagation()}
         onClick={(e) => e.stopPropagation()}
      >
         <div
            className="week-event-image"
            style={
               event.image
                  ? { backgroundImage: `url(${event.image})` }
                  : { backgroundColor: "#e2e8f0" }
            }
         />
         <span className="week-event-title">{event.title}</span>

         <button
            className="delete-btn small"
            onClick={(e) => {
               e.stopPropagation();
               handleDelete(event);
            }}
         >
            ×
         </button>
      </div>
   );
   return (
      <>
         <Navbar />

         <div
            style={{
               background: "linear-gradient(135deg, #f3f7fa, #e0edf4)",
               minHeight: "100vh",
               padding: "40px 24px",
            }}
         >
            <h1
               style={{
                  color: colors.primary,
                  textAlign: "center",
                  fontSize: "2.6rem",
                  marginBottom: "24px",
                  letterSpacing: "0.03em",
               }}
            >
               Outfit Calendar
            </h1>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
               <button
                  onClick={connectGoogle}
                  style={{
                     padding: "12px 24px",
                     background: colors.primary,
                     color: "#fff",
                     border: "none",
                     borderRadius: "999px",
                     fontSize: "1rem",
                     cursor: "pointer",
                     fontWeight: "600",
                     boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                  }}
               >
                  Connect Google Calendar
               </button>
            </div>

            <div
               style={{
                  height: "75vh",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  background: "#fff",
                  borderRadius: "24px",
                  padding: "20px",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
                  position: "relative",
               }}
            >
               {calendarLoading && (
                  <div
                     style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 5,
                        pointerEvents: "none",
                        fontSize: "1rem",
                        color: "#64748b",
                     }}
                  >
                     Loading events from Google Calendar…
                  </div>
               )}

               <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  popup
                  views={["month", "week", "day", "agenda"]}
                  onSelectSlot={handleSelectSlot}
                  components={{
                     month: { dateHeader: CustomMonthDateHeader },
                     event: ImageEvent,
                  }}
                  style={{ height: "100%" }}
               />
            </div>

            <Modal
               isOpen={modalOpen}
               onRequestClose={() => setModalOpen(false)}
               ariaHideApp={false}
               style={{
                  overlay: {
                     backgroundColor: "rgba(15, 23, 42, 0.75)",
                     zIndex: 9999,
                  },
                  content: {
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     width: "92vw",
                     maxWidth: "1100px",
                     height: "90vh",
                     borderRadius: "24px",
                     padding: "26px 28px 24px 28px",
                     background: "#f4f7fb",
                     boxShadow: "0 18px 45px rgba(15,23,42,0.55)",
                     border: "none",
                     overflow: "hidden",
                     display: "flex",
                     flexDirection: "column",
                  },
               }}
            >
               <button
                  onClick={() => setModalOpen(false)}
                  style={{
                     position: "absolute",
                     top: "18px",
                     right: "26px",
                     background: "rgba(15,23,42,0.08)",
                     border: "none",
                     borderRadius: "999px",
                     width: "32px",
                     height: "32px",
                     fontSize: "1.2rem",
                     color: "#0f172a",
                     cursor: "pointer",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                  }}
               >
                  ×
               </button>

               <div
                  style={{
                     marginBottom: "18px",
                     paddingRight: "40px",
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     gap: "16px",
                  }}
               >
                  <div>
                     <h2
                        style={{
                           color: colors.primary,
                           fontSize: "1.85rem",
                           margin: 0,
                        }}
                     >
                        {modalStep === "wardrobe"
                           ? "Choose an outfit"
                           : "Schedule your outfit"}
                     </h2>
                     <p
                        style={{
                           margin: "4px 0 0",
                           color: "#475569",
                           fontSize: "0.95rem",
                        }}
                     >
                        {selectedDate && format(selectedDate, "EEEE, dd MMM yyyy")}
                     </p>
                  </div>

                  {modalStep === "time" && selectedItem && (
                     <button
                        onClick={() => {
                           setModalStep("wardrobe");
                           setSelectedItem(null);
                           setEventTitle("");
                        }}
                        style={{
                           padding: "8px 14px",
                           borderRadius: "999px",
                           border: "none",
                           background: "#e2e8f0",
                           color: "#0f172a",
                           cursor: "pointer",
                           fontSize: "0.85rem",
                           fontWeight: 500,
                        }}
                     >
                        ← Change outfit
                     </button>
                  )}
               </div>

               <div
                  style={{
                     flex: 1,
                     display: "flex",
                     gap: "20px",
                     minHeight: 0,
                  }}
               >

                  {modalStep === "wardrobe" && (
                     <div
                        style={{
                           flex: 1,
                           overflowY: "auto",
                           paddingRight: "4px",
                        }}
                     >
                        {loading ? (
                           <p style={{ textAlign: "center", marginTop: "30px" }}>
                              Loading your wardrobe...
                           </p>
                        ) : wardrobe.length > 0 ? (
                           <div
                              style={{
                                 display: "grid",
                                 gridTemplateColumns:
                                    "repeat(auto-fit, minmax(160px, 1fr))",
                                 gap: "18px",
                              }}
                           >
                              {wardrobe.map((item) => (
                                 <div
                                    key={item.image_path}
                                    style={{
                                       cursor: "pointer",
                                       borderRadius: "18px",
                                       background: "#ffffff",
                                       overflow: "hidden",
                                       boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
                                       transition:
                                          "transform 0.22s ease, box-shadow 0.22s",
                                    }}
                                    onMouseOver={(e) => {
                                       e.currentTarget.style.transform =
                                          "translateY(-4px)";
                                       e.currentTarget.style.boxShadow =
                                          "0 16px 32px rgba(15,23,42,0.22)";
                                    }}
                                    onMouseOut={(e) => {
                                       e.currentTarget.style.transform =
                                          "translateY(0)";
                                       e.currentTarget.style.boxShadow =
                                          "0 8px 20px rgba(15,23,42,0.12)";
                                    }}
                                    onClick={() => {
                                       setSelectedItem(item);
                                       setEventTitle(item.type);
                                       const base = selectedDate || new Date();
                                       const sh = base.getHours();
                                       setStartHour(sh);
                                       setStartMinute(0);
                                       setEndHour((sh + 1) % 24);
                                       setEndMinute(0);
                                       setModalStep("time");
                                    }}
                                 >
                                    <img
                                       src={item.image_path}
                                       alt={item.type}
                                       style={{
                                          width: "100%",
                                          height: "190px",
                                          objectFit: "cover",
                                       }}
                                    />
                                    <div
                                       style={{
                                          padding: "10px 12px 12px",
                                          textAlign: "center",
                                          color: colors.primary,
                                          fontWeight: 600,
                                       }}
                                    >
                                       <p
                                          style={{
                                             margin: 0,
                                             fontSize: "0.95rem",
                                          }}
                                       >
                                          {item.type}
                                       </p>
                                       <small
                                          style={{
                                             color: "#64748b",
                                             fontSize: "0.8rem",
                                          }}
                                       >
                                          {item.colour}, {item.material}
                                       </small>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p style={{ textAlign: "center", marginTop: "30px" }}>
                              No clothes found in your wardrobe.
                           </p>
                        )}
                     </div>
                  )}
                  {modalStep === "time" && selectedItem && (
                     <div
                        style={{
                           flex: 1,
                           display: "flex",
                           flexDirection: "row",
                           gap: "20px",
                           minHeight: 0,
                        }}
                     >
                        <div
                           style={{
                              flex: 0.9,
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "14px",
                              boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                           }}
                        >
                           <div
                              style={{
                                 borderRadius: "14px",
                                 overflow: "hidden",
                                 background: "#e2e8f0",
                                 flex: 1,
                                 minHeight: "200px",
                              }}
                           >
                              <img
                                 src={selectedItem.image_path}
                                 alt={selectedItem.type}
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                 }}
                              />
                           </div>
                           <div>
                              <p
                                 style={{
                                    margin: "6px 0 2px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                 }}
                              >
                                 {selectedItem.type}
                              </p>
                              <p
                                 style={{
                                    margin: 0,
                                    fontSize: "0.9rem",
                                    color: "#64748b",
                                 }}
                              >
                                 {selectedItem.colour}, {selectedItem.material}
                              </p>
                           </div>
                        </div>
                        <div
                           style={{
                              flex: 1.1,
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px 18px",
                              boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px",
                              minHeight: 0,
                           }}
                        >
                           <div>
                              <label
                                 style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    marginBottom: "4px",
                                 }}
                              >
                                 Event name
                              </label>
                              <input
                                 type="text"
                                 value={eventTitle}
                                 onChange={(e) => setEventTitle(e.target.value)}
                                 placeholder={selectedItem.type}
                                 style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: "999px",
                                    border: "1px solid #cbd5f0",
                                    outline: "none",
                                    fontSize: "0.9rem",
                                    color: "#0f172a",
                                    background: "#f8fafc",
                                 }}
                              />
                           </div>

                           <div>
                              <h3
                                 style={{
                                    margin: "4px 0 6px",
                                    fontSize: "1.1rem",
                                    color: "#0f172a",
                                 }}
                              >
                                 Choose time
                              </h3>
                              <p
                                 style={{
                                    margin: 0,
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                 }}
                              >
                                 24-hour time • scroll or tap to select
                              </p>
                           </div>

                           <div className="time-picker-wrapper">
                              {/* Start row */}
                              <div className="time-wheel-row">
                                 <span className="time-wheel-label">Start</span>
                                 <div className="time-wheel-pair">
                                    <div className="time-wheel">
                                       <div className="time-wheel-inner">
                                          {hours.map((h) => (
                                             <button
                                                key={`start-h-${h}`}
                                                className={
                                                   "time-wheel-option" +
                                                   (h === startHour ? " selected" : "")
                                                }
                                                onClick={() => setStartHour(h)}
                                             >
                                                {h.toString().padStart(2, "0")}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                    <div className="time-wheel">
                                       <div className="time-wheel-inner">
                                          {minutes.map((m) => (
                                             <button
                                                key={`start-m-${m}`}
                                                className={
                                                   "time-wheel-option" +
                                                   (m === startMinute ? " selected" : "")
                                                }
                                                onClick={() => setStartMinute(m)}
                                             >
                                                {m.toString().padStart(2, "0")}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="time-wheel-row">
                                 <span className="time-wheel-label">End</span>
                                 <div className="time-wheel-pair">
                                    <div className="time-wheel">
                                       <div className="time-wheel-inner">
                                          {hours.map((h) => (
                                             <button
                                                key={`end-h-${h}`}
                                                className={
                                                   "time-wheel-option" +
                                                   (h === endHour ? " selected" : "")
                                                }
                                                onClick={() => setEndHour(h)}
                                             >
                                                {h.toString().padStart(2, "0")}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                    <div className="time-wheel">
                                       <div className="time-wheel-inner">
                                          {minutes.map((m) => (
                                             <button
                                                key={`end-m-${m}`}
                                                className={
                                                   "time-wheel-option" +
                                                   (m === endMinute ? " selected" : "")
                                                }
                                                onClick={() => setEndMinute(m)}
                                             >
                                                {m.toString().padStart(2, "0")}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div
                              style={{
                                 marginTop: "6px",
                                 paddingTop: "8px",
                                 borderTop: "1px solid #e2e8f0",
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 gap: "10px",
                              }}
                           >
                              <div>
                                 <p
                                    style={{
                                       margin: 0,
                                       fontSize: "0.9rem",
                                       color: "#0f172a",
                                       fontWeight: 500,
                                    }}
                                 >
                                    {selectedDate &&
                                       `${format(selectedDate, "dd MMM yyyy")} · ${String(
                                          startHour
                                       ).padStart(2, "0")}:${String(
                                          startMinute
                                       ).padStart(2, "0")} – ${String(
                                          endHour
                                       ).padStart(2, "0")}:${String(
                                          endMinute
                                       ).padStart(2, "0")}`}
                                 </p>
                                 <p
                                    style={{
                                       margin: "2px 0 0",
                                       fontSize: "0.8rem",
                                       color: "#64748b",
                                    }}
                                 >
                                    Will be saved to your Google Calendar.
                                 </p>
                              </div>

                              <button
                                 onClick={handleConfirmOutfit}
                                 style={{
                                    padding: "10px 20px",
                                    borderRadius: "999px",
                                    border: "none",
                                    background: colors.primary,
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    boxShadow: "0 10px 22px rgba(56,189,248,0.42)",
                                 }}
                              >
                                 Save outfit
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </Modal>
         </div>
      </>
   );
}

export default CalendarPage;
