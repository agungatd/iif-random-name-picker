document.addEventListener("DOMContentLoaded", () => {
  const generateButton = document.getElementById("generateButton");
  const copyButton = document.getElementById("copyButton");
  const namesInput = document.getElementById("namesInput");
  const daysInput = document.getElementById("daysInput");
  const startDateInput = document.getElementById("startDateInput");
  const scheduleContainer = document.getElementById("scheduleContainer");
  const errorMessage = document.getElementById("error-message");
  const warningMessage = document.getElementById("warningMessage");

  let finalScheduleData = {};
  let scheduleText = "";

  startDateInput.min = new Date().toISOString().split("T")[0];
  generateButton.addEventListener("click", handleGeneration);
  copyButton.addEventListener("click", copyToClipboard);

  async function handleGeneration() {
    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
    scheduleContainer.innerHTML = "";
    copyButton.style.display = "none";
    errorMessage.style.display = "none";
    warningMessage.style.display = "none";
    scheduleText = "";
    let generationResult = {};

    const names = namesInput.value
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    const wfhDays = parseInt(daysInput.value);

    if (names.length === 0 || wfhDays <= 0) {
      showError("⚠️ Please enter valid names and a number of WFH days (at least 1).");
      resetGenerateButton();
      return;
    }
    if (wfhDays > 5) {
      showError("❗WFH days per person cannot be more than 5.");
      resetGenerateButton();
      return;
    }

    if (wfhDays === 2) {
      generationResult = generateScheduleForTwoDays(names, wfhDays);
    } else {
      generationResult = generateSchedule(names, wfhDays);
    }
    finalScheduleData = generationResult.schedule;

    if (generationResult.unassignedSlots > 0) {
      warningMessage.textContent = `Warning: ${generationResult.unassignedSlots} WFH slot(s) could not be assigned.`;
      warningMessage.style.display = "block";
    }

    const weekDates = getWorkWeek(startDateInput.value);
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    scheduleText = "WFH Schedule:\n------------------\n";

    for (let i = 0; i < dayNames.length; i++) {
      const day = dayNames[i];
      const date = weekDates[i];
      const namesForDay = finalScheduleData[day] || [];

      scheduleText += `[${day}, ${date}]\n`;
      scheduleText += namesForDay.length > 0 ? namesForDay.join(", ") + "\n\n" : "No one\n\n";

      const card = createDayCard(day, date);
      scheduleContainer.appendChild(card);
      await runSlotAnimation(card, names, namesForDay, 1000);
    }

    copyButton.style.display = "block";
    resetGenerateButton();
  }

  function generateSchedule(employees, wfhDays) {
    const E = employees.length;
    const D = 5;
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let masterPool = [];
    for (const name of employees) for (let i = 0; i < wfhDays; i++) masterPool.push(name);
    shuffleArray(masterPool);

    const totalSlots = E * wfhDays;
    const basePerDay = Math.floor(totalSlots / D);
    const extraSlots = totalSlots % D;
    const dailyTargets = Array.from({ length: D }, (_, i) => basePerDay + (i < extraSlots ? 1 : 0));

    let finalSchedule = {};
    let namesUsedByDay = {};

    for (let i = 0; i < D; i++) {
      const day = dayNames[i];
      const target = dailyTargets[i];
      const namesFound = [];
      const currentDayNames = new Set();
      let blockDayNames = new Set();

      if (day === "Tuesday" && namesUsedByDay["Monday"])
        blockDayNames = namesUsedByDay["Monday"];
      if (day === "Friday" && namesUsedByDay["Thursday"])
        blockDayNames = namesUsedByDay["Thursday"];

      for (let j = masterPool.length - 1; j >= 0; j--) {
        if (namesFound.length >= target) break;
        const name = masterPool[j];
        if (!currentDayNames.has(name) && !blockDayNames.has(name)) {
          namesFound.push(name);
          currentDayNames.add(name);
          masterPool.splice(j, 1);
        }
      }

      if (namesFound.length < target) {
        for (let j = masterPool.length - 1; j >= 0; j--) {
          if (namesFound.length >= target) break;
          const name = masterPool[j];
          if (!currentDayNames.has(name)) {
            namesFound.push(name);
            currentDayNames.add(name);
            masterPool.splice(j, 1);
          }
        }
      }

      finalSchedule[day] = namesFound.sort();
      namesUsedByDay[day] = currentDayNames;
    }

    return { schedule: finalSchedule, unassignedSlots: masterPool.length };
  }

  function generateScheduleForTwoDays(employees, wfhDays) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const totalPeople = employees.length;

    // --- 1. VALIDATION FOR RULE 2 ---
    // Rule 2 requires unique pairs. Max unique pairs from 5 days is 10.
    if (wfhDays !== 2) {
      // Your constraints are for 2 days. This logic only works for wfhDays = 2.
      showError("❗To guarantee the 'unique pair' rule, WFH days per person must be exactly 2.");
      return { schedule: {}, unassignedSlots: totalPeople * wfhDays };
    }
    if (totalPeople > 10) {
      showError("❗Cannot guarantee the 'unique pair' rule for more than 10 people with 5 days.");
      return { schedule: {}, unassignedSlots: totalPeople * wfhDays };
    }
    
    // --- 2. GENERATE ALL UNIQUE 2-DAY SCHEDULES ---
    let allSchedules = [];
    for (let i = 0; i < dayNames.length; i++) {
        for (let j = i + 1; j < dayNames.length; j++) {
            // Store the schedule as an array of two day names
            allSchedules.push([dayNames[i], dayNames[j]]);
        }
    }

    // --- 3. SHUFFLE AND SELECT THE NECESSARY NUMBER OF SCHEDULES ---
    shuffleArray(allSchedules); // Use your existing shuffleArray function
    const selectedSchedules = allSchedules.slice(0, totalPeople); // Select 9 unique pairs

    // --- 4. ASSIGN NAMES TO THE UNIQUE SCHEDULES ---
    let nameToScheduleMap = {}; // Maps Name -> [Day1, Day2]
    for (let i = 0; i < totalPeople; i++) {
        nameToScheduleMap[employees[i]] = selectedSchedules[i];
    }
    
    // --- 5. REVERSE MAP TO CREATE THE FINAL DAY-BASED SCHEDULE ---
    let finalSchedule = {
      "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": []
    };

    for (const name in nameToScheduleMap) {
        const [day1, day2] = nameToScheduleMap[name];
        finalSchedule[day1].push(name);
        finalSchedule[day2].push(name);
    }
    
    // Sort names within each day for clean output
    for (const day in finalSchedule) {
      finalSchedule[day].sort();
    }

    // Since we used exactly one unique pair per person, there are no unassigned slots.
    return { schedule: finalSchedule, unassignedSlots: 0 };
  }

  function createDayCard(day, date) {
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `<h3>${day} <span>${date}</span></h3><div class="slot-container"></div>`;
    return card;
  }

  function highlightCenter(container) {
    const spinner = container.querySelector(".slot-spinner");
    const items = spinner.querySelectorAll(".name-tag-spinner");

    // Reset highlights
    items.forEach(el => el.classList.remove("highlight"));

    const containerBottom = container.getBoundingClientRect().bottom;

    // Find the element whose middle is closest to container bottom
    let closest = null;
    let closestDistance = Infinity;
    items.forEach(el => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.bottom - containerBottom);
        if (distance < closestDistance) {
            closest = el;
            closestDistance = distance;
        }
    });

    if (closest) closest.classList.add("highlight");
  }

  function runSlotAnimation(card, allNames, finalNames, spinDuration = 3000) {
    return new Promise((resolve) => {
        const container = card.querySelector(".slot-container");
        const spinner = document.createElement("div");
        spinner.className = "slot-spinner";
        spinner.style.transition = `transform ${spinDuration / 1000}s cubic-bezier(0.25, 1, 0.5, 1)`;
        
        let fakeNames = [];
        for (let i = 0; i < 3; i++) fakeNames.push(...shuffleArray([...allNames]));
        fakeNames.push(...finalNames);

        setInterval(() => highlightCenter(container), 100);
        fakeNames.forEach((name) => {
            const el = document.createElement("div");
            el.className = "name-tag-spinner";
            el.textContent = name;
            el.style.padding = "6px 12px";
            el.style.textAlign = "center";
            el.style.fontSize = "0.7rem";
            el.style.color = "#1e1e1e";
            spinner.appendChild(el);
        });

        container.innerHTML = "";
        container.appendChild(spinner);

        setTimeout(() => card.classList.add("visible"), 100);
        setTimeout(() => {
            const targetScroll = -1 * (spinner.scrollHeight - container.clientHeight);
            spinner.style.transform = `translateY(${targetScroll}px)`;
            // While spinning, update occasionally
        }, 200);

        setTimeout(() => {
            container.innerHTML = "";
            const namesList = document.createElement("div");
            namesList.className = "names-list";
            if (finalNames.length > 0) {
                finalNames.forEach((n) => {
                const tag = document.createElement("div");
                tag.className = "name-tag";
                tag.textContent = n;
                namesList.appendChild(tag);
                });
            } else {
                namesList.innerHTML = `<span style="font-style: italic; font-size: 0.9rem;">No one scheduled</span>`;
            }
            container.appendChild(namesList);
            resolve();
        }, spinDuration);
    });
    }

  function copyToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(scheduleText).then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => (copyButton.textContent = "Copy to Clipboard"), 2000);
      });
    }
  }

  function getWorkWeek(startDateValue) {
    const dates = [];
    let startMonday;
    let baseDate;

    if (startDateValue) {
      const parts = startDateValue.split("-").map(Number);
      baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else baseDate = new Date();

    const dayOfWeek = baseDate.getDay();
    if (!startDateValue) {
      let daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      if (dayOfWeek === 1) daysUntilMonday = 7;
      startMonday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + daysUntilMonday);
    } else {
      const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startMonday = new Date(baseDate.getFullYear(), baseDate.getMonth(), diff);
    }

    for (let i = 0; i < 5; i++) {
      const date = new Date(startMonday.getFullYear(), startMonday.getMonth(), startMonday.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      );
    }
    return dates;
  }

  function shuffleArray(array) {
    // set seed for reproducibility
    // const seed = 42;
    // Math.seed = seed;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.style.color = "#881609ff";
  }

  function resetGenerateButton() {
    generateButton.disabled = false;
    generateButton.textContent = "Generate Schedule";
  }
});

async function sendToTeams(message) {
  const teamsUrl = process.env.TEAMS_URL;
  const payload = { source: "random-picker-web", message: message };

  await fetch(teamsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
