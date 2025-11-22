// --- Load iCal from proxy ---
async function loadIcal() {
    const url = "https://schoology-proxy.onrender.com/ical"; // your Node proxy
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch iCal");
    const text = await response.text();
    return parseICal(text);
}

// --- Simple iCal parser ---
function parseICal(data) {
    const events = [];
    const lines = data.split(/\r?\n/);

    let event = null;

    for (let line of lines) {
        if (line === "BEGIN:VEVENT") {
            event = {};
        } else if (line === "END:VEVENT") {
            events.push(event);
            event = null;
        } else if (event) {
            const [key, ...rest] = line.split(":");
            const value = rest.join(":"); // in case description has ":"
            if (key.startsWith("SUMMARY")) event.summary = value;
            if (key.startsWith("DTSTART")) event.date = value;
            if (key.startsWith("DESCRIPTION")) event.description = value;
        }
    }

    return events;
}

// --- Filter events from today to May 21 ---
function filterByDate(events) {
    const today = new Date();
    const year = today.getFullYear();
    const end = new Date(year + 1, 4, 21); // May 21 next year

    return events.filter(e => {
        if (!e.date) return false;
        const y = parseInt(e.date.slice(0, 4));
        const m = parseInt(e.date.slice(4, 6)) - 1; // JS months 0-11
        const d = parseInt(e.date.slice(6, 8));
        const eventDate = new Date(y, m, d);
        return eventDate >= today && eventDate <= end;
    });
}

// --- Group events by class ---
function groupByClass(events) {
    const groups = {};

    events.forEach(e => {
        const className = e.summary ? e.summary.split(" - ")[0] : "Unknown Class";
        if (!groups[className]) groups[className] = [];
        groups[className].push(e);
    });

    return groups;
}

// --- Render assignments to page ---
function render(groups) {
    const container = document.getElementById("assignments");
    container.innerHTML = "";

    for (const className in groups) {
        const div = document.createElement("div");
        div.className = "class-group";
        div.innerHTML = `<h2>${className}</h2>`;

        groups[className].forEach(e => {
            const a = document.createElement("div");
            a.className = "assignment";
            a.innerHTML = `
                <strong>${e.summary}</strong><br>
                Due: ${formatDate(e.date)}
            `;
            div.appendChild(a);
        });

        container.appendChild(div);
    }
}

// --- Format date from iCal (YYYYMMDD) to MM/DD/YYYY ---
function formatDate(str) {
    if (!str) return "Unknown";
    const y = str.slice(0, 4);
    const m = str.slice(4, 6);
    const d = str.slice(6, 8);
    return `${m}/${d}/${y}`;
}

// --- Main ---
async function main() {
    try {
        let events = await loadIcal();
        events = filterByDate(events); // <- filter dates dynamically
        const grouped = groupByClass(events);
        render(grouped);
    } catch (e) {
        console.error(e);
        alert("Error loading iCal. Make sure the proxy is running.");
    }
}

// Run the main function
main();

