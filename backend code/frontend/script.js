let authToken = null;

// Login function
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if(response.ok) {
            authToken = data.token;
            loadEvents();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Event Registration
async function registerEvent(eventId) {
    if(!authToken) {
        alert('Please login first');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ eventId })
        });

        if(response.ok) {
            alert('Registration successful!');
            updateEventDisplay(eventId);
        } else {
            alert('Registration failed: ' + (await response.json()).message);
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
}

// Load Events
async function loadEvents() {
    try {
        const response = await fetch('/api/events/all', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const events = await response.json();
        renderEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Render Events to DOM
function renderEvents(events) {
    const container = document.querySelector('.events-section');
    container.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-date">
                <span>${new Date(event.schedule).getDate()}</span>
                <span>${new Date(event.schedule).toLocaleString('default', { month: 'short' })}</span>
                <span>${new Date(event.schedule).getFullYear()}</span>
            </div>
            <div class="event-details">
                <h4>${event.title}</h4>
                <p>${event.era} | ${event.location}</p>
                <p>${event.description}</p>
            </div>
            <button class="register-btn" 
                onclick="registerEvent('${event._id}')"
                ${event.registeredUsers.length >= event.capacity ? 'disabled' : ''}>
                ${event.registeredUsers.length >= event.capacity ? 'FULL' : 'REGISTER'}
            </button>
        </div>
    `).join('');
}

