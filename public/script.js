// Select DOM elements
const messagesContainer = document.querySelector('.messages');
const inputField = document.querySelector('input[type="text"]');
const sendBtn = document.querySelector('#send-btn');
const newChatBtn = document.querySelector('#new-chat-btn');
const personaBtn = document.querySelector('#persona-btn');
const modal = document.querySelector('#persona-modal');
const closeBtn = document.querySelector('.close');
const personaButtonsContainer = document.querySelector('.persona-buttons');

// Event listeners
sendBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', clearMessages);
personaBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', outsideClick);

// API endpoints
const personasUrl = '/api/personas';
const initGptUrl = '/api/gpt/init';

// Populate persona buttons
async function populatePersonaButtons() {
  const personas = await fetch(personasUrl).then(res => res.json());
  for (const persona of personas) {
    const button = document.createElement('button');
    button.classList.add('persona-button');
    button.innerHTML = `
      <img src="${persona.profile_pic}" alt="${persona.name}">
      <p>${persona.name}</p>
    `;
    button.addEventListener('click', () => {
      clearMessages();
      initGpt(persona.name);
      closeModal();
    });
    personaButtonsContainer.appendChild(button);
  }
}

// Send message function
function sendMessage() {
  const message = inputField.value.trim();
  if (message !== '') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'outgoing');
    messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    messagesContainer.appendChild(messageDiv);
    inputField.value = '';
  }
}

// Clear messages function
function clearMessages() {
  messagesContainer.innerHTML = '';
}

// Initialize GPT with a persona
async function initGpt(personaName) {
  await fetch(initGptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: personaName
    })
  });
}

// Open modal function
function openModal() {
  modal.style.display = 'block';
}

// Close modal function
function closeModal() {
  modal.style.display = 'none';
}

// Close modal when user clicks outside of it
function outsideClick(e) {
  if (e.target == modal) {
    closeModal();
  }
}

// Populate persona buttons
populatePersonaButtons();
