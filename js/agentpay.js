import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// =============================
// FIREBASE CONFIG
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyClNBlfigtQk8AZWdMZcU9sEtVcIrS0D1g",
  authDomain: "ecodata-2bee6.firebaseapp.com",
  projectId: "ecodata-2bee6",
  storageBucket: "ecodata-2bee6.firebasestorage.app",
  messagingSenderId: "544837123249",
  appId: "1:544837123249:web:6c362350a00c6dab10b690"
};

// =============================
// INITIALIZE FIREBASE
// =============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentUser = null;
let isProcessing = false;

// =============================
// CHECK LOGIN STATE
// =============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in:", user.email);
  } else {
    currentUser = null;
    console.log("User not logged in");
  }
});

// =============================
// PAYSTACK PAYMENT FUNCTION
// =============================
function payWithPaystack(user) {

    // 1️⃣ Show YOUR loader first
  showLoader();

  // 2️⃣ Let browser paint it
  setTimeout(() => {
  const paystack = new PaystackPop();

  paystack.newTransaction({
    key: "pk_live_635856447ee14b583349141b7271f64c9b969749", // ⚠️ Use TEST key while testing
    email: user.email,
    amount: 70 * 100, // GHS 100 (kobo)
    currency: "GHS",
    metadata: {
      uid: user.uid
    },

    onSuccess: function (transaction) {
      hideLoader();
      isProcessing = false;

      fetch("/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference: transaction.reference,
          uid: user.uid
        })
      })
      .then(async res => {
        const data =  await res.json();
        if(!res.ok) throw new Error(data.error || "verification failed");
        return data;
      })
      .then(() => {
          showSnackBar("Payment verified. Welcome Agent!", "success");

          setTimeout(()=> {
              window.location.href = "agentPage.html";
          }, 1500)
        

      })
      .catch(error => {
        console.error("Verification error:", error);
        showSnackBar(error.message, "error");
      });
    },

    onCancel: function () {
      hideLoader();
      isProcessing = false;
      showSnackBar("Payment cancelled.");
    }

  });
  }, 3120); 
}

// =============================
// BUTTON LISTENER
// =============================
window.addEventListener("DOMContentLoaded", () => {

  const payBtn = document.getElementById("payBtn");

  if (!payBtn) {
    console.error("payBtn not found in HTML");
    return;
  }

  payBtn.addEventListener("click", () => {

    if (!currentUser) {
      showSnackBar("Please login first.");
      return;
    }
    if(isProcessing) return;

    isProcessing = true;
    payWithPaystack(currentUser);

  });

});



// ===================
// LOADER SPINNER IFRAME
//=====================


function showLoader() {
  const loader = document.getElementById("paystackLoader");
  if(!loader) return;
  loader.style.display = "flex";
  document.body.classList.add("no-scroll");
}

function hideLoader() {
  const loader = document.getElementById("paystackLoader");
  if(!loader) return;
  loader.style.display = "none";
  document.body.classList.remove("no-scroll");
}

// ===================
// LOADER SPINNER IFRAME
//=====================





//==================
// WHATSAPP CHAT BUTTON
//==================


// whatsApp sending message btn
 // === CONFIG ===
  const whatsappNumber = "233535565637";

  // === ELEMENTS ===
  const chatButton = document.getElementById("chatButton");
  const chatBox = document.getElementById("chatBox");
  const sendBtn = document.getElementById("sendMsgBtn");

  // === TOGGLE CHAT BOX ===
  chatButton.addEventListener("click", () => {
    chatBox.classList.toggle("show");
  });

  // === SEND MESSAGE ===
  sendBtn.addEventListener("click", () => {
    const message = document.getElementById("whatsappMessage").value.trim();
    if (!message) {
      showSnackBar("Please type your message before sending.");
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL =` https://wa.me/${233535565637}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
    document.getElementById("whatsappMessage").value = ""; // clear after sending
});

// WINDOW CLICK EVent
window.addEventListener("click", function(e){
  e.stopPropagation();
  if(!chatBox.contains(e.target) && !chatButton.contains(e.target)){
    chatBox.style.display = "none";
  } else{
    chatBox.style.display = "flex";
  }
});









//  <!----SNACKBAR-SECTION--->
 
// SNACKBAR SECTION //
// ===== SNACKBAR FUNCTION ===== //
let snackbarTimeout = null;

function showSnackBar(message, type = "info", duration = 4000) {
  let snackbar = document.querySelector(".snackbar");

  // Create snackbar if it doesn't exist
  if (!snackbar) {
    snackbar = document.createElement("div");
    snackbar.className = "snackbar";

    snackbar.innerHTML = `
      <span class="snackbar-text"></span>
      <div class="snackbar-progress"></div>
    `;

    document.body.appendChild(snackbar);
  }

  // Update text
  snackbar.querySelector(".snackbar-text").textContent = message;

  // Color by type
  if (type === "success") snackbar.style.background = "rgba(7, 29, 26, 0.95)";
  else if (type === "error") snackbar.style.background = "#dc3545";
  else if (type === "warning") snackbar.style.background = "#ffc107";
  else snackbar.style.background = "rgba(7, 29, 26, 0.95)";

  // Reset progress animation
  const progress = snackbar.querySelector(".snackbar-progress");
  progress.style.animation = "none";
  void progress.offsetWidth;
  progress.style.animation = `snackbar-progress ${duration}ms linear forwards`;

  snackbar.classList.add("show");

  // Clear previous timeout
  if (snackbarTimeout) clearTimeout(snackbarTimeout);

  snackbarTimeout = setTimeout(() => {
    snackbar.classList.remove("show");
  }, duration);
}
// snackbar ends


