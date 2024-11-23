// Select elements from the DOM
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let conversation = "";
let userMessage = null;
let isResponseGenerating = false;
const fileUploadInput = document.getElementById('csvFileInput');

// API configuration
const API_KEY = "______________"; // Your OpenAI API key here
const API_URL = "https://api.openai.com/v1/chat/completions"; // OpenAI's API endpoint

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
}

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    // If all words are displayed
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75);
}

// Fetch response from OpenAI API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  console.log(conversation)
  const textElement = incomingMessageDiv.querySelector(".text"); // Getting text element

  try {
    // Send a POST request to the API with the user's message
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}` // Include OpenAI API key in Authorization header
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Specify GPT-4o mini model
        messages: [{ role: "user", content: conversation }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Get the API response text
    const apiResponse = data.choices[0].message.content;
    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
  } catch (error) { // Handle error
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
}

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="../Images/chatbot-image.jpg" alt="GPT avatar">
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

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  generateAPIResponse(incomingMessageDiv);
}

document.querySelector('.typing-input').addEventListener('input', function () {
    this.style.height = 'auto'; // Reset height
    this.style.height = `${Math.min(this.scrollHeight, 5 * parseFloat(getComputedStyle(this).lineHeight))}px`; // Set new height, with max height limit
  });
  
  document.querySelector('.typing-input').addEventListener('keydown', function (event) {
    if (event.key === "Enter" && !event.shiftKey) {  // Ensure Shift key is not held for multiline input
      event.preventDefault(); // Prevent default action (like form submission)
      handleOutgoingChat();   // Trigger the chat sending function
    }
  });

// Copy message text to the clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done"; // Show confirmation icon
  setTimeout(() => copyButton.innerText = "content_copy", 1000); // Revert icon after 1 second
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if(!userMessage || isResponseGenerating) return; // Exit if there is no message or response is generating

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="../Images/user-image.png" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  conversation += `${userMessage}\n`

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = conversation;
  chatContainer.appendChild(outgoingMessageDiv);
  
  typingForm.reset(); // Clear input field
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const csvAnalyzer = new CSVAnalyzer();
  let analysisResult;

  try {
    // Process CSV file and retrieve analysis result
    analysisResult = await csvAnalyzer.processCSV(file);
    console.log("CSV Analysis Result:", analysisResult); // Debug output

    // Format analysis result into a string to send as the first message
    userMessage = `CSV Analysis Result:\n${JSON.stringify(analysisResult, null, 2)}`;

    // Display confirmation message about uploaded file
    const fileName = file.name;
    const html = `<div class="message-content">
                    <img class="avatar" alt="User avatar">
                    <p class="text">Uploaded Document: ${fileName}</p>
                  </div>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    chatContainer.appendChild(outgoingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Send the analysis result to Gemini API
    handleOutgoingChat();  // This will automatically pick up `userMessage` and send it
  } catch (error) {
    console.error("Error processing CSV file:", error);
    const errorHtml = `<div class="message-content">
                         <p class="text error">Error processing CSV: ${error.message}</p>
                       </div>`;
    const errorMessageDiv = createMessageElement(errorHtml, "outgoing");
    chatContainer.appendChild(errorMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }
};

// Attach the event listener to handle file uploads, theme toggle, delete chats, and load initial data from local storage
fileUploadInput.addEventListener('change', handleFileUpload);
toggleThemeButton.addEventListener("click", () => { /* theme toggle logic */ });
deleteChatButton.addEventListener("click", () => { /* delete chats logic */ });
typingForm.addEventListener("submit", (e) => { /* handle outgoing chat */ });
suggestions.forEach(suggestion => suggestion.addEventListener("click", () => { /* handle suggestions */ }));
loadDataFromLocalstorage();


// Ensure this function is added to the file upload event listener
fileUploadInput.addEventListener('change', handleFileUpload);


// Toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  handleOutgoingChat();
});

// Attach file upload event listener
fileUploadInput.addEventListener('change', handleFileUpload);

// Load initial data from local storage
loadDataFromLocalstorage();