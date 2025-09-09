import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object - contains all the necessary keys to connect to Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyAYW7sl2P0Xjmzaq2puxlDZvun8S4cfA1g",
  authDomain: "pomodoro-cc087.firebaseapp.com",
  projectId: "pomodoro-cc087",
  storageBucket: "pomodoro-cc087.firebasestorage.app",
  messagingSenderId: "73843102139",
  appId: "1:73843102139:web:ebd1b8566bf5797bbcf49e",
  measurementId: "G-CFXF76RFPW"
};

// Initialize Firebase app with the configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication service - used for user login/logout/signup
export const auth = getAuth(app);

// Initialize Cloud Firestore database service - used for storing tasks and time logs
export const db = getFirestore(app);

// Collection names for Firestore - these are the table names in our database
export const COLLECTIONS = {
  TASKS: 'tasks',
  TIME_LOGS: 'timeLogs',
  USERS: 'users'
} as const;

export default app;
