import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import MaeGuiaDF from "./MaeGuiaDF";

export default function App() {
  const [user, setUser] = useState(null);
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Carregar dados uma única vez
        try {
          const docSnap = await getDoc(doc(db, "perfis", currentUser.uid));
          if (docSnap.exists()) {
            console.log("✅ Perfil carregado:", docSnap.data());
            setDadosPerfil(docSnap.data());
          } else {
            console.log("⚠️ Perfil vazio");
            setDadosPerfil({});
          }
        } catch (error) {
          console.error("❌ Erro ao carregar:", error);
          setDadosPerfil({});
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setDadosPerfil(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function salvarPerfil(dados) {
    if (!user) {
      console.error("❌ Sem usuário");
      return;
    }
    try {
      console.log("💾 Salvando:", dados);
      await setDoc(doc(db, "perfis", user.uid), dados, { merge: true });
      console.log("✅ Salvo!");
    } catch (error) {
      console.error("❌ Erro:", error);
    }
  }

  async function fazerLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro logout:", error);
    }
  }

  if (loading) {
    return <div style={{padding: '20px'}}>⏳ Carregando...</div>;
  }

  return (
    <MaeGuiaDF
      user={user}
      dadosPerfil={dadosPerfil}
      onSalvarPerfil={salvarPerfil}
      onLogout={fazerLogout}
    />
  );
}
