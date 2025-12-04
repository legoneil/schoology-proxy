// --- Load iCal from proxy ---
async function loadIcal() {
    const url = "https://schoology-proxy.onrender.com/ical"; 
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
            const value = rest.join(":");
            if (key.startsWith("SUMMARY")) event.summary = value;
            if (key.startsWith("DTSTART")) event.date = value;
            if (key.startsWith("DESCRIPTION")) event.description = value;
        }
    }

    return events;
}

// ---------- LOCALSTORAGE SYSTEM ----------
function getRemovedList() {
    return JSON.parse(localStorage.getItem("removedAssignments") || "[]");
}

function markRemoved(id) {
    const list = getRemovedList();
    if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem("removedAssignments", JSON.stringify(list));
    }
}

function isRemoved(id) {
    return getRemovedList().includes(id);
}

function resetCompleted() {
    localStorage.removeItem("removedAssignments");
    location.reload();
}
// ------------------------------------------


// --- Filter events from today to May 21 ---
function filterByDate(events) {
    const today = new Date();
    const year = today.getFullYear();
    const end = new Date(year + 1, 4, 21);

    return events.filter(e => {
        if (!e.date) return false;
        const y = parseInt(e.date.slice(0, 4));
        const m = parseInt(e.date.slice(4, 6)) - 1;
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

// --- Render assignments with checkboxes + persistence ---
// --- Render assignments to page ---
function render(groups) {
    const container = document.getElementById("assignments");
    container.innerHTML = "";

    for (const className in groups) {
        const group = document.createElement("div");
        group.className = "class-group collapsed";

        const header = document.createElement("div");
        header.className = "class-header";
        header.innerHTML = `
            ${className}
            <span class="arrow">▶</span>
        `;

        const assignmentsContainer = document.createElement("div");
        assignmentsContainer.className = "assignments-container";
        assignmentsContainer.style.display = "none";

        let expanded = false;

        header.addEventListener("click", () => {
            expanded = !expanded;
            assignmentsContainer.style.display = expanded ? "block" : "none";
            group.classList.toggle("collapsed", !expanded);
        });

        groups[className].forEach(e => {
            const id = e.summary + "_" + e.date; // unique ID per assignment

            // skip if completed
            if (isCompleted(id)) return;

            const a = document.createElement("div");
            a.className = "assignment";

            a.innerHTML = `
                <input type="checkbox" class="complete-box">
                <strong>${e.summary}</strong><br>
                Due: ${formatDate(e.date)}
            `;

            // When checked → remove + save to storage
            a.querySelector(".complete-box").addEventListener("change", () => {
                markCompleted(id);
                a.remove();
            });

            assignmentsContainer.appendChild(a);
        });

        group.appendChild(header);
        group.appendChild(assignmentsContainer);
        container.appendChild(group);
    }
}


// --- Format date ---
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
        events = filterByDate(events);
        const grouped = groupByClass(events);
        render(grouped);
    } catch (e) {
        console.error(e);
        alert("Error loading iCal. Make sure the proxy is running.");
    }
}

main();


