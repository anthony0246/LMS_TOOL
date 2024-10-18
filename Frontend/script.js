// DOM elements
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.send-button');
const attachmentButton = document.querySelector('.attachment-button');
const communityButton = document.querySelector('.community-button');
const examplesButton = document.querySelector('.examples-button');
const docsButton = document.querySelector('.docs-button');
const homeButton = document.querySelector('.home-button');

// API configuration
const API_KEY = "AIzaSyCSDN6PwrHm1pHwo3UOt9E7KxpYhJr4iuc"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${AIzaSyCSDN6PwrHm1pHwo3UOt9E7KxpYhJr4iuc}`;

// State variables
let userMessage = null;
let isResponseGenerating = false;

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  // Apply the stored theme
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  // Restore saved chats or clear the chat container
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
};

// Create a new message element
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const textarea = document.getElementById('message-input');

textarea.addEventListener('input', function () {
  this.style.height = 'auto'; // Reset height to recalculate based on content
  this.style.height = this.scrollHeight + 'px'; // Dynamically adjust height
});

// Attach the event listener to the textarea for input events
textarea.addEventListener('input', adjustTextareaHeight);

// Call the function on load to set initial height based on any pre-filled text
adjustTextareaHeight();
// Show typing effect
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

// Generate API response
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ role: "user", parts: [{ text: userMessage }] }] 
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    incomingMessageDiv.classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// Show loading animation
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="images/gemini.svg" alt="Gemini avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

// Handle outgoing chat
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".message-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="images/user.jpg" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);

  typingForm.reset();
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 500);
};

// Event listeners for form, theme, and buttons
sendButton.addEventListener('click', handleOutgoingChat);

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

messageInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    handleOutgoingChat();
    event.preventDefault();
  }
});

// Navigation buttons
communityButton.addEventListener('click', () => window.location.href = '/community');
examplesButton.addEventListener('click', () => window.location.href = '/examples');
docsButton.addEventListener('click', () => window.location.href = '/docs');
homeButton.addEventListener('click', () => window.location.href = '/');

// Load saved data on page load
loadDataFromLocalstorage();
