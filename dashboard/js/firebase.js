import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB04WJRZovEOOHfKX4E00qE_HMPKtyx9js",
  authDomain: "syedandwaheeddashboard.firebaseapp.com",
  projectId: "syedandwaheeddashboard",
  storageBucket: "syedandwaheeddashboard.firebasestorage.app",
  messagingSenderId: "452194218675",
  appId: "1:452194218675:web:e02aa031ba83d1542f76c6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
