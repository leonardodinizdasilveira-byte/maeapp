import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import MaeGuiaDF from "./MaeGuiaDF";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const perfilRef = doc(db, "perfis", currentUser.uid);
        
        const unsubscribePerfil = onSnapshot(perfilRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              console.log("Perfil carregado em tempo real:", data);
              setDadosPerfil(data);
            } else {
              console.log("Perfil não existe, onboarding necessário");
              setDadosPerfil({});
            }
            setLoading(false);
          }, 
          (error) => {
            console.error("Erro ao ouvir perfil:", error);
            setDadosPerfil({});
            setLoading(false);
          }
        );

        setUser(currentUser);
        return unsubscribePerfil;
      } else {
        console.log("Usuário deslogado");
        setUser(null);
        setDadosPerfil(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function salvarPerfil(dados) {
    if (!user) {
      console.error("Não há usuário logado");
      return;
    }
    
    try {
      console.log("Salvando perfil:", dados);
      const perfilRef = doc(db, "perfis", user.uid);
      await setDoc(perfilRef, {
        ...dados,
        ultimaAtualizacao: new Date().toISOString()
      }, { merge: true });
      
      console.log("Perfil salvo com sucesso");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  }

  async function fazerLogout() {
    try {
      await signOut(auth);
      setUser(null);
      setDadosPerfil(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
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
