// DOM elements
const sendButton = document.querySelector('.send-button');
const messageInput = document.querySelector('.message-input');
const attachmentButton = document.querySelector('.attachment-button');
const communityButton = document.querySelector('.community-button');
const examplesButton = document.querySelector('.examples-button');
const docsButton = document.querySelector('.docs-button');
const homeButton = document.querySelector('.home-button');

// Event listeners
sendButton.addEventListener('click', function() {
  const message = messageInput.value;
  if (message) {
    console.log('Sending message:', message);
    // Clear input after sending the message
    messageInput.value = '';
  } else {
    console.log('No message to send');
  }
});

attachmentButton.addEventListener('click', function() {
  console.log('Attachment button clicked');
  // Handle attachment functionality here
});

// Navigation buttons
communityButton.addEventListener('click', function() {
  console.log('Navigating to Community page');
  window.location.href = '/community';
});

examplesButton.addEventListener('click', function() {
  console.log('Navigating to Examples page');
  window.location.href = '/examples';
});

docsButton.addEventListener('click', function() {
  console.log('Navigating to Docs page');
  window.location.href = '/docs';
});

homeButton.addEventListener('click', function() {
  console.log('Navigating to Home page');
  window.location.href = '/';
});

messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage(); // Call your sendMessage function
        event.preventDefault(); // Prevent default form submission if necessary
    }
});

// Functions for button actions
function sendMessage() {
  // Get the message text from the input field
  const messageInput = document.querySelector('.message-input'); // Replace with the actual class of your input field
  const message = messageInput.value;

  // Send the message to the chatbot (implement your logic here)
  console.log('Sending message:', message);

  // Clear the input field
  messageInput.value = '';
}

function openAttachmentDialog() {
  // Open a file selection dialog for the user
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.click();

  // Handle the selected file (implement your logic here)
  fileInput.addEventListener('change', function() {
    const selectedFile = fileInput.files[0];
    console.log('Selected file:', selectedFile);
    // Attach the file to the message (implement your logic here)
  });
}


function openHelpPage() {
    const helpModal = document.createElement('div');
    helpModal.classList.add('help-modal');
    helpModal.innerHTML = `
      <h2>Help</h2>
      <p>Here's some helpful information about the chatbot...</p>
      <button onclick="closeHelpModal()">Close</button>
    `;

    document.body.appendChild(helpModal);
}

function closeHelpModal() {
    const helpModal = document.querySelector('.help-modal');
    if (helpModal) {
        helpModal.remove();
    }
}

function toggleMessageHistory() {
  // Toggle the visibility of the message history and input field (implement your logic here)
  console.log('Toggling message history');
}

function openCommunity() {
  // Open a new tab or window with the URL of the community
  window.location.href = 'community.html'; // Replace with the actual URL of your community
}

function openExamples() {
  // Open a page or dialog with examples
  window.location.href = 'examples.html'; // Replace with the actual URL of your examples page
}

function openDocs() {
  // Open a new tab or window with the URL of the documentation
  window.location.href = 'docs.html'; // Replace with the actual URL of your documentation
}

function goToHome() {
  // Reload the current page or navigate to the main page URL
  window.location.href = 'index.html'; // Replace with the actual URL of your main page
}

function sendSuggestedResponse(message) {
    // Get the input field element
    const messageInput = document.querySelector('.message-input');
  
    // Set the input field value to the suggested response
    messageInput.value = message;
  
    // Trigger the send button (if you have one)
    const sendButton = document.querySelector('.send-button');
    if (sendButton) {
      sendButton.click();
    }
}


// Function to append messages to the chat container
function appendMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'user' ? 'text-right' : 'text-left';
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the latest message
}

/*
function sendMessageToGemini(message) {
    // Replace with your actual API endpoint and API key
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
  
    const requestData = {
      contents: [{
        parts: [{
          text: message
        }]
      }]
    };
  

      
    fetch(apiEndpoint + '?key=' + apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error sending message: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
          // ... (process the response)
          // Save the message to local storage
          const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
          chatHistory.push({
            sender: 'user',
            message: message
          });
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        })
        .catch(error => {
          console.error('Error:', error);
          // Display an error message to the user
        });
      } */
