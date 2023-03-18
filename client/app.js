function sendUserMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();
  if (message !== "") {
    displayUserMessage(message);
    userInput.value = "";
    getBotResponse(message);
  }
}

function displayUserMessage(message) {
  const chatContainer = document.getElementById("chat-container");
  const userMessage = document.createElement("div");
  userMessage.classList.add("chat-message", "user-message");
  userMessage.textContent = message;
  chatContainer.appendChild(userMessage);
}

function showApplePayButton() {
  const applePayButton = document.querySelector(".apple-pay-btn");
  applePayButton.style.display = "inline-block";
}

function displayBotMessage(cards) {
  const chatContainer = document.getElementById("chat-container");

  cards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card", "chat-message", "bot-message");

    const cardImage = document.createElement("img");
    cardImage.src = card.imgUrl;
    cardImage.classList.add("card-img-top");
    cardElement.appendChild(cardImage);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = card.title;
    cardBody.appendChild(cardTitle);

    const cardPrice = document.createElement("p");
    cardPrice.classList.add("card-text");
    cardPrice.textContent = `Price: ${card.price}`;
    cardBody.appendChild(cardPrice);

    cardElement.appendChild(cardBody);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-remove", "no-box-shadow");
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", () => {
      cardElement.remove();
      updateCheckoutSummary();
    });
    cardElement.appendChild(deleteButton);

    chatContainer.appendChild(cardElement);
  });
}

// var raw = JSON.stringify({
//   model: "gpt-3.5-turbo",
//   messages: [
//     {
//       role: "user",
//       content: "Hello",
//     },
//   ],
// });

function getBotResponse(message) {
  const loadingMessage = displayLoadingMessage();
  console.log("###", loadingMessage);
  // raw = JSON.stringify({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {
  //       role: "user",
  //       content: message,
  //     },
  //   ],
  // });
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  console.log("##", message);
  const raw = JSON.stringify({
    input: message,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  console.log(requestOptions);

  // let json = [
  //   {
  //     title: "Potato Fresh",
  //     price: "SAR 1.50",
  //     imgUrl:
  //       "https://cdnprod.mafretailproxy.com/sys-master-root/h8e/h2e/9216717324318/78680_main.jpg_200Wx200H",
  //   },
  //   {
  //     title: "Al Taie Chickpeas 540g",
  //     price: "SAR 3.50",
  //     imgUrl:
  //       "https://cdnprod.mafretailproxy.com/sys-master-root/h83/h60/14014280269854/647837_main.jpg_200Wx200H",
  //   },
  // ];

  // removeLoadingMessage(loadingMessage);
  // displayBotMessage(json);
  // updateCheckoutSummary();
  fetch("http://localhost:3000/api/data", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      removeLoadingMessage(loadingMessage);
      displayBotMessage(result.data);
      updateCheckoutSummary();
    })
    .catch((error) => {
      removeLoadingMessage(loadingMessage);
      console.error("Error:", error);
    });
}

function displayLoadingMessage() {
  const chatContainer = document.getElementById("chat-container");
  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add(
    "chat-message",
    "bot-message",
    "loading-message"
  );
  loadingMessage.textContent = "Loading...";
  chatContainer.appendChild(loadingMessage);

  return loadingMessage;
}

function removeLoadingMessage(loadingMessage) {
  loadingMessage.remove();
}

document.getElementById("userInput").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendUserMessage();
  }
});

document.getElementById("sendButton").addEventListener("click", () => {
  sendUserMessage();
});

function getPopoverContent(totalPrice) {
  const vatAmount = totalPrice * 0.15;
  const grandTotal = totalPrice + vatAmount;
  return `
    <div class="popover-content-container">
      <div class="popover-summary">
        Total Price: $${totalPrice.toFixed(2)}<br />
        VAT (15%): $${vatAmount.toFixed(2)}<br />
        <hr />
        Total Amount: $${grandTotal.toFixed(2)}<br />
      </div>

      <div>
      <div class="apple-pay-btn fixed-bottom w-100"> Pay 
      
      </div>
      </div>
    </div>
  `;
}

function updateCheckoutSummary() {
  const checkoutButton = document.getElementById("checkoutButton");
  const cards = document.querySelectorAll(".card");
  let totalPrice = 0;

  cards.forEach((card) => {
    const priceText = card.querySelector(".card-text").textContent;
    const price = parseFloat(priceText.replace("Price: SAR ", ""));
    totalPrice += Number(price);
  });
  if (cards.length > 0) {
    checkoutButton.classList.remove("d-none");
    const popoverInstance = mdb.Popover.getInstance(checkoutButton);
    if (popoverInstance) {
      popoverInstance.options.content = getPopoverContent(totalPrice);
    } else {
      new mdb.Popover(checkoutButton, {
        content: getPopoverContent(totalPrice),
        html: true,
      });
    }
  } else {
    checkoutButton.classList.add("d-none");
  }
}
