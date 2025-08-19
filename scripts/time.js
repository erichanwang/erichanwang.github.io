/* ======  CONFIGURATION  ====== */
const schedule = {
    1: { start: 825,  end: 915 },
    2: { start: 920,  end: 1010 },
    3: { start: 1015, end: 1105 },
    4: { start: 1110, end: 1200 },
    5: { start: 1205, end: 135  },
  WIN: { start: 140,  end: 210 },
    6: { start: 215,  end: 305  },
    7: { start: 310,  end: 400  },
  };
  const win = { start: 140, end: 210 };
  const USER_TEAM = "purpleB";   // B-lunch default
  
  /* ======  HELPERS  ====== */
  const toMinutes = str => {
    const h = Math.floor(str / 100);
    const m = str % 100;
    return h * 60 + m;
  };
  
  const minutesToString = m => {
    const h24 = Math.floor(m / 60);
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    const min = (m % 60).toString().padStart(2, "0");
    return `${h12}:${min} ${suffix}`;
  };
  
  const nowMinutes = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };
  
  /* ======  SCHEDULE STRING  ====== */
  function getBlock() {
    const n = nowMinutes();
  
    // WIN
    if (n >= toMinutes(win.start) && n < toMinutes(win.end))
      return "WIN 2:20-2:10 PM";
  
    // 4/5 block (B-lunch)
    const p4Start = toMinutes(schedule[4].start);
    const p5End   = toMinutes(schedule[5].end);
  
    if (n >= p4Start && n < p5End) {
      if (n < toMinutes(1200)) return "Period 4 11:10 AM-12:00 PM";
      if (n < toMinutes(1230)) return "B Lunch 12:00-12:30 PM";
    }
  
    // All other periods
    for (const p of [1, 2, 3, 6, 7]) {
      const s = toMinutes(schedule[p].start);
      const e = toMinutes(schedule[p].end);
      if (n >= s && n < e)
        return `Period ${p} ${minutesToString(s)}-${minutesToString(e)}`;
    }
  
    return "No class in session";
  }
  
  /* ======  UPDATE DOM  ====== */
  function updateSchedule() {
    const el = document.getElementById("schedule-info");
    if (el) el.textContent = getBlock();
  }
  
  /* ======  UPDATE CLOCK  ====== */
  function updateClock() {
    const el = document.getElementById("local-time");
    if (el) el.textContent = new Date().toLocaleTimeString();
  }
  
  /* ======  START / LOOP  ====== */
  updateClock();
  updateSchedule();
  setInterval(() => {
    updateClock();
    updateSchedule();
  }, 1_000);