import { useState, useEffect, useRef } from "react";
import {
  Heart, Home, Calendar, FileText, Folder, Users, BookOpen,
  Bell, LogOut, Plus, Trash2, Copy, Check, Upload, Camera,
  Download, Eye, ChevronDown, ChevronRight, ChevronUp, ChevronLeft,
  AlertTriangle, Phone, Pill, X, Menu, Save, Send,
  Shield, Star, Clock, MapPin, Activity, Baby, Volume2, VolumeX, User, Mail,
  Brain, DollarSign, PhoneCall, TrendingUp, PieChart, Zap, MessageCircle
} from "lucide-react";
import { auth, db } from "./firebase";
import { deleteUser, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const REGIOES_DF = [
  "Asa Norte","Asa Sul","Taguatinga","Ceilândia","Samambaia",
  "Planaltina","Gama","Sobradinho","Brazlândia","Guará",
  "Riacho Fundo","Lago Norte","Lago Sul","Cruzeiro","SIA",
  "Núcleo Bandeirante","Candangolândia","Sol Nascente","Vicente Pires",
  "Park Way","Setor de Mansões","Itapoã","Varjão","Fercal","Arniqueira"
];

const DIAGNOSTICOS = [
  "TEA (Autismo)", "TDAH", "Síndrome de Down", "Paralisia Cerebral",
  "Deficiência Visual", "Cegueira", "Baixa Visão", "Deficiência Auditiva",
  "Surdez", "Deficiência Física/Cadeirante", "Nanismo", "Amputação/Ausência de Membros",
  "Deficiência Intelectual", "Síndrome de Asperger", "Transtorno do Processamento Sensorial",
  "Dislexia", "Epilepsia", "Hidrocefalia", "Microcefalia", "Síndrome de Rett",
  "Síndrome de Williams", "Fibrose Cística", "Distrofia Muscular", "Osteogênese Imperfeita",
  "Múltiplas Deficiências", "Outros"
];

const CATEGORIAS = [
  { id: "medicos", nome: "Médicos", icon: "🏥" },
  { id: "terapeutas", nome: "Terapeutas", icon: "🧠" },
  { id: "familia", nome: "Família", icon: "👨‍👩‍👧" },
  { id: "emergencia", nome: "Emergência", icon: "🚨" },
  { id: "escola", nome: "Escola/Creche", icon: "🏫" }
];

export default function MaeGuiaDF({ user, dadosPerfil }) {
  const [tela, setTela] = useState(dadosPerfil?.mae?.nome ? "dashboard" : "onboarding");
  const [mae, setMae] = useState(dadosPerfil?.mae || { nome: "", celular: "", regiao: "", email: "" });
  const [filhos, setFilhos] = useState(dadosPerfil?.filhos || []);
  const [contatos, setContatos] = useState(dadosPerfil?.contatos || []);
  const [novoContato, setNovoContato] = useState({ nome: "", categoria: "", telefone: "", especialidade: "", notas: "" });

  console.log("🔍 MaeGuiaDF Props:", { user: user?.email, mae: mae?.nome, contatos: contatos?.length });

  // SALVAR NO FIREBASE
  async function salvarNoFirebase() {
    if (!user) {
      console.error("❌ Sem usuário");
      return;
    }
    
    try {
      console.log("💾 Salvando no Firebase...");
      const dados = { mae, filhos, contatos };
      await setDoc(doc(db, "perfis", user.uid), dados, { merge: true });
      console.log("✅ Salvo!");
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
    }
  }

  // ADICIONAR CONTATO
  function adicionarContato() {
    if (!novoContato.nome || !novoContato.categoria || !novoContato.telefone) {
      alert("Preencha nome, categoria e telefone!");
      return;
    }
    
    const novoArray = [...contatos, { ...novoContato, id: Date.now() }];
    setContatos(novoArray);
    setNovoContato({ nome: "", categoria: "", telefone: "", especialidade: "", notas: "" });
    
    // SALVAR IMEDIATAMENTE
    setTimeout(async () => {
      if (user) {
        try {
          console.log("💾 Salvando contato...");
          await setDoc(doc(db, "perfis", user.uid), { mae, filhos, contatos: novoArray }, { merge: true });
          console.log("✅ Contato salvo!");
        } catch (error) {
          console.error("❌ Erro:", error);
        }
      }
    }, 100);
  }

  // LOGOUT
  async function fazerLogout() {
    try {
      console.log("🚪 Saindo...");
      await signOut(auth);
      console.log("✅ Logout feito");
    } catch (error) {
      console.error("❌ Erro:", error);
    }
  }

  if (tela === "onboarding") {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>👋 Bem-vindo ao MãeGuia DF</h1>
        <p>Vamos completar seu cadastro</p>
        
        <label>Nome da Mãe/Responsável:</label>
        <input
          type="text"
          value={mae.nome}
          onChange={(e) => setMae({ ...mae, nome: e.target.value })}
          placeholder="Ex: Andreza"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        
        <label>WhatsApp:</label>
        <input
          type="text"
          value={mae.celular}
          onChange={(e) => setMae({ ...mae, celular: e.target.value })}
          placeholder="Ex: 61999999999"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        
        <label>Região:</label>
        <select
          value={mae.regiao}
          onChange={(e) => setMae({ ...mae, regiao: e.target.value })}
          style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd" }}
        >
          <option value="">Selecione...</option>
          {REGIOES_DF.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        
        <button
          onClick={async () => {
            if (!mae.nome || !mae.celular || !mae.regiao) {
              alert("Preencha todos os campos!");
              return;
            }
            
            // SALVAR PERFIL
            if (user) {
              try {
                console.log("💾 Salvando perfil inicial...");
                await setDoc(doc(db, "perfis", user.uid), { mae, filhos: [], contatos: [], remedios: [], exames: [] }, { merge: true });
                console.log("✅ Perfil salvo!");
                setTela("dashboard");
              } catch (error) {
                console.error("❌ Erro:", error);
              }
            }
          }}
          style={{ width: "100%", padding: "12px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          ✅ Continuar
        </button>
        
        <button
          onClick={fazerLogout}
          style={{ width: "100%", padding: "12px", marginTop: "10px", background: "#dc3545", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
        >
          🚪 Sair
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>👋 Olá, {mae.nome}!</h1>
        <button
          onClick={fazerLogout}
          style={{ padding: "8px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          🚪 Sair
        </button>
      </div>

      {/* CONTATOS */}
      <div style={{ marginBottom: "30px" }}>
        <h2>📞 Contatos</h2>
        
        {contatos.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            {contatos.map(c => (
              <div key={c.id} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "10px", background: "#f9f9f9" }}>
                <strong>{c.nome}</strong> - {c.categoria}
                <br />
                <a href={`tel:${c.telefone}`}>📱 {c.telefone}</a>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "15px", background: "#f0f0f0", borderRadius: "8px" }}>
          <h3>➕ Novo Contato</h3>
          
          <input
            type="text"
            placeholder="Nome"
            value={novoContato.nome}
            onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
          />
          
          <select
            value={novoContato.categoria}
            onChange={(e) => setNovoContato({ ...novoContato, categoria: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="">Selecione categoria</option>
            {CATEGORIAS.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
          
          <input
            type="tel"
            placeholder="Telefone"
            value={novoContato.telefone}
            onChange={(e) => setNovoContato({ ...novoContato, telefone: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
          />
          
          <button
            onClick={adicionarContato}
            style={{ width: "100%", padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            ✅ Adicionar Contato
          </button>
        </div>
      </div>
    </div>
  );
}
