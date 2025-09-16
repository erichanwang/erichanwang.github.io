let tokenClient;
let gapiInited = false;
let gisInited = false;
let calendar;
let CLIENT_ID = '';
let API_KEY = '';

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  if (!API_KEY) {
    console.error('API_KEY is not set.');
    return;
  }
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  gisInited = true;
}

function setClientCredentials(clientId, apiKey) {
  CLIENT_ID = clientId;
  API_KEY = apiKey;
  if (gapiInited) {
    gapi.client.setApiKey(API_KEY);
  }
}

// Authenticate user
function handleAuthClick() {
  if (!CLIENT_ID) {
    alert('Client ID is not set. Please call setClientCredentials(clientId, apiKey) first.');
    return;
  }
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token&access_type=offline&prompt=consent`;
  window.location.href = authUrl;
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('calendar').innerHTML = '';
    document.getElementById('event-details-container').innerHTML = '';
    document.getElementById('authorize-button').style.display = 'block';
    document.getElementById('signout-button').style.display = 'none';
  }
}

// Fetch and display events
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById('calendar').innerHTML = err.message;
    return;
  }

  const events = response.result.items;
  const calendarEl = document.getElementById('calendar');
  const eventDetailsContainer = document.getElementById('event-details-container');

  if (!calendar) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: events.map(event => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      })),
      dateClick: function(info) {
        const title = prompt('Enter event title:');
        if (title) {
          addEvent(title, info.dateStr);
        }
      },
    });
    calendar.render();
  } else {
    calendar.removeAllEvents();
    calendar.addEventSource(events.map(event => ({
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    })));
  }

  // Populate event details container
  eventDetailsContainer.innerHTML = '';
  if (events.length === 0) {
    eventDetailsContainer.innerHTML = '<p>No upcoming events found.</p>';
  } else {
    events.forEach(event => {
      const eventBox = document.createElement('div');
      eventBox.className = 'event-box';

      const title = document.createElement('div');
      title.className = 'event-title';
      title.textContent = event.summary || '(No Title)';

      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end.dateTime || event.end.date;

      const time = document.createElement('div');
      time.className = 'event-time';
      time.textContent = formatEventTime(startTime, endTime);

      eventBox.appendChild(title);
      eventBox.appendChild(time);
      eventDetailsContainer.appendChild(eventBox);
    });
  }
}

function formatEventTime(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    // Same day event
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  } else {
    // Multi-day event
    return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
  }
}

// Add new event
async function addEvent(title, date) {
  const event = {
    'summary': title,
    'start': {
      'date': date,
    },
    'end': {
      'date': date,
    },
  };

  try {
    const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event,
    });
    await request;
    listUpcomingEvents(); // Refresh events
  } catch (err) {
    console.error('Error adding event:', err);
  }
}

document.getElementById('authorize-button').onclick = handleAuthClick;
document.getElementById('signout-button').onclick = handleSignoutClick;
document.getElementById('login-button').onclick = handleAuthClick;

// Check for access token in URL hash on page load
function checkForToken() {
  const hash = window.location.hash;
  if (hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    if (accessToken) {
      gapi.client.setToken({
        access_token: accessToken,
        expires_in: expiresIn,
        token_type: 'Bearer'
      });
      // Clear the hash
      window.history.replaceState(null, null, window.location.pathname);
      // Show sign out button and load events
      document.getElementById('signout-button').style.display = 'block';
      document.getElementById('authorize-button').style.display = 'none';
      listUpcomingEvents();
    }
  }
}

// Call checkForToken on page load
window.addEventListener('load', checkForToken);

// Expose setClientCredentials to global scope for dynamic setting
window.setClientCredentials = setClientCredentials;
