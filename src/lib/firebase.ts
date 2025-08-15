import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyCV1ihnvbiT4bGxm_QRQEJUn5t6hx8B1aY",
  authDomain: "super-rptiteur-g1.firebaseapp.com",
  projectId: "super-rptiteur-g1",
  storageBucket: "super-rptiteur-g1.firebasestorage.app",
  messagingSenderId: "169269653264",
  appId: "1:169269653264:web:4cd37f8280b2dc904aff95"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const performance = getPerformance(app);

export { auth };
