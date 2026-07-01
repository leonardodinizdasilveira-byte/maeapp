import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do projeto MãeGuia DF (projeto v2)
// ⚠️ CONFIRME esta apiKey no Firebase Console (Configurações do projeto > Geral > Seus apps)
// antes de commitar — no resumo da sessão anterior ela veio com um espaço no meio,
// o que indica que pode ter sido corrompida ao copiar/colar.
const firebaseConfig = {
  apiKey: "AIzaSyBkcJwC3tULHXw_4BXHyOphobjpJZKenfY",
  authDomain: "maeguia-df-v2.firebaseapp.com",
  projectId: "maeguia-df-v2",
  storageBucket: "maeguia-df-v2.firebasestorage.app",
  messagingSenderId: "135046449368",
  appId: "1:135046449368:web:127c18583dd86a0eb4b91d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
