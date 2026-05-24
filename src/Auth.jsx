import { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Mail, Lock, AlertCircle, CheckCircle, Heart } from "lucide-react";

export default function Auth({ onLogin }) {
  const [modo, setModo] = useState("login"); // login | cadastro | recuperar
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    if (!email || !senha) {
      setErro("Preencha e-mail e senha");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Salvar dados iniciais no Firestore
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        email: email,
        criadoEm: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString()
      });

      onLogin(userCredential.user);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado. Faça login ou recupere sua senha.");
      } else if (error.code === "auth/invalid-email") {
        setErro("E-mail inválido");
      } else if (error.code === "auth/weak-password") {
        setErro("Senha muito fraca. Use no mínimo 6 caracteres.");
      } else {
        setErro("Erro ao criar conta: " + error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !senha) {
      setErro("Preencha e-mail e senha");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      onLogin(userCredential.user);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setErro("Usuário não encontrado. Crie uma conta primeiro.");
      } else if (error.code === "auth/wrong-password") {
        setErro("Senha incorreta");
      } else if (error.code === "auth/invalid-email") {
        setErro("E-mail inválido");
      } else if (error.code === "auth/invalid-credential") {
        setErro("E-mail ou senha incorretos");
      } else {
        setErro("Erro ao fazer login: " + error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleRecuperar(e) {
    e.preventDefault();
    if (!email) {
      setErro("Digite seu e-mail para recuperar a senha");
      return;
    }

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSucesso("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setTimeout(() => setModo("login"), 3000);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setErro("E-mail não cadastrado");
      } else if (error.code === "auth/invalid-email") {
        setErro("E-mail inválido");
      } else {
        setErro("Erro ao enviar e-mail: " + error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#f6f8f7", padding:"24px 16px", fontFamily:"'Nunito', system-ui, sans-serif"}}>
      <style>@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');</style>
      
      <div style={{maxWidth:420, width:"100%"}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{width:64, height:64, background:"linear-gradient(135deg,#3d9b7a,#7c5cbf)", borderRadius:20, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:12, boxShadow:"0 6px 20px rgba(61,155,122,0.25)"}}>
            <Heart size={32} color="white" />
          </div>
          <h1 style={{fontWeight:800, fontSize:28, color:"#2f7d62", margin:0}}>MãeGuia DF</h1>
          <p style={{color:"#7c5cbf", fontWeight:600, marginTop:2, fontSize:15}}>
            {modo === "cadastro" && "Crie sua conta"}
            {modo === "login" && "Bem-vinda de volta"}
            {modo === "recuperar" && "Recuperar senha"}
          </p>
        </div>

        {/* Card */}
        <div style={{background:"white", borderRadius:20, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.08)"}}>
          <form onSubmit={modo === "cadastro" ? handleCadastro : modo === "login" ? handleLogin : handleRecuperar}>
            
            {/* E-mail */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13, fontWeight:700, color:"#333", display:"block", marginBottom:8}}>E-mail</label>
              <div style={{display:"flex", alignItems:"center", gap:10, background:"#fafbfa", border:"1.5px solid #e5e7eb", borderRadius:12, padding:"12px 14px"}}>
                <Mail size={18} color="#9ca3af"/>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  style={{flex:1, border:"none", outline:"none", background:"transparent", fontSize:15, fontFamily:"inherit", color:"#1a1a1a"}}
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            {modo !== "recuperar" && (
              <div style={{marginBottom:20}}>
                <label style={{fontSize:13, fontWeight:700, color:"#333", display:"block", marginBottom:8}}>Senha</label>
                <div style={{display:"flex", alignItems:"center", gap:10, background:"#fafbfa", border:"1.5px solid #e5e7eb", borderRadius:12, padding:"12px 14px"}}>
                  <Lock size={18} color="#9ca3af"/>
                  <input 
                    type="password" 
                    value={senha} 
                    onChange={e => setSenha(e.target.value)}
                    placeholder={modo === "cadastro" ? "Mínimo 6 caracteres" : "Sua senha"}
                    style={{flex:1, border:"none", outline:"none", background:"transparent", fontSize:15, fontFamily:"inherit", color:"#1a1a1a"}}
                    disabled={carregando}
                  />
                </div>
              </div>
            )}

            {/* Mensagens */}
            {erro && (
              <div style={{display:"flex", alignItems:"flex-start", gap:8, background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:12, padding:"12px 14px", marginBottom:16}}>
                <AlertCircle size={18} color="#dc2626" style={{flexShrink:0, marginTop:1}}/>
                <p style={{fontSize:14, color:"#dc2626", margin:0, lineHeight:1.5}}>{erro}</p>
              </div>
            )}

            {sucesso && (
              <div style={{display:"flex", alignItems:"flex-start", gap:8, background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"12px 14px", marginBottom:16}}>
                <CheckCircle size={18} color="#16a34a" style={{flexShrink:0, marginTop:1}}/>
                <p style={{fontSize:14, color:"#16a34a", margin:0, lineHeight:1.5}}>{sucesso}</p>
              </div>
            )}

            {/* Botão principal */}
            <button 
              type="submit"
              disabled={carregando}
              style={{
                width:"100%", 
                padding:"14px", 
                fontSize:16, 
                fontWeight:800, 
                color:"white", 
                border:"none", 
                borderRadius:14, 
                cursor: carregando ? "not-allowed" : "pointer", 
                fontFamily:"inherit",
                background: carregando ? "#d1d5db" : "linear-gradient(135deg,#3d9b7a,#5bb89a)",
                boxShadow: carregando ? "none" : "0 4px 14px rgba(61,155,122,0.3)",
                opacity: carregando ? 0.6 : 1
              }}
            >
              {carregando ? "Processando..." : modo === "cadastro" ? "Criar Conta" : modo === "login" ? "Entrar" : "Enviar E-mail"}
            </button>
          </form>

          {/* Links de navegação */}
          <div style={{marginTop:20, textAlign:"center"}}>
            {modo === "login" && (
              <>
                <button onClick={() => setModo("recuperar")} style={{background:"none", border:"none", color:"#7c5cbf", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", marginBottom:8, display:"block", width:"100%"}}>
                  Esqueci minha senha
                </button>
                <p style={{fontSize:14, color:"#666", margin:0}}>
                  Não tem conta? {" "}
                  <button onClick={() => setModo("cadastro")} style={{background:"none", border:"none", color:"#3d9b7a", fontWeight:700, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline"}}>
                    Cadastre-se
                  </button>
                </p>
              </>
            )}

            {modo === "cadastro" && (
              <p style={{fontSize:14, color:"#666", margin:0}}>
                Já tem conta? {" "}
                <button onClick={() => setModo("login")} style={{background:"none", border:"none", color:"#3d9b7a", fontWeight:700, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline"}}>
                  Faça login
                </button>
              </p>
            )}

            {modo === "recuperar" && (
              <button onClick={() => setModo("login")} style={{background:"none", border:"none", color:"#3d9b7a", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline"}}>
                ← Voltar para login
              </button>
            )}
          </div>
        </div>

        {/* Aviso de privacidade */}
        <p style={{textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:20, lineHeight:1.6}}>
          Seus dados são protegidos e usados apenas para personalizar sua experiência no MãeGuia DF.
        </p>
      </div>
    </div>
  );
}
