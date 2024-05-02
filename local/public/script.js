const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const conversation = document.querySelector(".conversation");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatInputDiv = document.querySelector(".chat-input");
const starterQuestions = document.getElementById("starter-questions");
const localStorageIdentifier = "simplePainting-chatHistory";
const feedbackDiv = document.getElementById("feedback");
const dislikeFeedbackDiv = document.getElementById("dislike-feedback");
const dislikeFeedbackInput = document.getElementById("feedback-textarea");
const dislikeFeedbackSendButton = document.getElementById("feedback-btn");
const thankYouDiv = document.getElementById("thank-you-div");
let userMessage = null; // Variable to store user's message
let canSend = true;
let chatHistory = localStorage.getItem(localStorageIdentifier);
let chatRating;
let dislikeFeedback;
const inputInitHeight = chatInput.scrollHeight;
const roles = { user: "user", assistant: "assistant", system: "system" };
const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  message = getMarkdownText(message);
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let containerElement = "div";
  let chatContent =
    className === "outgoing"
      ? `<${containerElement}></${containerElement}>`
      : `<div class="chatbot-profile-container">
                                    <span class="material-symbols-outlined">
                                        <img src="https://chatbotiframe.s3.amazonaws.com/public/simplePaintingLogo.svg" alt="smart_toy" onerror="this.onerror=null; this.parentNode.textContent='smart_toy';">
                                    </span>
                                </div><${containerElement}></${containerElement}>`;
  chatLi.innerHTML = chatContent;
  const divs = chatLi.querySelectorAll("div");
  if (divs.length > 1) {
    divs[1].innerHTML = message; // Insert message into the second div.
  } else {
    divs[0].innerHTML = message;
  }
  return chatLi; // return chat <li> element
};
let userIdIdentifier = "simplePainting-userInformation";
let userInformation = localStorage.getItem(userIdIdentifier);
const dbManagementUrl =
  "https://fkbw06fjz2.execute-api.us-east-1.amazonaws.com/production/saveMessage";

// WEBSOCKETS
let ws;
let isFirstChunk = true;

function updateChatUI(chunk) {
  const lastMessageElement = chatbox.lastChild.querySelectorAll("div")[1];
  // Clear the last message element when the first chunk arrives
  if (isFirstChunk) {
    lastMessageElement.innerHTML = "";
    isFirstChunk = false;
  }
  if (chunk.status == 200 && chunk.message == "DIALOG") {
    setTimeout(() => {
      chatbox.removeChild(chatbox.lastChild);
      showTrackingOrderElement();
      canSend = true;
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }, 300);
    saveChatMessage(
      roles.system,
      "Provided user with order tracking link element"
    );
  } else if (chunk.status == 200) {
    saveChatMessage(roles.assistant, lastMessageElement.innerHTML);
    lastMessageElement.innerHTML = getMarkdownText(
      lastMessageElement.innerHTML
    );
    canSend = true;
  } else {
    lastMessageElement.innerHTML += chunk.message;
  }
  chatbox.scrollTo(0, chatbox.scrollHeight);
}

const generateResponse = async (chatElement, userMessage) => {
  saveChatMessage(roles.user, userMessage);
  chatHistory = localStorage.getItem(localStorageIdentifier);
  let messageElement = chatElement.querySelectorAll("div")[1];
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(getOnlyChatMessages(chatHistory)));
  } else {
    let p = messageElement.querySelector("p");
    p.classList.add("error");
    p.textContent =
      "Oops! Something went wrong on our servers. For the best support, please contact us at support@simple-painting.com. Thank you for understanding.";
    canSend = true;
  }
  isFirstChunk = true;
  chatbox.scrollTo(0, chatbox.scrollHeight);
  sendChatBtn.disabled = true;
  setTimeout(function () {
    sendChatBtn.disabled = false;
  }, 1000);
};

function getOnlyChatMessages(chatHistoryWithTimestamps) {
  let messages = [];
  chatHistoryWithTimestamps = JSON.parse(chatHistoryWithTimestamps);
  for (record of chatHistoryWithTimestamps) {
    messages.push(record.message);
  }
  return messages;
}

const handleChat = () => {
  if (ws.readyState !== WebSocket.OPEN) {
    initiateWebSocketConnection();
  }
  canSend = false;
  hideStarterQuestions();
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;
  addMessageElementToChat(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);
  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    addMessageElementToChat(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi, userMessage);
  }, 600);
};

function getMarkdownText(text) {
  const temp = document.createElement("div");
  temp.innerHTML = marked(text);
  const linkElements = temp.querySelectorAll("a");
  if (linkElements) {
    for (let element of linkElements) {
      element.setAttribute("target", "_blank");
    }
  }
  return temp.innerHTML;
}

function saveChatMessage(role, message) {
  try {
    chatHistory = localStorage.getItem(localStorageIdentifier);
    // Parse the string back into an array
    let tempChatHistory = chatHistory ? JSON.parse(chatHistory) : [];
    const jsonMsg = { role: role, content: message };
    let record = { message: jsonMsg, time: new Date().toISOString() };
    tempChatHistory.push(record);
    // Convert the array back to a string to store in localStorage
    localStorage.setItem(
      localStorageIdentifier,
      JSON.stringify(tempChatHistory)
    );
  } catch (error) {
    console.log(error);
  }
}

function showStarterQuestions() {
  starterQuestions.classList.add("show");
  chatbox.style.padding = "25px 15px 100px";
}

function hideStarterQuestions() {
  starterQuestions.classList.remove("show");
  chatbox.style.padding = "25px 15px 40px";
}

function handleStarterQuestion(button) {
  const question = button.textContent;
  chatInput.value = question;
  hideStarterQuestions();
  handleChat();
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
}

function showChatHistory() {
  chatHistory = localStorage.getItem(localStorageIdentifier);
  console.log(chatHistory);
  let objectChatHistory = JSON.parse(chatHistory);
  let i = 0;
  for (i = 0; i < objectChatHistory.length; i++) {
    let chatLi;
    let msg = objectChatHistory[i].message;
    if (msg.role == roles.user) {
      chatLi = createChatLi(msg.content, "outgoing");
      addMessageElementToChat(chatLi);
    } else if (msg.role == roles.assistant) {
      chatLi = createChatLi(msg.content, "incoming");
      addMessageElementToChat(chatLi);
    } else if (msg.role == roles.system) {
      showTrackingOrderElement();
    }
  }
  chatbox.scrollTo(0, chatbox.scrollHeight);
}

function addMessageElementToChat(chatLi) {
  chatbox.appendChild(chatLi);
}

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed and message sending is allowed
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (canSend) {
      handleChat();
      chatInput.style.height = `${inputInitHeight}px`;
      chatInput.style.height = `${chatInput.scrollHeight}px`;
      canSend = false;
    }
  }
});

function initiateWebSocketConnection() {
  // ws = new WebSocket("ws://localhost:3000");
  ws = new WebSocket(
    "wss://pc6ix29j69.execute-api.us-east-1.amazonaws.com/production/"
  );

  ws.onopen = () => {
    console.log("Connected to websocket");
  };

  ws.onclose = () => {};

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response && (response.status === 200 || response.status === 206)) {
      // Update your chat UI here with the streamed response
      updateChatUI(response);
    } else {
      // Handle errors or status messages
    }
  };
}

function closeChatbox() {
  console.log("hallo");
  chatbox.classList.add("hide");
  chatInputDiv.classList.add("hide");
  feedbackDiv.classList.remove("hide");
}

function openChatbox() {
  chatbox.classList.remove("hide");
  chatInputDiv.classList.remove("hide");
  feedbackDiv.classList.add("hide");
}

function closeHandler() {
  if (!document.body.classList.contains("show-chatbot")) {
    document.body.classList.toggle("show-chatbot");
  } else if (!chatbox.classList.contains("hide")) {
    closeChatbox();
  } else {
    closeFeedback();
  }
}

function saveChatConversation() {
  if (!localStorage.getItem(userIdIdentifier)) {
    initializeUserInformation();
  }
  let userInfo = JSON.parse(localStorage.getItem(userIdIdentifier));
  userInfo.lastSaved = new Date().toISOString();
  console.log(userInfo.lastSaved);
  localStorage.setItem(userIdIdentifier, JSON.stringify(userInfo));
  chatHistory = JSON.parse(localStorage.getItem(localStorageIdentifier));
  const data = {
    UserId: userInfo.userId,
    lastSaved: userInfo.lastSaved,
    conversation: chatHistory,
  };
  if (chatRating) {
    data.chatRating = chatRating;
  }
  if (dislikeFeedback) {
    data.dislikeFeedback = dislikeFeedback;
  }
  const options = {
    method: "POST", // or 'PUT', depending on the server configuration
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  fetchWithRetry(dbManagementUrl, options);
}

async function fetchWithRetry(url, options, retries = 1) {
  let test;
  return fetch(url, options)
    .then(async (response) => {
      response = await response.json();
      if (response.statusCode !== 200) {
        // Check if response status is not 2xx
        if (response.statusCode === 500 && retries > 0) {
          throw {
            error: new Error(`Server error with status ${response.statusCode}`),
            response,
          };
        }
        // Convert non-2xx HTTP responses into errors
        throw {
          error: new Error(
            `Server responded with status ${response.statusCode}`
          ),
          response,
        };
      }
      console.log(response);
      return response; // Assuming server responds with JSON data
    })
    .catch((err) => {
      console.log(err);
      if (err.response && err.response.status === 500 && retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        return fetchWithRetry(url, options, retries - 1); // Recurse with decreased retries
      }
      console.error("Fetch error:", err.error.message);
      // Handle non-retry case or throw to indicate an unrecoverable error
      throw err.error;
    });
}

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => {
  closeHandler();
  if (ws.readyState !== WebSocket.CLOSED) {
    ws.close();
    console.log("Websocket closed");
  }
});

function initializeUserInformation() {
  let userInformation = {
    userId: crypto.randomUUID(),
    lastSaved: new Date().toISOString(),
  };
  let stringifiedUserInfo = JSON.stringify(userInformation);
  localStorage.setItem(userIdIdentifier, stringifiedUserInfo);
}

chatbotToggler.addEventListener("click", () => {
  if (!document.body.classList.contains("show-chatbot")) {
    if (!userInformation) {
      initializeUserInformation();
    }
    showStarterQuestions();
    if (chatHistory && chatbox.querySelectorAll(".outgoing").length == 0) {
      // jei nebuvo pries tai uzloadintas chat history
      showChatHistory();
    }
    initiateWebSocketConnection();
  } else {
    if (ws.readyState !== WebSocket.CLOSED) {
      ws.close();
      console.log("Websocket closed");
    }
  }
  closeHandler();
});

function closeFeedback() {
  document.body.classList.toggle("show-chatbot");
  dislikeFeedbackDiv.classList.add("hide");
  thankYouDiv.classList.add("hide");
  saveChatConversation();
  setTimeout(() => {
    openChatbox();
  }, 400);
}

function dislikeFeedbackHandler() {
  dislikeFeedbackDiv.classList.toggle("hide");
  thankYouDiv.classList.remove("hide");
  dislikeFeedback = dislikeFeedbackInput.value;
  dislikeFeedbackInput.value = "";
}

// dislikeFeedbackSendButton.addEventListener("click", () => {
//   dislikeFeedbackHandler();
// });

dislikeFeedbackInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed and message sending is allowed
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    dislikeFeedbackHandler();
  }
});

function rateChatbot(ratingMade) {
  if (ratingMade === "like") {
    chatRating = 1;
    setTimeout(() => {
      closeFeedback();
    }, 100);
  } else {
    chatRating = -1;
    feedbackDiv.classList.add("hide");
    dislikeFeedbackDiv.classList.remove("hide");
  }
}

function handleOrderTrackingButtons(buttonClicked) {
  const allTrackingNumberDivs = document.querySelectorAll(
    "#tracking-number-div"
  );
  const allOrderNumberDivs = document.querySelectorAll("#order-number-div");
  let trackingNumberDiv =
    allTrackingNumberDivs[allTrackingNumberDivs.length - 1];
  let orderNumberDiv = allOrderNumberDivs[allOrderNumberDivs.length - 1];
  if (buttonClicked == "tracking") {
    trackingNumberDiv.classList.remove("hide");
    orderNumberDiv.classList.add("hide");
  } else if (buttonClicked == "order") {
    trackingNumberDiv.classList.add("hide");
    orderNumberDiv.classList.remove("hide");
  }
}

function getTrackingLink() {
  let trackingNumberDiv = document.getElementById("tracking-number-div");
  let orderNumberDiv = document.getElementById("order-number-div");
  let trackingLinkDiv = document.getElementById("tracking-link-div");
  let orderNumberInput = document.getElementById("orderNumber");
  let emailInput = document.getElementById("email");
  let trackingNumberInput = document.getElementById("trackingNumber");
  let trackingNumberFormParsley = $("#tracking-number-form").parsley();
  let orderNumberFormParsley = $("#order-number-form").parsley();

  let link = "https://simple-painting.com/apps/tracking?";
  try {
    if (
      !trackingNumberDiv.classList.contains("hide") &&
      orderNumberDiv.classList.contains("hide")
    ) {
      if (trackingNumberFormParsley.isValid()) {
        let trackingNumber = parseInt(trackingNumberInput.value);
        let fullLink = link + "nums=" + encodeURIComponent(trackingNumber);
        trackingLinkDiv.innerHTML =
          '<a href="' + fullLink + '" target="_blank">' + fullLink + "</a>";
        trackingLinkDiv.classList.remove("hide");
      } else {
        trackingNumberFormParsley.validate();
      }
    } else if (
      !orderNumberDiv.classList.contains("hide") &&
      trackingNumberDiv.classList.contains("hide")
    ) {
      if (orderNumberFormParsley.isValid()) {
        let orderNumber = parseInt(orderNumberInput.value);
        let email = emailInput.value;
        let fullLink =
          link +
          "order=" +
          encodeURIComponent(orderNumber) +
          "&token=" +
          encodeURIComponent(email);
        trackingLinkDiv.innerHTML =
          '<a href="' + fullLink + '" target="_blank">' + fullLink + "</a>";
        trackingLinkDiv.classList.remove("hide");
      } else {
        orderNumberFormParsley.validate();
      }
      // Store information about what the user inputed
    }
  } catch (e) {
    console.log(e);
  }
}

function showTrackingOrderElement(index) {
  addMessageElementToChat(
    createChatLi(
      "To get the status of your order, please fill out the following information to get the tracking link. You can find your tracking number and order number in your gmail?",
      "incoming"
    )
  );
  const element = `
    <li class="chat" id = "tracking-order">
        <div class="order-information">
            <div class="button-container">
                <button class="starter-question" id="tracking-number-button" onclick="handleOrderTrackingButtons('tracking')">Tracking number</button>
                <button class="starter-question" id="order-number-button" onclick="handleOrderTrackingButtons('order')">Order number</button>
            </div>
            <div id="tracking-number-div">
                <form id="tracking-number-form">
                    <label for="trackingNumber">Enter your tracking number: </label>
                    <input type="number" id="trackingNumber" class="no-spinner" placeholder="Your tracking number" required>
                </form>
            </div>
            <div class="hide" id="order-number-div">
                <form id="order-number-form">
                    <label for="orderNumberEmail">Enter your order number and telephone or email: </label>
                    <input type="number" id="orderNumber" class="no-spinner" placeholder="Your order number" required data-parsley-pattern="^\d{10}$">
                    <input type="text" id="email" class="no-spinner" placeholder="Your telephone number or email" required data-parsley-type="email">
                </form>
            </div>
            <button class="order-tracking-button" onclick="getTrackingLink()">
                Get tracking link
            </button>
            <div class="tracking-link-div hide" id="tracking-link-div"></div>
        </div>
    </li>`;
  prevTrackingElement = document.getElementById("tracking-order");
  if (prevTrackingElement && document.body.contains(prevTrackingElement)) {
    prevTrackingElement.parentNode.removeChild(prevTrackingElement);
  }
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = element;
  tempDiv = tempDiv.querySelector("#tracking-order");
  addMessageElementToChat(tempDiv, index);
}

showStarterQuestions();
