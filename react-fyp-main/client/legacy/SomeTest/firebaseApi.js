import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_G9BRbXmx6_-rvdMq5RS6H3yUuu0VaO8",
  authDomain: "chat-function-349e4.firebaseapp.com",
  projectId: "chat-function-349e4",
  storageBucket: "chat-function-349e4.appspot.com",
  messagingSenderId: "340165879939",
  appId: "1:340165879939:web:964bcf6d8e3b4b5e7cd3b6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export const loginUser = async (username, password) => {
  const q = query(collection(db, 'Admin'), where('Admin_ID', '==', username), where('Admin_Password', '==', password));
  const querySnapshot = await getDocs(q);
  return querySnapshot;
}






