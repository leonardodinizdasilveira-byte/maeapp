import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do projeto MãeGuia DF (v2)
const firebaseConfig = {
  apiKey: "AIzaSyBkcJwC3tULHXw_4BXHyOphobjpJZKanfY",
  authDomain: "maeguia-df-v2.firebaseapp.com",
  projectId: "maeguia-df-v2",
  storageBucket: "maeguia-df-v2.firebasestorage.app",
  messagingSenderId: "135046499368",
  appId: "1:135046499368:web:127c18583dd86a0eb4b91d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
