import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAsNdgiEOOvuGHqvyfxVNbV70_TFO4c33E",
    authDomain: "messmeal-c8e99.firebaseapp.com",
    projectId: "messmeal-c8e99",
    storageBucket: "messmeal-c8e99.firebasestorage.app",
    messagingSenderId: "166451830560",
    appId: "1:166451830560:web:c2572108378c96b85a4145"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
