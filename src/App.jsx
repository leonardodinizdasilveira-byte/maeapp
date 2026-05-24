import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./Auth";
import MaeGuiaDF from "./MaeGuiaDF";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dadosPerfil, setDadosPerfil] = useState(null);

  useEffect(() => {
    // Observar mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Usuário logado - buscar dados do perfil
        try {
          const perfilRef = doc(db, "perfis", currentUser.uid);
          const perfilSnap = await getDoc(perfilRef);
          
          if (perfilSnap.exists()) {
            setDadosPerfil(perfilSnap.data());
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        }
        setUser(currentUser);
      } else {
        // Usuário deslogado
        setUser(null);
        setDadosPerfil(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Salvar dados do perfil no Firebase quando houver mudanças
  async function salvarPerfil(dados) {
    if (!user) return;
    
    try {
      const perfilRef = doc(db, "perfis", user.uid);
      await setDoc(perfilRef, {
        ...dados,
        ultimaAtualizacao: new Date().toISOString()
      }, { merge: true });
      
      setDadosPerfil(dados);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  }

  if (loading) {
    return (
      <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f6f8f7"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:64, height:64, background:"linear-gradient(135deg,#3d9b7a,#7c5cbf)", borderRadius:20, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16, animation:"pulse 1.5s infinite"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <p style={{fontSize:16, fontWeight:700, color:"#3d9b7a", fontFamily:"'Nunito', sans-serif"}}>Carregando MãeGuia DF...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return <MaeGuiaDF user={user} dadosPerfil={dadosPerfil} onSalvarPerfil={salvarPerfil} />;
}
