import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do projeto MãeGuia DF
const firebaseConfig = {
  apiKey: "AIzaSyAk2Vd623o4y4wV4uzOiMp0aYbSlPeSME4",
  authDomain: "maeguia-df.firebaseapp.com",
  projectId: "maeguia-df",
  storageBucket: "maeguia-df.firebasestorage.app",
  messagingSenderId: "914306179455",
  appId: "1:914306179455:web:6fea85b1c7e9d2c1cbba4a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
