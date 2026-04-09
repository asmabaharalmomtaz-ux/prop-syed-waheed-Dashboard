import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";


const ALLOWED_EMAILS = [
  "asmabaharalmomtaz@gmail.com",
  "",
  "teammate2@gmail.com",
];


const app      = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

export function initAuth(onAuthorized) {
  
  onAuthStateChanged(auth, user => {
    if (user) {
      if (ALLOWED_EMAILS.includes(user.email)) {
        // Authorized — show dashboard
        document.getElementById("auth-screen").style.display  = "none";
        document.getElementById("app-screen").style.display   = "flex";
        document.getElementById("user-name").textContent      = user.displayName || user.email;
        document.getElementById("user-email").textContent     = user.email;
        if (user.photoURL) {
          document.getElementById("user-avatar").src          = user.photoURL;
          document.getElementById("user-avatar").style.display = "block";
          document.getElementById("user-initials").style.display = "none";
        } else {
          document.getElementById("user-initials").textContent = (user.displayName||user.email)[0].toUpperCase();
        }
        onAuthorized();
      } else {
       
        signOut(auth);
        showError(`Access denied for ${user.email}. Contact your admin to be added.`);
      }
    } else {
      
      document.getElementById("auth-screen").style.display = "flex";
      document.getElementById("app-screen").style.display  = "none";
    }
  });

  
  document.getElementById("google-signin-btn")?.addEventListener("click", async () => {
    clearError();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        showError("Sign-in failed. Please try again.");
      }
    }
  });

  
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
  });
}

function showError(msg) {
  const el = document.getElementById("auth-error");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}
function clearError() {
  const el = document.getElementById("auth-error");
  if (el) { el.textContent = ""; el.style.display = "none"; }
}
