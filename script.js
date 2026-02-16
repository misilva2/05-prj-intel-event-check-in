// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const celebration = document.getElementById("celebration");
const waterCountElement = document.getElementById("waterCount");
const zeroCountElement = document.getElementById("zeroCount");
const powerCountElement = document.getElementById("powerCount");
const attendeeList = document.getElementById("attendeeList");

// Track attendance
let count = 0;
let attendees = [];
const maxCount = 50;
const storageKey = "intelEventCheckInProgress";

// Draw the attendee list on the page using the current attendees array.
function renderAttendeeList() {
  attendeeList.innerHTML = "";

  attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    listItem.classList.add("attendee-item", attendee.team);

    const attendeeName = document.createElement("span");
    attendeeName.classList.add("attendee-name");
    attendeeName.textContent = attendee.name;

    const attendeeTeam = document.createElement("span");
    attendeeTeam.classList.add("attendee-team", attendee.team);
    attendeeTeam.textContent = attendee.teamName;

    listItem.appendChild(attendeeName);
    listItem.appendChild(attendeeTeam);
    attendeeList.appendChild(listItem);
  });
}

// Save all attendance data to local storage so it survives page refresh.
function saveProgress() {
  const progressData = {
    count: count,
    waterCount: parseInt(waterCountElement.textContent, 10),
    zeroCount: parseInt(zeroCountElement.textContent, 10),
    powerCount: parseInt(powerCountElement.textContent, 10),
    attendees: attendees,
  };

  localStorage.setItem(storageKey, JSON.stringify(progressData));
}

// Load saved attendance data from local storage when the page opens.
function restoreProgress() {
  const savedData = localStorage.getItem(storageKey);

  if (!savedData) {
    return;
  }

  let progressData;

  try {
    progressData = JSON.parse(savedData);
  } catch (error) {
    console.log("Saved progress data was invalid and has been reset.");
    localStorage.removeItem(storageKey);
    return;
  }

  count = progressData.count || 0;
  waterCountElement.textContent = progressData.waterCount || 0;
  zeroCountElement.textContent = progressData.zeroCount || 0;
  powerCountElement.textContent = progressData.powerCount || 0;

  if (Array.isArray(progressData.attendees)) {
    attendees = progressData.attendees;
  } else {
    attendees = [];
  }

  renderAttendeeList();

  const percentage = Math.round((count / maxCount) * 100);
  attendeeCount.textContent = count;
  progressBar.style.width = `${percentage}%`;

  if (count > 0) {
    updateTeamCelebration();
  }
}

// Show the winning team celebration when the attendance goal is reached.
function updateTeamCelebration() {
  const waterCount = parseInt(waterCountElement.textContent, 10);
  const zeroCount = parseInt(zeroCountElement.textContent, 10);
  const powerCount = parseInt(powerCountElement.textContent, 10);

  const allTeamCards = document.querySelectorAll(".team-card");
  allTeamCards.forEach(function (card) {
    card.classList.remove("celebrating");
  });

  if (count < maxCount) {
    celebration.style.display = "none";
    celebration.textContent = "";
    return;
  }

  let winningTeam = "water";
  let highestCount = waterCount;

  if (zeroCount > highestCount) {
    winningTeam = "zero";
    highestCount = zeroCount;
  }

  if (powerCount > highestCount) {
    winningTeam = "power";
    highestCount = powerCount;
  }

  let winnerName = "Team Water Wise";

  if (winningTeam === "zero") {
    winnerName = "Team Net Zero";
  }

  if (winningTeam === "power") {
    winnerName = "Team Renewables";
  }

  const winnerCard = document.querySelector(`.team-card.${winningTeam}`);
  winnerCard.classList.add("celebrating");

  celebration.textContent = `🎉 Goal reached! ${winnerName} wins with ${highestCount} attendee${highestCount === 1 ? "" : "s"}!`;

  celebration.style.display = "block";
}

// Run this code every time the user submits the check-in form.
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from submitting normally

  if (count >= maxCount) {
    const fullMessage = `🚫 Check-in closed. Event is at full capacity (${maxCount}/${maxCount}).`;
    greeting.textContent = fullMessage;
    greeting.style.display = "block";
    greeting.classList.add("success-message");
    console.log(fullMessage);
    return;
  }

  // Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(`Attendee Name: ${name}, Team: ${team}`);

  // Increment count
  count++;
  console.log("Total check-ins: ", count);

  // Calculate how close we are to the goal and update the progress bar.
  const percentage = Math.round((count / maxCount) * 100);
  console.log(`Progress: ${percentage}%`);

  // Update attendance tracker on page
  attendeeCount.textContent = count;
  progressBar.style.width = `${percentage}%`;

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  // Save this attendee entry so it can be shown in the attendee list.
  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });

  renderAttendeeList();
  updateTeamCelebration();
  saveProgress();

  // Show personalized welcome message
  let message = "";

  if (team === "water") {
    message = `💧 Welcome, ${name}! You joined ${teamName}. Every drop counts!`;
  } else if (team === "zero") {
    message = `🌿 Welcome, ${name}! You joined ${teamName}. Let’s build a net-zero future!`;
  } else if (team === "power") {
    message = `⚡ Welcome, ${name}! You joined ${teamName}. Clean energy starts with us!`;
  } else {
    message = `🥳 Welcome, ${name} from ${teamName}!`;
  }

  greeting.textContent = message;
  greeting.style.display = "block";
  greeting.classList.add("success-message");
  console.log(message);

  //Reset form
  form.reset();
});

// Restore saved data as soon as the page loads.
restoreProgress();
