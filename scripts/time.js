/* ======  CONFIGURATION  ====== */
const schedules = {
    A: {
        1: { start: 825, end: 915, name: "Period 1" },
        2: { start: 920, end: 1010, name: "Period 2" },
        3: { start: 1015, end: 1105, name: "Period 3" },
        lunch: { start: 1110, end: 1135, name: "A Lunch" },
        4: { start: 1140, end: 1230, name: "Period 4" },
        5: { start: 1235, end: 1335, name: "Period 5" },
        WIN: { start: 1340, end: 1410, name: "WIN" },
        6: { start: 1415, end: 1505, name: "Period 6" },
        7: { start: 1510, end: 1600, name: "Period 7" },
    },
    B: {
        1: { start: 825, end: 915, name: "Period 1" },
        2: { start: 920, end: 1010, name: "Period 2" },
        3: { start: 1015, end: 1105, name: "Period 3" },
        4: { start: 1110, end: 1200, name: "Period 4" },
        lunch: { start: 1200, end: 1230, name: "B Lunch" },
        5: { start: 1235, end: 1335, name: "Period 5" },
        WIN: { start: 1340, end: 1410, name: "WIN" },
        6: { start: 1415, end: 1505, name: "Period 6" },
        7: { start: 1510, end: 1600, name: "Period 7" },
    },
    C: {
        1: { start: 825, end: 915, name: "Period 1" },
        2: { start: 920, end: 1010, name: "Period 2" },
        3: { start: 1015, end: 1105, name: "Period 3" },
        4: { start: 1110, end: 1200, name: "Period 4" },
        "5A": { start: 1205, end: 1235, name: "Period 5" },
        lunch: { start: 1235, end: 1305, name: "C Lunch" },
        "5B": { start: 1310, end: 1335, name: "Period 5" },
        WIN: { start: 1340, end: 1410, name: "WIN" },
        6: { start: 1415, end: 1505, name: "Period 6" },
        7: { start: 1510, end: 1600, name: "Period 7" },
    },
    D: {
        1: { start: 825, end: 915, name: "Period 1" },
        2: { start: 920, end: 1010, name: "Period 2" },
        3: { start: 1015, end: 1105, name: "Period 3" },
        4: { start: 1110, end: 1200, name: "Period 4" },
        5: { start: 1205, end: 1305, name: "Period 5" },
        lunch: { start: 1305, end: 1335, name: "D Lunch" },
        WIN: { start: 1340, end: 1410, name: "WIN" },
        6: { start: 1415, end: 1505, name: "Period 6" },
        7: { start: 1510, end: 1600, name: "Period 7" },
    }
};

let currentLunch = localStorage.getItem('lunchSchedule') || 'B';

/* ======  HELPERS  ====== */
const toMinutes = time => {
    const h = Math.floor(time / 100);
    const m = time % 100;
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
    const schedule = schedules[currentLunch];

    for (const period in schedule) {
        const s = toMinutes(schedule[period].start);
        const e = toMinutes(schedule[period].end);
        if (n >= s && n < e) {
            return `${schedule[period].name} ${minutesToString(s)} - ${minutesToString(e)}`;
        }
    }

    return "No class in session";
}

/* ======  UPDATE DOM  ====== */
function updateSchedule() {
    const el = document.getElementById("schedule-info");
    if (el) el.textContent = getBlock();
}

/* ======  EVENT LISTENERS  ====== */
const lunchSelect = document.getElementById('lunch-schedule');
if (lunchSelect) {
    lunchSelect.value = currentLunch;
    lunchSelect.addEventListener('change', (event) => {
        currentLunch = event.target.value;
        localStorage.setItem('lunchSchedule', currentLunch);
        updateSchedule();
    });
}

/* ======  START / LOOP  ====== */
updateSchedule();
setInterval(updateSchedule, 1000);
