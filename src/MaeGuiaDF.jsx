import { useState, useEffect, useRef } from "react";
import {
  Heart, Home, Calendar, FileText, Folder, Users, BookOpen,
  Bell, LogOut, Plus, Trash2, Copy, Check, Upload, Camera,
  Download, Eye, ChevronDown, ChevronRight, ChevronUp, ChevronLeft,
  AlertTriangle, Phone, Pill, X, Menu, Save, Send,
  Shield, Star, Clock, MapPin, Activity, Baby, Volume2, VolumeX, User, Mail,
  Brain, DollarSign, PhoneCall, TrendingUp, PieChart, Zap, MessageCircle, Lock
} from "lucide-react";
import { auth, db } from "./firebase";
import { deleteUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

// ─── DADOS INICIAIS ───────────────────────────────────────────────────────────
const REGIOES_DF = [
  "Asa Norte","Asa Sul","Taguatinga","Ceilândia","Samambaia",
  "Planaltina","Gama","Sobradinho","Brazlândia","Guará",
  "Riacho Fundo","Lago Norte","Lago Sul","Cruzeiro","SIA",
  "Núcleo Bandeirante","Candangolândia","Sol Nascente","Vicente Pires",
  "Park Way","Setor de Mansões","Itapoã","Varjão","Fercal","Arniqueira"
];

const DIAGNOSTICOS = [
  "TEA (Autismo)",
  "TDAH",
  "Síndrome de Down",
  "Paralisia Cerebral",
  "Deficiência Visual",
  "Cegueira",
  "Baixa Visão",
  "Deficiência Auditiva",
  "Surdez",
  "Deficiência Física/Cadeirante",
  "Nanismo",
  "Amputação/Ausência de Membros",
  "Deficiência Intelectual",
  "Síndrome de Asperger",
  "Transtorno do Processamento Sensorial",
  "Dislexia",
  "Epilepsia",
  "Hidrocefalia",
  "Microcefalia",
  "Síndrome de Rett",
  "Síndrome de Williams",
  "Fibrose Cística",
  "Distrofia Muscular",
  "Osteogênese Imperfeita",
  "Múltiplas Deficiências",
  "Outros"
];

const REQUERIMENTOS = [
  { id:1, categoria:"Educação Inclusiva", titulo:"Mediador/Monitor Escolar (SEEDF)", fundamentacao:"Lei Berenice Piana (Lei 12.764/2012), LBI (Lei 13.146/2015), Art. 28" },
  { id:2, categoria:"Educação Inclusiva", titulo:"Adaptação Curricular e PEI", fundamentacao:"Res. CNE/CEB 4/2009, LBI Art. 28, §§ 1º e 2º" },
  { id:3, categoria:"Saúde e Terapias", titulo:"Tratamento Global pelo SUS (SES-DF)", fundamentacao:"Lei 8.080/1990, CF/88 Art. 196, Nota Técnica CONITEC" },
  { id:4, categoria:"Saúde e Terapias", titulo:"Contestação de Negativa de Plano de Saúde", fundamentacao:"RN ANS 465/2021, CDC Art. 39, STJ Súmula 609" },
  { id:5, categoria:"Saúde e Terapias", titulo:"Pedido de Laudo Médico Pericial Detalhado", fundamentacao:"CFM Res. 1.638/2002, LBI Art. 2º, §1º" },
  { id:6, categoria:"Benefícios e Direitos Civis", titulo:"Recurso Administrativo de BPC (INSS)", fundamentacao:"LOAS Art. 20, Dec. 6.214/2007, IN INSS/PRES 45/2010" },
  { id:7, categoria:"Benefícios e Direitos Civis", titulo:"Emissão de Carteira CIPTEA (Sedes-DF)", fundamentacao:"Lei Federal 13.977/2020, Decreto DF 42.022/2021" },
  { id:8, categoria:"Benefícios e Direitos Civis", titulo:"Redução de Jornada para Servidora Pública", fundamentacao:"Lei 8.112/1990 Art. 98, §§ 2º e 3º (incluído pela Lei 13.370/2016)" },
  { id:9, categoria:"Benefícios e Direitos Civis", titulo:"Isenção de Impostos de Veículos e IPVA", fundamentacao:"CTN Art. 150, III; Lei DF 4.727/2011; RICMS-DF" },
];

const DIREITOS_GUIA = [
  { id:1, titulo:"Passe Livre no Transporte Público", icon:"🚌", checklist:["Laudo médico atualizado (máx. 2 anos)","RG ou CNH da mãe/responsável","Certidão de nascimento do filho","Comprovante de residência no DF","Ir ao Na Hora (qualquer unidade) com hora marcada","Protocolar requerimento e aguardar 15 dias úteis"], negativa:"Em caso de negativa: protocole recurso na Secretaria de Mobilidade (SEMOB-DF). Se mantida, acione a Ouvidoria DF pelo 162 ou site." },
  { id:2, titulo:"Medicamentos de Alto Custo (CMDE/SES-DF)", icon:"💊", checklist:["Laudo médico com CID e justificativa clínica","Receita médica com nome comercial e genérico","Cópia do CPF e cartão SUS","Ir à FARMÁCIA ESPECIAL DA SES-DF (SEPS 714/914)","Cadastrar no HÓRUS (sistema de dispensação)","Retirada mensal com receita renovada a cada 6 meses"], negativa:"Negativa: protocole petição na DIRAC/SES-DF. Se mantida, ingresse com ação judicial. Use o Requerimento 3 desta plataforma." },
  { id:3, titulo:"Recusa de Matrícula na Escola Regular", icon:"📚", checklist:["Registro da recusa (e-mail, protocolo ou testemunha)","Notificação extrajudicial via cartório","Denúncia na CRE (Coordenação Regional de Ensino)","Denúncia no Ministério Público do DF e Territórios","Denúncia no Conselho Tutelar da região","Ajuizamento de ação de obrigação de fazer se necessário"], negativa:"Recusa é ILEGAL (Art. 27 da LBI). Leve o número de protocolo ao MP-DFT pelo site ou pessoalmente." },
  { id:4, titulo:"BPC — Benefício de Prestação Continuada", icon:"💰", checklist:["Laudos médicos com CID","Comprovante de renda familiar","Histórico escolar e relatórios terapêuticos","Agendar perícia pelo Meu INSS (app ou site)","Comparecer à perícia com toda documentação","Se negado, protocolar recurso em até 30 dias"], negativa:"Negativa: use o Recurso BPC disponível nesta plataforma (Requerimento 6). Apoio: CRAS da sua RA." },
  { id:5, titulo:"CIPTEA — Carteira de Identificação da Pessoa com TEA", icon:"🪪", checklist:["Laudo de TEA (CID F84)","RG e CPF do responsável","Certidão de nascimento do filho","Foto 3x4 recente","Agendar na SEDES-DF pelo agendamento.df.gov.br","Retirar em até 10 dias úteis"], negativa:"Atraso excessivo: acionar a Ouvidoria da SEDES-DF." },
];

const REDE_APOIO = [
  { nome:"APAE-DF (Plano Piloto)", tipo:"APAE", endereco:"SGAS Quadra 602, Asa Sul", tel:"(61) 3225-8000", regiao:"Asa Sul" },
  { nome:"APAE Taguatinga", tipo:"APAE", endereco:"QNC 16, Área Especial, Taguatinga", tel:"(61) 3563-1070", regiao:"Taguatinga" },
  { nome:"CAPSi Samambaia", tipo:"CAPSi", endereco:"QS 412, Conj. D, Samambaia Sul", tel:"(61) 3357-6080", regiao:"Samambaia" },
  { nome:"CAPSi Ceilândia", tipo:"CAPSi", endereco:"QNN 28, Área Especial, Ceilândia Norte", tel:"(61) 3373-3740", regiao:"Ceilândia" },
  { nome:"CAPSi Planaltina", tipo:"CAPSi", endereco:"Setor Habitacional Estância, Planaltina", tel:"(61) 3389-4490", regiao:"Planaltina" },
  { nome:"Na Hora Taguatinga (Passe Livre)", tipo:"Na Hora", endereco:"Pistão Sul, Setor C, Taguatinga", tel:"156", regiao:"Taguatinga" },
  { nome:"Na Hora Ceilândia", tipo:"Na Hora", endereco:"QNN 14, Área Especial, Ceilândia", tel:"156", regiao:"Ceilândia" },
  { nome:"CRAS Samambaia Sul", tipo:"CRAS", endereco:"QS 316, Conj. 5, Samambaia", tel:"(61) 3356-0990", regiao:"Samambaia" },
  { nome:"CRAS Gama", tipo:"CRAS", endereco:"Setor Central, Gama", tel:"(61) 3389-2380", regiao:"Gama" },
  { nome:"Hospital de Apoio (HRAN)", tipo:"Hospital", endereco:"SMHN Quadra 101, Asa Norte", tel:"(61) 3401-3800", regiao:"Asa Norte" },
];

function gerarTextoRequerimento(req, mae, filho) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const textos = {
    1: `REQUERIMENTO DE DISPONIBILIZAÇÃO DE MEDIADOR/MONITOR ESCOLAR

À Secretaria de Estado de Educação do Distrito Federal – SEEDF
Coordenação Regional de Ensino – ${mae.regiao}

${mae.nome.toUpperCase()}, ${mae.email}, residente no Distrito Federal, Região Administrativa de ${mae.regiao}, vem, respeitosamente, perante Vossa Senhoria, requerer a disponibilização de MEDIADOR/MONITOR ESCOLAR para seu filho(a) ${filho.nome}, ${filho.idade} anos, portador(a) de ${filho.diagnosticos.join(", ")}, matriculado(a) nessa rede pública de ensino.

FUNDAMENTAÇÃO JURÍDICA:
• Lei Federal 12.764/2012 (Lei Berenice Piana), Art. 3º, § 1º: assegura profissional de apoio escolar ao aluno com TEA;
• Lei Brasileira de Inclusão – LBI (Lei 13.146/2015), Art. 28, XVII: obriga as escolas a oferecer profissional de apoio escolar;
• Resolução CNE/CEB nº 2/2001 e Nota de Orientação MEC 2016.

PEDIDO:
Requer-se a imediata designação de profissional especializado para acompanhar ${filho.nome} nas atividades pedagógicas e de adaptação escolar, bem como a elaboração do Plano Educacional Individualizado – PEI, no prazo de 30 (trinta) dias.

Termos em que pede deferimento.
${mae.regiao}, ${hoje}

${mae.nome}
E-mail: ${mae.email} | WhatsApp: ${mae.celular}`,

    2: `REQUERIMENTO DE ADAPTAÇÃO CURRICULAR E ELABORAÇÃO DE PEI

À Secretaria de Estado de Educação do Distrito Federal – SEEDF

${mae.nome.toUpperCase()}, responsável por ${filho.nome}, ${filho.idade} anos, diagnóstico: ${filho.diagnosticos.join(", ")}, requer a elaboração de PLANO EDUCACIONAL INDIVIDUALIZADO (PEI) e ADAPTAÇÕES CURRICULARES, nos termos da Resolução CNE/CEB nº 4/2009 e LBI Art. 28, §§ 1º e 2º.

As adaptações solicitadas incluem: avaliações diferenciadas, tempo ampliado para realização de atividades, recursos pedagógicos especializados e comunicação alternativa e aumentativa quando necessário.

Prazo de resposta: 30 (trinta) dias, nos termos da Lei 9.784/1999.

${mae.regiao}, ${hoje}
${mae.nome} — WhatsApp: ${mae.celular}`,

    3: `REQUERIMENTO DE TRATAMENTO INTEGRAL PELO SUS / SES-DF

À Secretaria de Estado de Saúde do Distrito Federal – SES-DF
Central de Regulação / CONASS-DF

${mae.nome.toUpperCase()}, responsável por ${filho.nome}, ${filho.idade} anos, portador(a) de ${filho.diagnosticos.join(", ")}, vem requerer o acesso a TRATAMENTO INTEGRAL conforme protocolo da PNAEE, incluindo: Terapia ABA, Fonoaudiologia, Terapia Ocupacional e acompanhamento com Neuropediatra.

FUNDAMENTAÇÃO: CF/88 Art. 196 (saúde como direito); Lei 8.080/1990; Nota Técnica CONITEC 2022 sobre TEA; Portaria SES-DF nº 161/2019.

Requeiro resposta em 15 (quinze) dias. Em caso de omissão, ingressarei com medida judicial liminar.

${mae.regiao}, ${hoje}
${mae.nome} | ${mae.email} | ${mae.celular}`,

    4: `CONTESTAÇÃO FORMAL DE NEGATIVA DE COBERTURA — PLANO DE SAÚDE

À Operadora de Plano de Saúde / ANS – Agência Nacional de Saúde Suplementar

${mae.nome.toUpperCase()}, consumidora, em nome de seu(sua) dependente ${filho.nome}, ${filho.idade} anos, diagnóstico: ${filho.diagnosticos.join(", ")}, vem CONTESTAR FORMALMENTE a negativa de cobertura para tratamento especializado.

FUNDAMENTAÇÃO JURÍDICA:
• RN ANS 465/2021: obriga cobertura de tratamento para TEA/CID F84;
• CDC Art. 39, IV: veda práticas abusivas de recusa injustificada;
• STJ Súmula 609: operadora responde por danos decorrentes de recusa indevida;
• STJ REsp 1.733.013: cobertura de ABA é obrigatória.

Requeiro REVERSÃO da negativa em 5 (cinco) dias úteis, sob pena de acionamento do Procon-DF, ANS e ajuizamento de ação de indenização por danos morais e materiais.

${hoje} — ${mae.nome} | ${mae.celular}`,

    5: `SOLICITAÇÃO DE LAUDO MÉDICO PERICIAL DETALHADO

À Direção do Estabelecimento de Saúde / Médico Responsável

${mae.nome.toUpperCase()}, responsável pelo paciente ${filho.nome}, ${filho.idade} anos, vem requerer a emissão de LAUDO MÉDICO PERICIAL DETALHADO contendo: diagnóstico completo com CID-10, descrição das limitações funcionais, prognóstico, necessidades terapêuticas e medicamentosas, e indicação de profissional de apoio escolar.

FUNDAMENTAÇÃO: CFM Resolução 1.638/2002; LBI Art. 2º, §1º; Lei 12.842/2013.

O laudo é indispensável para: acesso a BPC/INSS, CIPTEA, medicamentos de alto custo e benefícios escolares.

Prazo: 15 (quinze) dias, conforme CFM e CDC.

${hoje} | ${mae.nome} | ${mae.celular}`,

    6: `RECURSO ADMINISTRATIVO — BENEFÍCIO DE PRESTAÇÃO CONTINUADA (BPC/LOAS)

Ao Superintendente do INSS no Distrito Federal

${mae.nome.toUpperCase()}, responsável por ${filho.nome}, ${filho.idade} anos, portador(a) de ${filho.diagnosticos.join(", ")}, vem interpor RECURSO ADMINISTRATIVO contra o indeferimento do BPC, nos termos do art. 23 da Lei 8.212/1991 e art. 20 da Lei 8.742/1993 (LOAS).

FUNDAMENTOS DO RECURSO:
• A deficiência de longa duração está devidamente comprovada por laudo médico;
• A renda per capita familiar é inferior a 1/4 do salário mínimo;
• Decreto 6.214/2007, Art. 4º: define impedimento de longo prazo;
• STF RE 567.985: renda pode ser analisada além do critério objetivo.

Requeiro nova perícia médica e social, com análise biopsicossocial, conforme determinado pelo STF.

${hoje} — ${mae.nome} | ${mae.email} | ${mae.celular}`,

    7: `REQUERIMENTO DE EMISSÃO DA CARTEIRA CIPTEA

À Secretaria de Estado de Desenvolvimento Social do Distrito Federal – SEDES-DF

${mae.nome.toUpperCase()}, CPF/e-mail: ${mae.email}, responsável por ${filho.nome}, ${filho.idade} anos, portador(a) de TEA (CID F84), vem requerer a emissão da CARTEIRA DE IDENTIFICAÇÃO DA PESSOA COM TRANSTORNO DO ESPECTRO AUTISTA — CIPTEA, nos termos da Lei Federal 13.977/2020 e Decreto Distrital 42.022/2021.

Documentos anexos: laudo médico com CID F84, certidão de nascimento, RG do responsável, comprovante de residência no DF.

A CIPTEA assegura atendimento prioritário em todos os serviços públicos e privados, conforme Art. 2º da Lei 13.977/2020.

Aguarda-se emissão no prazo legal de 10 (dez) dias úteis.

${mae.regiao}, ${hoje}
${mae.nome} | ${mae.celular}`,

    8: `REQUERIMENTO DE REDUÇÃO DE JORNADA DE TRABALHO — SERVIDOR(A) PÚBLICO(A)

À Chefia Imediata / Departamento de Recursos Humanos

${mae.nome.toUpperCase()}, servidora pública, responsável por ${filho.nome}, ${filho.idade} anos, portador(a) de ${filho.diagnosticos.join(", ")}, vem requerer a REDUÇÃO DE JORNADA DE TRABALHO, sem prejuízo da remuneração, nos termos do Art. 98, §§ 2º e 3º da Lei 8.112/1990 (incluídos pela Lei 13.370/2016).

A legislação assegura expressamente a jornada reduzida ao(à) servidor(a) que seja responsável por pessoa com deficiência, vedada qualquer penalidade ou desconto remuneratório.

Requeiro despacho favorável em 30 (trinta) dias, conforme Lei 9.784/1999.

${hoje} — ${mae.nome} | ${mae.email} | ${mae.celular}`,

    9: `REQUERIMENTO DE ISENÇÃO DE IPVA E IPI — VEÍCULO PARA PESSOA COM DEFICIÊNCIA

À Secretaria de Estado de Economia do Distrito Federal / Receita Federal

${mae.nome.toUpperCase()}, residente em ${mae.regiao}/DF, responsável por ${filho.nome}, ${filho.idade} anos, portador(a) de ${filho.diagnosticos.join(", ")}, vem requerer ISENÇÃO DE IPVA (Lei DF 4.727/2011) e ISENÇÃO DE IPI (Lei Federal 8.989/1995) para aquisição/manutenção de veículo adaptado ou destinado ao transporte do dependente com deficiência.

DOCUMENTOS NECESSÁRIOS: laudo médico com CID, comprovante de dependência econômica, CIPTEA (se houver), nota fiscal do veículo ou CRLV.

A isenção é um direito constitucional (CF/88 Art. 150, III) e não pode ser negada mediante comprovação dos requisitos legais.

${hoje} — ${mae.nome} | ${mae.email} | ${mae.celular}`,
  };
  return textos[req.id] || "Texto não disponível.";
}

// ─── PERSISTÊNCIA COM LOCALSTORAGE ───────────────────────────────────────────
// Mantém login ativo mesmo após fechar o navegador. Dados ficam salvos no
// dispositivo até o usuário apertar "Sair" ou limpar o cache do navegador.
function loadStore(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
function saveStore(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function clearStore() {
  try {
    localStorage.removeItem("mgdf_loggedIn");
    localStorage.removeItem("mgdf_mae");
    localStorage.removeItem("mgdf_filhos");
  } catch {}
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function MaeGuiaDF({ user, dadosPerfil, onSalvarPerfil }) {
  // Se tem dados do perfil (mae e filhos), já completou onboarding
  const perfilCompleto = dadosPerfil?.mae?.nome && dadosPerfil?.filhos?.length > 0;
  const [isLoggedIn, setIsLoggedIn] = useState(() => perfilCompleto);
  const [mae, setMae] = useState(() => dadosPerfil?.mae || { nome:"", email:user?.email || "", celular:"", regiao:"" });
  const [filhos, setFilhos] = useState(() => dadosPerfil?.filhos || []);
  const [filhoSelecionado, setFilhoSelecionado] = useState(0);
  const [tela, setTela] = useState("dashboard");
  // Muda de tela quando dados carregam
  useEffect(() => {
    if (dadosPerfil?.mae?.nome) {
      setTela("dashboard");
    } else if (dadosPerfil !== null && !dadosPerfil?.mae?.nome) {
      setTela("onboarding");
    }
  }, [dadosPerfil?.mae?.nome]);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Onboarding state
  const [onbStep, setOnbStep] = useState(1); // 1=mãe, 2=filho
  const [senha, setSenha] = useState("");
  const [criandoConta, setCriandoConta] = useState(false);
  const [novoFilho, setNovoFilho] = useState({ nome:"", idade:"", diagnosticos:[] });
  const [onbErrors, setOnbErrors] = useState({});

  // Agenda
  const [remedios, setRemedios] = useState(dadosPerfil?.remedios || []);
  const [exames, setExames] = useState(dadosPerfil?.exames || []);
  const [novoRemedio, setNovoRemedio] = useState({ nome:"", dosagem:"", dias:[], horario:"" });
  const [novoExame, setNovoExame] = useState({ titulo:"", local:"", data:"", hora:"", notas:"", horasAntesPreparacao:1 });
  const [alarmeAtivo, setAlarmeAtivo] = useState(false);
  const [alarmeMsg, setAlarmeMsg] = useState("");
  const audioCtxRef = useRef(null);
  const alarmeIntervalRef = useRef(null);

  // Esteira de Evolução
  const [atividades, setAtividades] = useState(dadosPerfil?.atividades || []);
  const [novaAtividade, setNovaAtividade] = useState({ nome:"", profissional:"", horario:"", instrucoes:"" });

  // Gerador
  const [reqSelecionado, setReqSelecionado] = useState(null);
  const [textoCopied, setTextoCopied] = useState(false);
  const [docSalvo, setDocSalvo] = useState(false);

  // Documentos
  const [documentos, setDocumentos] = useState(dadosPerfil?.documentos || {});
  const [uploadProgress, setUploadProgress] = useState({});
  const cameraInputRef = useRef(null);
  const galeriaInputRef = useRef(null);
  const [gaveta, setGaveta] = useState("Saúde");

  // Cuidador
  const [cuidador, setCuidador] = useState(dadosPerfil?.cuidador || {});
  const [msgCopiada, setMsgCopiada] = useState(false);

  // Direitos
  const [direitoAberto, setDireitoAberto] = useState(null);
  const [checklistFeito, setChecklistFeito] = useState({});
  
  // Diário de Comportamento
  const [registros, setRegistros] = useState(dadosPerfil?.registros || []);
  const [novoRegistro, setNovoRegistro] = useState({ tipo:"", data:"", hora:"", duracao:"", gatilho:"", oQueAjudou:"", notas:"" });
  
  // Financeiro
  const [gastos, setGastos] = useState(dadosPerfil?.gastos || []);
  const [novoGasto, setNovoGasto] = useState({ categoria:"", valor:"", data:"", descricao:"" });
  const [orcamento, setOrcamento] = useState(dadosPerfil?.orcamento || { medicamentos:0, terapias:0, transporte:0, alimentacao:0, outros:0 });
  
  // Contatos
  const [contatos, setContatos] = useState(dadosPerfil?.contatos || []);
  const [novoContato, setNovoContato] = useState({ nome:"", categoria:"", telefone:"", especialidade:"", notas:"" });

  // GDF Alerta
  const [canalCadastrado, setCanalCadastrado] = useState(false);

  const filho = filhos[filhoSelecionado] || null;

  // Sincronizar com dadosPerfil quando ele mudar (carregamento async)
  useEffect(() => {
   if (dadosPerfil?.mae?.nome && dadosPerfil?.filhos?.length > 0) {
    setMae(dadosPerfil.mae);
    setFilhos(dadosPerfil.filhos);
    setIsLoggedIn(true);
  }
  // NÃO faz nada se dadosPerfil é null ou vazio - espera carregar!
}, [dadosPerfil?.mae?.nome, dadosPerfil?.filhos?.length]);

  // Salvar no Firebase quando dados mudarem
  useEffect(() => {
    if (mae.nome || mae.celular || mae.regiao) {
      onSalvarPerfil({ 
        mae, 
        filhos, 
        remedios, 
        exames, 
        atividades, 
        registros, 
        gastos, 
        orcamento, 
        contatos,
        documentos // Incluindo documentos
      });
    }
  }, [mae, filhos, remedios, exames, atividades, registros, gastos, orcamento, contatos, JSON.stringify(documentos)]);

  // Sistema de verificação automática de alertas
  useEffect(() => {
    const verificarAlertas = () => {
      const agora = new Date();
      const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
      const diaAtual = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][agora.getDay()];
      
      // Verificar medicamentos
      remedios.forEach(r => {
        if (!r.ministrado && r.horario === horaAtual && r.dias.includes(diaAtual)) {
          tocarAlarme(`⏰ HORA DO REMÉDIO!\n\n${r.nome}\n${r.dosagem}\n\nNão esqueça de ministrar agora!`);
        }
      });
      
      // Verificar exames (sistema de 2 alarmes)
      exames.forEach(e => {
        if (!e.data || !e.hora) return;
        
        const [ano, mes, dia] = e.data.split('-');
        const [hora, minuto] = e.hora.split(':');
        const dataExame = new Date(ano, mes-1, dia, hora, minuto);
        const diff = dataExame - agora;
        const horasEmMs = 60 * 60 * 1000;
        const horas24 = 24 * horasEmMs;
        
        // ALARME 1: Lembrete 24h antes (com margem de 1 minuto)
        if (diff > horas24 - 60000 && diff < horas24 + 60000) {
          tocarAlarme(`🔔 LEMBRETE DE EXAME!\n\n📅 AMANHÃ você tem:\n${e.titulo}\n\n📍 Local: ${e.local}\n⏰ Horário: ${e.hora}\n\n${e.notas || ''}`);
        }
        
        // ALARME 2: Preparação (X horas antes do exame)
        const horasAntes = e.horasAntesPreparacao || 1;
        const tempoPreparacao = horasAntes * horasEmMs;
        if (diff > tempoPreparacao - 60000 && diff < tempoPreparacao + 60000) {
          const txtHoras = horasAntes === 1 ? '1 hora' : `${horasAntes} horas`;
          tocarAlarme(`⏰ HORA DE SE PREPARAR!\n\n📅 Daqui ${txtHoras} você tem:\n${e.titulo}\n\n📍 Local: ${e.local}\n⏰ Horário: ${e.hora}\n\n🚿 Comece a se arrumar e prepare ${filho?.nome || 'o paciente'}!`);
        }
      });
    };
    
    // Verificar a cada minuto
    const intervalo = setInterval(verificarAlertas, 60000);
    verificarAlertas(); // Verificar imediatamente
    
    return () => clearInterval(intervalo);
  }, [remedios, exames]);

  function fazerLogout() {
    auth.signOut(); // Logout do Firebase
  }
  
  async function sairEDeletarConta() {
    const confirmacao = window.confirm(
      "⚠️ ATENÇÃO!\n\n" +
      "Ao sair agora, sua conta será DELETADA permanentemente.\n\n" +
      "Você precisará criar um novo cadastro com e-mail e senha.\n\n" +
      "Deseja realmente sair e deletar esta conta?"
    );
    
    if (!confirmacao) return;
    
    try {
      const user = auth.currentUser;
      if (user) {
        // Deletar documentos do Firestore
        try {
          await deleteDoc(doc(db, "usuarios", user.uid));
        } catch (e) {
          console.log("Doc usuarios não encontrado");
        }
        
        try {
          await deleteDoc(doc(db, "perfis", user.uid));
        } catch (e) {
          console.log("Doc perfis não encontrado");
        }
        
        // Deletar conta do Firebase Auth
        await deleteUser(user);
      }
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      // Mesmo se der erro, faz logout
      auth.signOut();
    }
  }

  function getDocFilho(fIdx, gv) {
    return documentos[`${fIdx}_${gv}`] || [];
  }
  function setDocFilho(fIdx, gv, docs) {
    setDocumentos(prev => ({ ...prev, [`${fIdx}_${gv}`]: docs }));
  }

  // ─── ALARME SONORO ──────────────────────────────────────────────────────────
  function tocarAlarme(msg) {
    setAlarmeMsg(msg);
    setAlarmeAtivo(true);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    function beep() {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880; // Tom alto
        osc.type = "square"; // Som mais forte
        gain.gain.setValueAtTime(0.5, ctx.currentTime); // Volume mais alto
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {
        console.error('Erro no alarme:', e);
      }
    }
    beep();
    alarmeIntervalRef.current = setInterval(beep, 800); // Toca a cada 800ms
    
    // Vibração no celular (se disponível)
    if ('vibrate' in navigator) {
      const vibratePattern = [200, 100, 200, 100, 200];
      const vibrateInterval = setInterval(() => {
        navigator.vibrate(vibratePattern);
      }, 1000);
      alarmeIntervalRef.vibrateInterval = vibrateInterval;
    }
  }

  function pararAlarme() {
    setAlarmeAtivo(false);
    clearInterval(alarmeIntervalRef.current);
    if (alarmeIntervalRef.vibrateInterval) {
      clearInterval(alarmeIntervalRef.vibrateInterval);
      navigator.vibrate(0); // Para vibração
    }
  }

  // ─── ONBOARDING ─────────────────────────────────────────────────────────────
  function validarMae() {
    const errs = {};
    if (!mae.nome.trim()) errs.nome = "Obrigatório";
    if (!mae.email.includes("@")) errs.email = "E-mail inválido";
    if (senha.trim().length < 6) errs.senha = "Mínimo 6 caracteres";
    if (mae.celular.replace(/\D/g,"").length < 10) errs.celular = "Celular inválido";
    if (!mae.regiao) errs.regiao = "Selecione sua RA";
    setOnbErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function avancarOnboarding() {
    if (onbStep === 1 && validarMae()) setOnbStep(2);
  }
  function adicionarFilhoOnb() {
    if (!novoFilho.nome.trim() || !novoFilho.idade) return;
    setFilhos(prev => [...prev, { ...novoFilho, id: Date.now() }]);
    setNovoFilho({ nome:"", idade:"", diagnosticos:[] });
  }
  async function finalizarOnboarding() {
    if (filhos.length === 0) { adicionarFilhoOnb(); return; }

    setCriandoConta(true);
    setOnbErrors(prev => ({ ...prev, conta: undefined }));
    try {
      // 1) Garante que existe um usuário autenticado no Firebase Auth.
      //    Sem isso, salvarPerfil() nunca teria um UID pra gravar no Firestore.
      if (!auth.currentUser) {
        try {
          await createUserWithEmailAndPassword(auth, mae.email.trim(), senha);
          console.log("✅ Conta criada no Firebase Auth");
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            // Já existe conta com esse e-mail: tenta logar em vez de cadastrar
            await signInWithEmailAndPassword(auth, mae.email.trim(), senha);
            console.log("✅ Login em conta existente");
          } else {
            throw error;
          }
        }
      }

      // 2) Só agora salva o perfil, com o usuário já autenticado
      await onSalvarPerfil({ mae, filhos });
      setIsLoggedIn(true);
    } catch (error) {
      console.error("❌ Erro ao criar conta:", error);
      const mensagens = {
        "auth/email-already-in-use": "Este e-mail já tem conta, mas a senha digitada está errada.",
        "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
      };
      setOnbErrors(prev => ({
        ...prev,
        conta: mensagens[error.code] || `Erro ao criar conta: ${error.message}`
      }));
      setOnbStep(1); // volta pro passo 1 pra mostrar o erro perto do e-mail/senha
    } finally {
      setCriandoConta(false);
    }
  }
  function toggleDiag(d) {
    setNovoFilho(prev => ({
      ...prev,
      diagnosticos: prev.diagnosticos.includes(d)
        ? prev.diagnosticos.filter(x => x !== d)
        : [...prev.diagnosticos, d]
    }));
  }

  // ─── UPLOAD DE ARQUIVO ──────────────────────────────────────────────────────
  function handleUpload(e, tipo) {
    const file = e.target.files[0];
    if (!file) return;
    const key = `${filhoSelecionado}_upload_${Date.now()}`;
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));
    let prog = 0;
    const iv = setInterval(() => {
      prog += Math.random() * 25 + 10;
      if (prog >= 100) {
        clearInterval(iv);
        setUploadProgress(prev => { const n = {...prev}; delete n[key]; return n; });
        const docs = getDocFilho(filhoSelecionado, gaveta);
        setDocFilho(filhoSelecionado, gaveta, [...docs, {
          id: Date.now(),
          nome: file.name || (tipo === "camera" ? "Foto_Capturada.jpg" : "Arquivo_Anexado.pdf"),
          data: new Date().toLocaleDateString("pt-BR"),
          tamanho: `${(file.size/1024).toFixed(0)} KB`,
          tipo: file.type || "image/jpeg",
          url: URL.createObjectURL(file),
        }]);
      } else {
        setUploadProgress(prev => ({ ...prev, [key]: Math.min(prog, 99) }));
      }
    }, 150);
  }

  // ─── SALVAR REQUERIMENTO ─────────────────────────────────────────────────────
  function salvarRequerimento() {
    if (!reqSelecionado || !filho) return;
    const texto = gerarTextoRequerimento(reqSelecionado, mae, filho);
    const docs = getDocFilho(filhoSelecionado, "Histórico de Requerimentos");
    setDocFilho(filhoSelecionado, "Histórico de Requerimentos", [...docs, {
      id: Date.now(),
      nome: `${reqSelecionado.titulo.substring(0,30)}.txt`,
      data: new Date().toLocaleDateString("pt-BR"),
      tamanho: `${texto.length} chars`,
      tipo: "text/plain",
      conteudo: texto,
    }]);
    setDocSalvo(true);
    setTimeout(() => setDocSalvo(false), 2500);
  }

  // ─── MENSAGEM CUIDADOR ───────────────────────────────────────────────────────
  function gerarMsgCuidador() {
    if (!filho) return "";
    const c = cuidador[filhoSelecionado] || {};
    const hoje = new Date().toLocaleDateString("pt-BR");
    
    // Atividades terapêuticas do dia
    const atividadesHoje = atividades.filter(a => !a.concluida);
    let msgAtividades = "";
    if (atividadesHoje.length > 0) {
      msgAtividades = "\n🎯 *ESTEIRA DE EVOLUÇÃO (Atividades Terapêuticas):*\n";
      atividadesHoje.forEach((ativ, idx) => {
        msgAtividades += `\n${idx+1}. *${ativ.nome}*\n`;
        msgAtividades += `   👨‍⚕️ Orientação: ${ativ.profissional}\n`;
        if (ativ.horario) msgAtividades += `   ⏰ Horário: ${ativ.horario}\n`;
        if (ativ.instrucoes) msgAtividades += `   📋 Como fazer: ${ativ.instrucoes}\n`;
      });
    }
    
    return `🌿 *GUIA DO CUIDADOR — ${filho.nome.toUpperCase()}*
📅 Data: ${hoje}

👶 *Criança:* ${filho.nome}, ${filho.idade} anos
🏷️ *Diagnóstico:* ${filho.diagnosticos.join(", ")}

💊 *MEDICAMENTOS DO DIA:*
${c.remedios || "— Nenhum cadastrado"}
${msgAtividades}
🥗 *ALIMENTAÇÃO:*
✅ Pode: ${c.podeAlimentar || "—"}
❌ Não pode: ${c.naoPodeAlimentar || "—"}

📞 *CONTATOS DE EMERGÊNCIA:*
${c.telefones || "—"}

📌 *OBSERVAÇÕES ESPECIAIS:*
${c.obs || "—"}

_Enviado via MãeGuia DF_ 💜`;
  }

  function enviarWhatsApp() {
    const msg = encodeURIComponent(gerarMsgCuidador().replace(/\n/g, "%0A"));
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const navItems = [
    { id:"dashboard", icon:<Home size={18}/>, label:"Dashboard" },
    { id:"agenda", icon:<Calendar size={18}/>, label:"Agenda" },
    { id:"diario", icon:<Brain size={18}/>, label:"Diário" },
    { id:"financeiro", icon:<DollarSign size={18}/>, label:"Financeiro" },
    { id:"contatos", icon:<PhoneCall size={18}/>, label:"Contatos" },
    { id:"requerimentos", icon:<FileText size={18}/>, label:"Requerimentos" },
    { id:"documentos", icon:<Folder size={18}/>, label:"Meu Arquivo" },
    { id:"cuidador", icon:<Users size={18}/>, label:"Cuidador" },
    { id:"direitos", icon:<BookOpen size={18}/>, label:"Guia de Direitos" },
    { id:"gerenciar-filhos", icon:<Baby size={18}/>, label:"Gerenciar Filhos" },
  ];

  if (!isLoggedIn) return <Onboarding
    step={onbStep} mae={mae} setMae={setMae} errors={onbErrors}
    senha={senha} setSenha={setSenha} criandoConta={criandoConta}
    filhos={filhos} novoFilho={novoFilho} setNovoFilho={setNovoFilho}
    toggleDiag={toggleDiag} adicionarFilho={adicionarFilhoOnb}
    avancar={avancarOnboarding} finalizar={finalizarOnboarding}
    setFilhos={setFilhos}
    sairEDeletarConta={sairEDeletarConta}
  />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-lavender-50 to-white flex" style={{fontFamily:"'Nunito', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        :root{
          --mint:#3d9b7a; --mint-light:#e8f5f0; --mint-mid:#b8e0d2;
          --lav:#7c5cbf; --lav-light:#f0eaf8; --lav-mid:#c9b8e8;
          --warn:#e07b39; --danger:#c0392b;
        }
        .mint-50{background:#e8f5f0} .mint-100{background:#b8e0d2}
        .lav-50{background:#f0eaf8} .lav-100{background:#c9b8e8}
        .nav-item{transition:all .2s; border-radius:12px; cursor:pointer;}
        .nav-item:hover{background:var(--mint-light);}
        .nav-item.active{background:linear-gradient(135deg,#e8f5f0,#f0eaf8); color:var(--mint); font-weight:700; border-left:3px solid var(--mint);}
        .btn-mint{background:linear-gradient(135deg,#3d9b7a,#5bb89a); color:white; border:none; border-radius:12px; padding:10px 20px; font-weight:700; cursor:pointer; transition:transform .15s, opacity .15s; font-family:inherit;}
        .btn-mint:hover{transform:translateY(-1px); opacity:.92;}
        .btn-lav{background:linear-gradient(135deg,#7c5cbf,#9b7dd4); color:white; border:none; border-radius:12px; padding:10px 20px; font-weight:700; cursor:pointer; transition:transform .15s; font-family:inherit;}
        .btn-lav:hover{transform:translateY(-1px);}
        .btn-outline{background:white; color:var(--mint); border:1.5px solid var(--mint); border-radius:12px; padding:8px 16px; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit;}
        .btn-outline:hover{background:var(--mint-light);}
        .card{background:white; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.07); padding:20px;}
        .tag{display:inline-block; padding:2px 10px; border-radius:20px; font-size:12px; font-weight:700; background:var(--lav-light); color:var(--lav);}
        .tag-mint{background:var(--mint-light); color:var(--mint);}
        .input-field{width:100%; border:1.5px solid #e0e7ef; border-radius:10px; padding:10px 14px; font-size:15px; font-family:inherit; outline:none; transition:border-color .2s;}
        .input-field:focus{border-color:var(--mint); box-shadow:0 0 0 3px rgba(61,155,122,0.12);}
        .select-field{width:100%; border:1.5px solid #e0e7ef; border-radius:10px; padding:10px 14px; font-size:15px; font-family:inherit; outline:none; background:white; cursor:pointer;}
        .alarme-modal{position:fixed; inset:0; background:rgba(192,57,43,0.85); z-index:9999; display:flex; align-items:center; justify-content:center; animation:pulse 1s infinite;}
        @keyframes pulse{0%{opacity:.85}50%{opacity:1}100%{opacity:.85}}
        .progress-bar{height:6px; background:#e0e7ef; border-radius:4px; overflow:hidden;}
        .progress-fill{height:100%; background:linear-gradient(90deg,var(--mint),var(--lav)); border-radius:4px; transition:width .2s;}
        .gaveta-btn{border-radius:10px; padding:8px 14px; font-weight:600; font-size:13px; cursor:pointer; border:1.5px solid transparent; transition:all .15s; font-family:inherit;}
        .gaveta-btn.active{background:var(--mint-light); color:var(--mint); border-color:var(--mint-mid);}
        .gaveta-btn:not(.active){background:#f5f7fa; color:#666; border-color:#e0e7ef;}
        .checklist-item{display:flex; align-items:flex-start; gap:10px; padding:8px 0; cursor:pointer; border-bottom:1px solid #f0f2f5;}
        .check-box{width:20px; height:20px; border-radius:6px; border:2px solid var(--mint); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; transition:all .15s; cursor:pointer;}
        .check-box.checked{background:var(--mint); border-color:var(--mint);}
        @media(max-width:768px){
          .font-body{font-size:16px!important; line-height:1.7!important;}
          .font-label{font-size:15px!important; font-weight:700!important;}
          .sidebar{display:none!important;}
          .mobile-bar{display:flex!important;}
          .main-content{padding:16px!important; padding-bottom:100px!important;} /* mais espaço embaixo */
        }
        .mobile-bar{display:none; position:fixed; bottom:0; left:0; right:0; background:white; border-top:1.5px solid #e0e7ef; z-index:100; padding:6px 0;}
        .sidebar{display:flex;}
        .mobile-menu-overlay{position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; animation:fadeIn 0.2s;}
        .mobile-menu-drawer{position:fixed; top:0; left:0; bottom:0; width:280px; background:white; z-index:201; box-shadow:2px 0 12px rgba(0,0,0,0.15); animation:slideIn 0.3s; overflow-y:auto;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        .hamburger{display:none; position:fixed; top:16px; right:16px; z-index:150; background:white; border:1.5px solid #e0e7ef; border-radius:12px; padding:10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.08);}
        .dashboard-logout{display:block;}
        @media(max-width:768px){.hamburger{display:flex;}}
      `}</style>

      {/* MODAL ALARME */}
      {alarmeAtivo && (
        <div className="alarme-modal">
          <div style={{background:"white", borderRadius:20, padding:32, maxWidth:380, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:48, marginBottom:12}}>🔔</div>
            <h2 style={{color:"var(--danger)", fontWeight:800, fontSize:14, marginBottom:8}}>ATENÇÃO!</h2>
            <p style={{fontSize:14, color:"#333", marginBottom:20, lineHeight:1.6}}>{alarmeMsg}</p>
            <button className="btn-mint" onClick={pararAlarme} style={{width:"100%", padding:"14px", fontSize:18}}>
              ✅ Desligar Alarme / Marcar como Ministrado
            </button>
          </div>
        </div>
      )}

      {/* BOTÃO HAMBÚRGUER MOBILE */}
      <button className="hamburger" onClick={()=>setMobileMenu(true)}>
        <Menu size={24} color="#3d9b7a"/>
      </button>

      {/* MENU LATERAL MOBILE (DRAWER) */}
      {mobileMenu && (
        <>
          <div className="mobile-menu-overlay" onClick={()=>setMobileMenu(false)}/>
          <div className="mobile-menu-drawer">
            <div style={{padding:"24px 16px"}}>
              {/* Logo e fechar */}
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28}}>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{width:38, height:38, background:"linear-gradient(135deg,var(--mint),var(--lav))", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <Heart size={20} color="white" />
                  </div>
                  <div>
                    <p style={{fontWeight:800, fontSize:15, color:"var(--mint)", lineHeight:1, margin:0}}>MãeGuia</p>
                    <p style={{fontSize:11, color:"var(--lav)", fontWeight:700, margin:0}}>DF</p>
                  </div>
                </div>
                <button onClick={()=>setMobileMenu(false)} style={{background:"#f0f0f0", border:"none", borderRadius:10, padding:"8px", cursor:"pointer", display:"flex"}}>
                  <X size={20} color="#666"/>
                </button>
              </div>

              {/* Seletor de filho */}
              {filhos.length > 0 && (
                <div style={{background:"var(--mint-light)", borderRadius:12, padding:"10px 12px", marginBottom:20}}>
                  <p style={{fontSize:11, color:"var(--mint)", fontWeight:700, marginBottom:6}}>FILHO(A) ATIVO</p>
                  <select className="select-field" value={filhoSelecionado} onChange={e=>{setFilhoSelecionado(+e.target.value);setMobileMenu(false);}} style={{background:"transparent", border:"none", padding:0, fontSize:14, fontWeight:700, color:"#333"}}>
                    {filhos.map((f,i) => <option key={f.id} value={i}>{f.nome}</option>)}
                  </select>
                </div>
              )}

              {/* Menu */}
              <nav style={{display:"flex", flexDirection:"column", gap:4, marginBottom:20}}>
                {navItems.map(n => (
                  <button key={n.id} className={`nav-item ${tela===n.id?"active":""}`} onClick={()=>{setTela(n.id);setMobileMenu(false);}} style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"none", border:"none", textAlign:"left", fontSize:15, color:tela===n.id?"var(--mint)":"#1a1a1a", width:"100%", fontFamily:"inherit"}}>
                    {n.icon} {n.label}
                  </button>
                ))}
              </nav>

              {/* Botão sair */}
              <button onClick={()=>{fazerLogout();setMobileMenu(false);}} style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#fff0ef", color:"var(--danger)", border:"1.5px solid #fcc", borderRadius:12, padding:"10px 14px", fontWeight:700, cursor:"pointer", fontSize:14, width:"100%", fontFamily:"inherit"}}>
                <LogOut size={16}/> Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* SIDEBAR DESKTOP */}
      <aside className="sidebar flex-col" style={{width:240, background:"white", height:"100vh", position:"sticky", top:0, borderRight:"1.5px solid #e8f0ea", padding:"24px 16px", overflowY:"auto", flexShrink:0}}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:4}}>
            <div style={{width:38, height:38, background:"linear-gradient(135deg,var(--mint),var(--lav))", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Heart size={20} color="white" />
            </div>
            <div>
              <p style={{fontWeight:800, fontSize:15, color:"var(--mint)", lineHeight:1}}>MãeGuia</p>
              <p style={{fontSize:15, color:"var(--lav)", fontWeight:700}}>DF</p>
            </div>
          </div>
          <p style={{fontSize:14, color:"#1a1a1a", marginTop:8}}>Olá, {mae.nome.split(" ")[0]} 💜</p>
        </div>

        {/* Seletor de filho */}
        {filhos.length > 0 && (
          <div style={{background:"var(--mint-light)", borderRadius:12, padding:"10px 12px", marginBottom:20}}>
            <p style={{fontSize:15, color:"var(--mint)", fontWeight:700, marginBottom:6}}>FILHO(A) ATIVO</p>
            <select className="select-field" value={filhoSelecionado} onChange={e=>setFilhoSelecionado(+e.target.value)} style={{background:"transparent", border:"none", padding:0, fontSize:14, fontWeight:700, color:"#333"}}>
              {filhos.map((f,i) => <option key={f.id} value={i}>{f.nome}</option>)}
            </select>
          </div>
        )}

        <nav style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${tela===n.id?"active":""}`} onClick={()=>{setTela(n.id);setMobileMenu(false);}} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"none", border:"none", textAlign:"left", fontSize:14, color:tela===n.id?"var(--mint)":"#555", width:"100%", fontFamily:"inherit"}}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        {/* Botão Sair Desktop */}
        <button onClick={fazerLogout} style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#fff0ef", color:"var(--danger)", border:"1.5px solid #fcc", borderRadius:12, padding:"10px 14px", fontWeight:700, cursor:"pointer", fontSize:14, width:"100%", fontFamily:"inherit", marginTop:16}}>
          <LogOut size={16}/> Sair
        </button>
      </aside>

      {/* BOTTOM BAR MOBILE */}
      <div className="mobile-bar" style={{justifyContent:"space-around"}}>
        {navItems.map(n => (
          <button key={n.id} onClick={()=>setTela(n.id)} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", color:tela===n.id?"var(--mint)":"#888", fontFamily:"inherit"}}>
            {n.icon}
            <span style={{fontSize:9, fontWeight:700}}>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* MAIN */}
      <main className="main-content" style={{flex:1, padding:"28px 24px", overflowY:"auto", paddingBottom:80}}>
        {tela === "dashboard" && <TelaDashboard mae={mae} filho={filho} filhos={filhos} filhoSelecionado={filhoSelecionado} setFilhoSelecionado={setFilhoSelecionado} remedios={remedios} exames={exames} canalCadastrado={canalCadastrado} setCanalCadastrado={setCanalCadastrado} setTela={setTela} fazerLogout={fazerLogout} />}
        {tela === "agenda" && <TelaAgenda remedios={remedios} setRemedios={setRemedios} exames={exames} setExames={setExames} novoRemedio={novoRemedio} setNovoRemedio={setNovoRemedio} novoExame={novoExame} setNovoExame={setNovoExame} tocarAlarme={tocarAlarme} filho={filho} atividades={atividades} setAtividades={setAtividades} novaAtividade={novaAtividade} setNovaAtividade={setNovaAtividade} />}
        {tela === "requerimentos" && <TelaRequerimentos mae={mae} filho={filho} filhos={filhos} filhoSelecionado={filhoSelecionado} setFilhoSelecionado={setFilhoSelecionado} reqSelecionado={reqSelecionado} setReqSelecionado={setReqSelecionado} textoCopied={textoCopied} setTextoCopied={setTextoCopied} docSalvo={docSalvo} salvarRequerimento={salvarRequerimento} gerarTexto={gerarTextoRequerimento} />}
        {tela === "documentos" && <TelaDocumentos filho={filho} filhoSelecionado={filhoSelecionado} getDocFilho={getDocFilho} setDocFilho={setDocFilho} gaveta={gaveta} setGaveta={setGaveta} uploadProgress={uploadProgress} cameraInputRef={cameraInputRef} galeriaInputRef={galeriaInputRef} handleUpload={handleUpload} />}
        {tela === "cuidador" && <TelaCuidador filho={filho} filhoSelecionado={filhoSelecionado} cuidador={cuidador} setCuidador={setCuidador} mae={mae} gerarMsg={gerarMsgCuidador} enviarWhatsApp={enviarWhatsApp} msgCopiada={msgCopiada} setMsgCopiada={setMsgCopiada} />}
        {tela === "direitos" && <TelaDireitos direitoAberto={direitoAberto} setDireitoAberto={setDireitoAberto} checklistFeito={checklistFeito} setChecklistFeito={setChecklistFeito} setTela={setTela} />}
        {tela === "gerenciar-filhos" && <TelaGerenciarFilhos filhos={filhos} setFilhos={setFilhos} onSalvarPerfil={onSalvarPerfil} mae={mae} filhoSelecionado={filhoSelecionado} setFilhoSelecionado={setFilhoSelecionado} />}
        {tela === "diario" && <TelaDiario registros={registros} setRegistros={setRegistros} novoRegistro={novoRegistro} setNovoRegistro={setNovoRegistro} filho={filho} />}
        {tela === "financeiro" && <TelaFinanceiro gastos={gastos} setGastos={setGastos} novoGasto={novoGasto} setNovoGasto={setNovoGasto} orcamento={orcamento} setOrcamento={setOrcamento} filho={filho} />}
        {tela === "contatos" && <TelaContatos contatos={contatos} setContatos={setContatos} novoContato={novoContato} setNovoContato={setNovoContato} />}
      </main>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function CampoInput({ icon, label, dica, erro, sufixo, children }) {
  const [focado, setFocado] = useState(false);
  return (
    <div>
      <label style={{display:"block", fontSize:14, fontWeight:600, color:"#333", marginBottom:6, marginLeft:4, letterSpacing:0.2}}>{label}</label>
      <div
        onFocus={()=>setFocado(true)} onBlur={()=>setFocado(false)}
        style={{
          display:"flex", alignItems:"center", gap:10, background:"#fff",
          borderRadius:16, padding:"14px 16px",
          border: `1.5px solid ${erro ? "#f0a8a8" : focado ? "#3d9b7a" : "#f0f0f0"}`,
          boxShadow: focado ? "inset 0 1px 4px rgba(61,155,122,0.10), 0 0 0 3px rgba(61,155,122,0.10)" : "0 1px 2px rgba(0,0,0,0.03)",
          transition:"all .25s ease",
        }}>
        <span style={{color: focado ? "#3d9b7a" : "#b8c0bc", display:"flex", transition:"color .25s", flexShrink:0}}>{icon}</span>
        <div style={{flex:1}}>{children}</div>
        {sufixo}
      </div>
      {dica && !erro && <p style={{fontSize:15, color:"#666", marginTop:5, marginLeft:6, lineHeight:1.4}}>{dica}</p>}
      {erro && <p style={{color:"#c0392b", fontSize:14, marginTop:5, marginLeft:6, fontWeight:600}}>⚠ {erro}</p>}
    </div>
  );
}

const inputBare = {width:"100%", border:"none", outline:"none", background:"transparent", fontSize:14, fontFamily:"inherit", color:"#1a1a1a", padding:0};

function CampoTextarea({ icon, label, dica, cor="#3d9b7a", rows=4, value, onChange, placeholder }) {
  const [focado, setFocado] = useState(false);
  return (
    <div>
      <label style={{display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, color:"#333", marginBottom:6, marginLeft:4, letterSpacing:0.2}}>
        {icon && <span style={{color:cor, display:"flex"}}>{icon}</span>}{label}
      </label>
      <div
        onFocus={()=>setFocado(true)} onBlur={()=>setFocado(false)}
        style={{background:"#fff", borderRadius:16, padding:"12px 14px",
          border:`1.5px solid ${focado ? cor : "#f0f0f0"}`,
          boxShadow: focado ? `inset 0 1px 4px rgba(0,0,0,0.04), 0 0 0 3px ${cor}1a` : "0 1px 2px rgba(0,0,0,0.03)",
          transition:"all .25s ease"}}>
        <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
          style={{width:"100%", border:"none", outline:"none", background:"transparent", fontSize:14, fontFamily:"inherit", color:"#1a1a1a", resize:"vertical", lineHeight:1.6}}/>
      </div>
      {dica && <p style={{fontSize:15, color:"#666", marginTop:5, marginLeft:6, lineHeight:1.4}}>{dica}</p>}
    </div>
  );
}

function Onboarding({step,mae,setMae,errors,senha,setSenha,criandoConta,filhos,novoFilho,setNovoFilho,toggleDiag,adicionarFilho,avancar,finalizar,setFilhos,sairEDeletarConta}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#f6f8f7", padding:"24px 16px", fontFamily:"'Nunito', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>
      <div style={{maxWidth:480, width:"100%"}}>
        {/* Botão Voltar/Sair */}
        <div style={{marginBottom:16, display:"flex", justifyContent:"flex-end"}}>
          <button onClick={sairEDeletarConta} style={{display:"flex", alignItems:"center", gap:6, background:"#fff0ef", color:"#c0392b", border:"1.5px solid #fcc", borderRadius:10, padding:"8px 14px", fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"inherit"}}>
            <LogOut size={14}/> Sair e Refazer Cadastro
          </button>
        </div>
        
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{width:60, height:60, background:"linear-gradient(135deg,#3d9b7a,#7c5cbf)", borderRadius:20, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:12, boxShadow:"0 6px 20px rgba(61,155,122,0.25)"}}>
            <Heart size={30} color="white" />
          </div>
          <h1 style={{fontWeight:800, fontSize:13, color:"#2f7d62", margin:0}}>MãeGuia DF</h1>
          <p style={{color:"#7c5cbf", fontWeight:600, marginTop:2, fontSize:18}}>Sua plataforma de cuidado e direitos</p>
        </div>

        {/* Indicador de progresso */}
        <div style={{display:"flex", gap:8, marginBottom:20, padding:"0 4px"}}>
          {[1,2].map(s => (
            <div key={s} style={{flex:1, height:5, borderRadius:4, background: step>=s ? "linear-gradient(90deg,#3d9b7a,#7c5cbf)" : "#e3e8e5", transition:"background .3s"}} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{marginBottom:22, padding:"0 4px"}}>
              <h2 style={{fontWeight:800, fontSize:21, color:"#1f2937", marginBottom:4}}>Bem-vinda, Mãe Guerreira! 💜</h2>
              <p style={{color:"#1a1a1a", fontSize:15, lineHeight:1.5}}>Vamos criar seu perfil. Seus dados ficam seguros e ajudam a personalizar os alertas.</p>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <CampoInput icon={<User size={19}/>} label="NOME COMPLETO DA MÃE" erro={errors.nome}>
                <input style={inputBare} placeholder="Ex: Ana Beatriz Silva" value={mae.nome} onChange={e=>setMae(p=>({...p,nome:e.target.value}))} />
              </CampoInput>

              <CampoInput icon={<Mail size={19}/>} label="E-MAIL" erro={errors.email}>
                <input style={inputBare} type="email" placeholder="seu@email.com" value={mae.email} onChange={e=>setMae(p=>({...p,email:e.target.value}))} />
              </CampoInput>

              <CampoInput icon={<Lock size={19}/>} label="SENHA" erro={errors.senha} dica="Mínimo 6 caracteres. Você vai usar pra acessar de novo depois.">
                <input style={inputBare} type="password" placeholder="Crie uma senha" value={senha} onChange={e=>setSenha(e.target.value)} />
              </CampoInput>

              {errors.conta && (
                <div style={{background:"#fff0ef", border:"1.5px solid #fcc", borderRadius:12, padding:"10px 14px", color:"#c0392b", fontSize:14, fontWeight:600}}>
                  ⚠️ {errors.conta}
                </div>
              )}

              <CampoInput icon={<Phone size={19}/>} label="CELULAR (WHATSAPP)" erro={errors.celular} dica="Necessário para o envio dos alertas diários.">
                <input style={inputBare} type="tel" placeholder="(61) 9 9999-9999" value={mae.celular} onChange={e=>setMae(p=>({...p,celular:e.target.value}))} />
              </CampoInput>

              <CampoInput icon={<MapPin size={19}/>} label="REGIÃO ADMINISTRATIVA (RA)" erro={errors.regiao} dica="Usada para mostrar mutirões e avisos da sua região.">
                <select style={{...inputBare, cursor:"pointer", color: mae.regiao ? "#222" : "#9ca3af"}} value={mae.regiao} onChange={e=>setMae(p=>({...p,regiao:e.target.value}))}>
                  <option value="">Selecione sua RA...</option>
                  {REGIOES_DF.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </CampoInput>

              <button onClick={avancar} style={{width:"100%", marginTop:6, padding:"17px", fontSize:15, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", color:"white", border:"none", borderRadius:18, cursor:"pointer", fontFamily:"inherit", background:"linear-gradient(135deg,#3d9b7a,#5bb89a)", boxShadow:"0 6px 18px rgba(61,155,122,0.32)", transition:"transform .15s"}}
                onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                Continuar → Cadastrar Filhos
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{marginBottom:18, padding:"0 4px"}}>
              <h2 style={{fontWeight:800, fontSize:21, color:"#1f2937", marginBottom:4}}>Agora, seus filhos(as) 👶</h2>
              <p style={{color:"#1a1a1a", fontSize:15, lineHeight:1.5}}>Adicione um ou mais filhos. Você poderá gerenciar cada um separadamente.</p>
            </div>

            {/* Filhos já adicionados */}
            {filhos.map((f,i) => (
              <div key={f.id} style={{background:"#fff", border:"1.5px solid #d8efe6", borderRadius:16, padding:"14px 16px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <div style={{width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#e8f5f0,#f0eaf8)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <Baby size={20} color="#3d9b7a"/>
                  </div>
                  <div>
                    <p style={{fontWeight:700, color:"#2f7d62", margin:0, fontSize:15}}>{f.nome}, {f.idade} anos</p>
                    <p style={{fontSize:14, color:"#1a1a1a", margin:0}}>{f.diagnosticos.join(", ") || "Diagnóstico a definir"}</p>
                  </div>
                </div>
                <button onClick={()=>setFilhos(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:"#fef0f0", border:"none", borderRadius:10, padding:"8px", cursor:"pointer", color:"#c0392b", display:"flex"}}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}

            {/* Card de novo filho */}
            <div style={{background:"#fff", border:"1.5px dashed #b8e0d2", borderRadius:18, padding:"18px", marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                <CampoInput icon={<Baby size={19}/>} label="NOME DA CRIANÇA">
                  <input style={inputBare} placeholder="Nome do filho(a)" value={novoFilho.nome} onChange={e=>setNovoFilho(p=>({...p,nome:e.target.value}))} />
                </CampoInput>
                <CampoInput icon={<Clock size={19}/>} label="IDADE">
                  <input style={inputBare} type="number" placeholder="Idade em anos" value={novoFilho.idade} onChange={e=>setNovoFilho(p=>({...p,idade:e.target.value}))} min="0" max="25"/>
                </CampoInput>
                <div>
                  <p style={{fontSize:14, fontWeight:600, color:"#333", marginBottom:6, marginLeft:4, letterSpacing:0.2}}>DIAGNÓSTICO(S)</p>
                  <p style={{fontSize:15, color:"#666", marginBottom:10, marginLeft:4}}>Selecione um ou mais (múltipla escolha):</p>
                  <div style={{maxHeight:240, overflowY:"auto", border:"1.5px solid #e5e7eb", borderRadius:14, padding:10, background:"#fafbfa"}}>
                    <div style={{display:"flex", flexDirection:"column", gap:4}}>
                      {DIAGNOSTICOS.map(d => {
                        const on = novoFilho.diagnosticos.includes(d);
                        return (
                          <button key={d} onClick={()=>toggleDiag(d)} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, fontSize:15, fontWeight:on?700:600, cursor:"pointer", border:"none", fontFamily:"inherit", transition:"all .15s", background:on?"#e8f5f0":"white", color:on?"#2f7d62":"#333", textAlign:"left", width:"100%"}}>
                            <div style={{width:22, height:22, borderRadius:6, border:`2px solid ${on?"#3d9b7a":"#d1d5db"}`, background:on?"#3d9b7a":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s"}}>
                              {on && <Check size={15} color="white" strokeWidth={3}/>}
                            </div>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <button onClick={adicionarFilho} style={{width:"100%", padding:"13px", fontSize:14, fontWeight:700, color:"#3d9b7a", background:"#fff", border:"1.5px solid #3d9b7a", borderRadius:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                  <Plus size={16}/> Adicionar filho(a)
                </button>
              </div>
            </div>

            <button onClick={finalizar} disabled={(filhos.length===0&&!novoFilho.nome) || criandoConta} style={{width:"100%", padding:"17px", fontSize:15, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", color:"white", border:"none", borderRadius:18, cursor:"pointer", fontFamily:"inherit", background:"linear-gradient(135deg,#3d9b7a,#5bb89a)", boxShadow:"0 6px 18px rgba(61,155,122,0.32)", opacity: ((filhos.length===0&&!novoFilho.nome) || criandoConta) ? 0.45 : 1, transition:"opacity .2s"}}>
              {criandoConta ? "Criando conta... ⏳" : "Salvar Cadastro e Entrar ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function TelaDashboard({mae,filho,filhos,filhoSelecionado,setFilhoSelecionado,remedios,exames,canalCadastrado,setCanalCadastrado,setTela,fazerLogout}) {
  const hoje = new Date();
  const GDF_ALERTS = [
    { id:1, tipo:"🏥", titulo:"Mutirão de Neuropediatria", msg:`Nova agenda na sua RA (${mae.regiao}). Vagas abertas para avaliação especializada.`, data:"22/05/2025" },
    { id:2, tipo:"🪪", titulo:"Renovação Passe Livre Especial", msg:"Prazo de renovação aberto no Na Hora. Leve laudo atualizado e comprovante de residência.", data:"20/05/2025" },
    { id:3, tipo:"📋", titulo:"CIPTEA — Novo Lote de Atendimentos", msg:"SEDES-DF abrindo agendamentos online para emissão e renovação da CIPTEA.", data:"18/05/2025" },
    { id:4, tipo:"💊", titulo:"BPC/LOAS — Campanha de Recadastramento", msg:"INSS realizando mutirão de recadastramento. Compareça a uma agência com documentos.", data:"15/05/2025" },
  ];
  return (
    <div>
      {/* Header do Dashboard */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:12}}>
          <div>
            <h1 style={{fontWeight:800, fontSize:14, color:"#222", margin:0}}>Dashboard</h1>
            <p style={{color:"#1a1a1a", fontSize:15}}>{hoje.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</p>
          </div>
          
          {/* Gerenciamento de Filhos */}
          {filhos.length > 0 && (
            <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
              <select value={filhoSelecionado} onChange={e=>setFilhoSelecionado(+e.target.value)} style={{background:"var(--mint-light)", border:"1.5px solid var(--mint-mid)", borderRadius:12, padding:"8px 14px", fontWeight:700, fontSize:14, color:"#3d9b7a", cursor:"pointer", fontFamily:"inherit"}}>
                {filhos.map((f,i) => <option key={f.id} value={i}>{f.nome}</option>)}
              </select>
              <button onClick={()=>setTela("gerenciar-filhos")} style={{background:"var(--lav)", color:"white", border:"none", borderRadius:12, padding:"8px 14px", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit", display:"flex", alignItems:"center", gap:6}}>
                <Plus size={14}/> Adicionar Filho
              </button>
            </div>
          )}
        </div>
        
        {/* Botão Sair - Centralizado Mobile */}
        <div className="dashboard-logout">
          <button onClick={fazerLogout} style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"#fff0ef", color:"#c0392b", border:"1.5px solid #fcc", borderRadius:12, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:15, fontFamily:"inherit", width:"100%", maxWidth:300, margin:"0 auto"}}>
            <LogOut size={15}/> Sair
          </button>
        </div>
      </div>

      {filho && (
        <>
          {/* Card filho */}
          <div className="card" style={{background:"linear-gradient(135deg,#e8f5f0,#f0eaf8)", marginBottom:20, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
            <div style={{width:56, height:56, background:"linear-gradient(135deg,#3d9b7a,#7c5cbf)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
              <Baby size={28} color="white" />
            </div>
            <div style={{flex:1}}>
              <h2 style={{fontWeight:800, fontSize:14, margin:0, color:"#222"}}>{filho.nome}</h2>
              <p style={{margin:"2px 0", color:"#1a1a1a", fontSize:15}}>{filho.idade} anos • {filho.diagnosticos.join(", ")}</p>
              <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:6}}>
                {filho.diagnosticos.map(d=><span key={d} className="tag">{d}</span>)}
              </div>
            </div>
            <div style={{background:"#e8f5f0", border:"1.5px solid #b8e0d2", borderRadius:12, padding:"10px 16px", minWidth:200}}>
              <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                <Activity size={14} color="#3d9b7a"/>
                <span style={{fontSize:15, fontWeight:800, color:"#3d9b7a"}}>STATUS DO SISTEMA</span>
              </div>
              <p style={{fontSize:14, color:"#1a1a1a", margin:0, lineHeight:1.5}}>✅ Gatilhos ativos. Alertas via WhatsApp</p>
              <p style={{fontSize:14, fontWeight:700, color:"#3d9b7a", margin:"2px 0 0"}}>{mae.celular}</p>
            </div>
          </div>

          {/* Card perfil da mãe */}
          <div className="card" style={{marginBottom:20, padding:"18px 20px"}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:14}}>
              <User size={17} color="#7c5cbf"/>
              <h3 style={{fontWeight:700, fontSize:15, margin:0, color:"#1f2937"}}>Seu perfil</h3>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12}}>
              {[
                {icon:<User size={17}/>, label:"NOME", valor:mae.nome},
                {icon:<Mail size={17}/>, label:"E-MAIL", valor:mae.email},
                {icon:<Phone size={17}/>, label:"WHATSAPP", valor:mae.celular},
                {icon:<MapPin size={17}/>, label:"REGIÃO ADMINISTRATIVA", valor:mae.regiao},
              ].map(item=>(
                <div key={item.label} style={{display:"flex", alignItems:"center", gap:12, background:"#fafbfa", border:"1px solid #f0f0f0", borderRadius:14, padding:"12px 14px"}}>
                  <div style={{width:36, height:36, borderRadius:10, background:"#f0eaf8", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c5cbf", flexShrink:0}}>{item.icon}</div>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:10.5, fontWeight:600, color:"#666", margin:0, letterSpacing:0.4}}>{item.label}</p>
                    <p style={{fontSize:14, fontWeight:700, color:"#1f2937", margin:"1px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{item.valor || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24}}>
            <div className="card" style={{borderLeft:"4px solid #3d9b7a"}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
                <Pill size={18} color="#3d9b7a"/>
                <h3 style={{fontWeight:700, fontSize:15, margin:0}}>Medicamentos Hoje</h3>
              </div>
              {remedios.length === 0 ? <p style={{color:"#1a1a1a", fontSize:15}}>Nenhum cadastrado ainda</p> : remedios.slice(0,3).map(r=>(
                <div key={r.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #f0f0f0"}}>
                  <span style={{fontSize:15, fontWeight:600}}>{r.nome}</span>
                  <span className="tag-mint" style={{fontSize:15, padding:"2px 8px", borderRadius:10, background:"var(--mint-light)", color:"var(--mint)", fontWeight:700}}>{r.horario}</span>
                </div>
              ))}
              <button className="btn-outline" onClick={()=>setTela("agenda")} style={{width:"100%",marginTop:10,padding:"6px",fontSize:15}}>Ver Agenda Completa</button>
            </div>
            <div className="card" style={{borderLeft:"4px solid #7c5cbf"}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
                <Calendar size={18} color="#7c5cbf"/>
                <h3 style={{fontWeight:700, fontSize:15, margin:0}}>Próximos Exames</h3>
              </div>
              {exames.length === 0 ? <p style={{color:"#1a1a1a", fontSize:15}}>Nenhum exame agendado</p> : exames.slice(0,2).map(e=>(
                <div key={e.id} style={{padding:"6px 0", borderBottom:"1px solid #f0f0f0"}}>
                  <p style={{fontWeight:600, fontSize:15, margin:0}}>{e.titulo}</p>
                  <p style={{fontSize:14, color:"#1a1a1a", margin:"2px 0 0"}}>{e.data} às {e.hora} • {e.local}</p>
                </div>
              ))}
              <button className="btn-outline" onClick={()=>setTela("agenda")} style={{width:"100%",marginTop:10,padding:"6px",fontSize:15,borderColor:"#7c5cbf",color:"#7c5cbf"}}>Gerenciar Exames</button>
            </div>
          </div>
        </>
      )}

      {/* GDF Alerta */}
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:36, height:36, background:"linear-gradient(135deg,#3d9b7a,#5bb89a)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Bell size={18} color="white"/>
            </div>
            <div>
              <h3 style={{fontWeight:800, fontSize:14, margin:0, color:"#222"}}>GDF Alerta</h3>
              <p style={{fontSize:14, color:"#1a1a1a", margin:0}}>Informações oficiais para {mae.regiao}</p>
            </div>
          </div>
          {!canalCadastrado ? (
            <button className="btn-mint" onClick={()=>setCanalCadastrado(true)} style={{padding:"8px 16px", fontSize:15}}>
              📱 Cadastrar no Canal
            </button>
          ) : (
            <span style={{background:"#e8f5f0", color:"#3d9b7a", borderRadius:10, padding:"6px 12px", fontSize:14, fontWeight:700}}>✅ Canal ativo: {mae.celular}</span>
          )}
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {GDF_ALERTS.map(a=>(
            <div key={a.id} style={{display:"flex", gap:12, padding:"12px 14px", background:"#f8fcfa", borderRadius:12, border:"1px solid #e8f0ea", alignItems:"flex-start"}}>
              <span style={{fontSize:14, flexShrink:0}}>{a.tipo}</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:700, fontSize:14, margin:"0 0 2px", color:"#222"}}>{a.titulo}</p>
                <p style={{fontSize:15, color:"#1a1a1a", margin:0, lineHeight:1.5}}>{a.msg}</p>
              </div>
              <span style={{fontSize:15, color:"#1a1a1a", flexShrink:0, marginTop:2}}>{a.data}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações rápidas */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12}}>
        {[
          {icon:"📄", label:"Gerar Requerimento", tela:"requerimentos", color:"#e8f5f0", border:"#b8e0d2", text:"#3d9b7a"},
          {icon:"💊", label:"Cadastrar Remédio", tela:"agenda", color:"#f0eaf8", border:"#c9b8e8", text:"#7c5cbf"},
          {icon:"📁", label:"Meu Arquivo", tela:"documentos", color:"#fff3e6", border:"#ffd4a8", text:"#e07b39"},
          {icon:"👥", label:"Módulo Cuidador", tela:"cuidador", color:"#f0f0f8", border:"#d4d0e8", text:"#555"},
        ].map(a=>(
          <button key={a.tela} onClick={()=>setTela(a.tela)} style={{background:a.color, border:`1.5px solid ${a.border}`, borderRadius:14, padding:"16px 12px", cursor:"pointer", textAlign:"center", fontFamily:"inherit", transition:"transform .15s"}}>
            <div style={{fontSize:14, marginBottom:8}}>{a.icon}</div>
            <p style={{fontWeight:700, fontSize:15, color:a.text, margin:0}}>{a.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDÁRIO MENSAL ────────────────────────────────────────────────────────
function CalendarioMensal({remedios, exames}) {
  const [mesAtual, setMesAtual] = useState(new Date());
  
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  
  function mesAnterior() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  }
  
  function proximoMes() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  }
  
  function temEventoNoDia(dia) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth()+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const diaSemana = diasSemana[new Date(dataStr).getDay()];
    const temRemedio = remedios.some(r => r.dias.includes(diaSemana));
    const temExame = exames.some(e => e.data === dataStr);
    return { temRemedio, temExame };
  }
  
  const dias = [];
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(<div key={`empty-${i}`} style={{padding:8}}/>);
  }
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const eventos = temEventoNoDia(dia);
    const hoje = new Date();
    const ehHoje = dia === hoje.getDate() && mesAtual.getMonth() === hoje.getMonth() && mesAtual.getFullYear() === hoje.getFullYear();
    
    dias.push(
      <div key={dia} style={{padding:"8px 4px",textAlign:"center",borderRadius:8,background: ehHoje ? "#e8f5f0" : eventos.temExame ? "#f0eaf8" : eventos.temRemedio ? "#fff8f0" : "transparent",border: ehHoje ? "2px solid #3d9b7a" : "1px solid #f0f0f0",position:"relative"}}>
        <div style={{fontSize:13, fontWeight: ehHoje ? 700 : 600, color: ehHoje ? "#3d9b7a" : "#333"}}>{dia}</div>
        {eventos.temRemedio && <div style={{fontSize:8, marginTop:2}}>💊</div>}
        {eventos.temExame && <div style={{fontSize:8, marginTop:2}}>📅</div>}
      </div>
    );
  }
  
  return (
    <div className="card" style={{marginBottom:20}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
        <button onClick={mesAnterior} className="btn-outline" style={{padding:"6px 12px"}}><ChevronLeft size={16}/></button>
        <h3 style={{fontSize:15, fontWeight:800, margin:0}}>{meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</h3>
        <button onClick={proximoMes} className="btn-outline" style={{padding:"6px 12px"}}><ChevronRight size={16}/></button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4, marginBottom:8}}>
        {diasSemana.map(d => <div key={d} style={{textAlign:"center", fontSize:11, fontWeight:700, color:"#666", padding:4}}>{d}</div>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4}}>{dias}</div>
      <div style={{display:"flex", gap:16, marginTop:16, fontSize:12, flexWrap:"wrap"}}>
        <div style={{display:"flex", alignItems:"center", gap:6}}><div style={{width:20, height:20, background:"#e8f5f0", border:"2px solid #3d9b7a", borderRadius:4}}/><span>Hoje</span></div>
        <div style={{display:"flex", alignItems:"center", gap:6}}><div style={{width:20, height:20, background:"#fff8f0", border:"1px solid #f0f0f0", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10}}>💊</div><span>Medicamentos</span></div>
        <div style={{display:"flex", alignItems:"center", gap:6}}><div style={{width:20, height:20, background:"#f0eaf8", border:"1px solid #f0f0f0", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10}}>📅</div><span>Exames</span></div>
      </div>
    </div>
  );
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function TelaAgenda({remedios,setRemedios,exames,setExames,novoRemedio,setNovoRemedio,novoExame,setNovoExame,tocarAlarme,filho,atividades,setAtividades,novaAtividade,setNovaAtividade}) {
  const DIAS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  
  const PROFISSIONAIS = [
    {nome:"Nutricionista", cor:"#3d9b7a", corClara:"#e8f5f0"},
    {nome:"Psicólogo", cor:"#7c5cbf", corClara:"#f0eaf8"},
    {nome:"Fonoaudiólogo", cor:"#e07b39", corClara:"#fff3e6"},
    {nome:"Terapeuta Ocupacional", cor:"#2596be", corClara:"#e6f4f9"},
    {nome:"Médico", cor:"#c0392b", corClara:"#fef0f0"},
    {nome:"Professor/Escola", cor:"#27ae60", corClara:"#e8f6ee"}
  ];
  function toggleDia(d) { setNovoRemedio(p=>({...p, dias: p.dias.includes(d) ? p.dias.filter(x=>x!==d) : [...p.dias,d]})); }
  function addRemedio() {
    if (!novoRemedio.nome || !novoRemedio.horario) return;
    setRemedios(p=>[...p, {...novoRemedio, id:Date.now(), ministrado:false}]);
    setNovoRemedio({nome:"",dosagem:"",dias:[],horario:""});
  }
  function addExame() {
    if (!novoExame.titulo || !novoExame.data) return;
    setExames(p=>[...p, {...novoExame, id:Date.now()}]);
    setNovoExame({titulo:"",local:"",data:"",hora:"",notas:"",horasAntesPreparacao:1});
  }
  function marcarMinistrado(id) { setRemedios(p=>p.map(r=>r.id===id ? {...r,ministrado:true}:r)); }
  
  // Atividades Terapêuticas
  function addAtividade() {
    if (!novaAtividade.nome || !novaAtividade.profissional) return;
    setAtividades(p=>[...p, {...novaAtividade, id:Date.now(), concluida:false, dataRegistro:new Date().toISOString()}]);
    setNovaAtividade({nome:"",profissional:"",horario:"",instrucoes:""});
  }
  function toggleAtividade(id) {
    setAtividades(p=>p.map(a=>a.id===id ? {...a,concluida:!a.concluida}:a));
  }
  function getProfissional(nome) {
    return PROFISSIONAIS.find(p=>p.nome===nome) || PROFISSIONAIS[0];
  }

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:13,color:"#222",marginBottom:4}}>Agenda de Saúde</h1>
      <p style={{color:"#1a1a1a",fontSize:15,marginBottom:24}}>{filho ? `Para: ${filho.nome}` : "Configure seus filhos no dashboard"}</p>

      {/* CALENDÁRIO */}
      <CalendarioMensal remedios={remedios} exames={exames} />

      {/* MEDICAMENTOS */}
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          <Pill size={20} color="#3d9b7a"/>
          <h2 style={{fontWeight:800,fontSize:14,margin:0}}>Medicamentos</h2>
        </div>
        {/* Form */}
        <div style={{background:"#f8fcfa",borderRadius:18,padding:18,marginBottom:20,border:"1px solid #e0ede6"}}>
          <p style={{fontWeight:700,fontSize:14,color:"#3d9b7a",marginBottom:14}}>+ Novo Medicamento</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <CampoInput icon={<Pill size={19}/>} label="NOME DO REMÉDIO">
              <input style={inputBare} placeholder="Ex: Risperidona" value={novoRemedio.nome} onChange={e=>setNovoRemedio(p=>({...p,nome:e.target.value}))}/>
            </CampoInput>
            <CampoInput icon={<Activity size={19}/>} label="DOSAGEM" dica="Como administrar a dose (ex: 10 gotas, 1 comprimido).">
              <input style={inputBare} placeholder="Ex: 10 gotas" value={novoRemedio.dosagem} onChange={e=>setNovoRemedio(p=>({...p,dosagem:e.target.value}))}/>
            </CampoInput>
            <div>
              <p style={{fontSize:14,fontWeight:600,color:"#333",marginBottom:10,marginLeft:4,letterSpacing:0.2}}>DIAS DA SEMANA</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {DIAS.map(d=>{
                  const on = novoRemedio.dias.includes(d);
                  return <button key={d} onClick={()=>toggleDia(d)} style={{padding:"7px 14px",borderRadius:14,fontSize:15,fontWeight:700,cursor:"pointer",border:"1.5px solid",fontFamily:"inherit",transition:"all .2s",borderColor:on?"#3d9b7a":"#e5e7eb",background:on?"#e8f5f0":"#fafafa",color:on?"#2f7d62":"#9ca3af"}}>{d}</button>;
                })}
              </div>
            </div>
            <CampoInput icon={<Clock size={19}/>} label="HORÁRIO">
              <input style={inputBare} type="time" value={novoRemedio.horario} onChange={e=>setNovoRemedio(p=>({...p,horario:e.target.value}))}/>
            </CampoInput>
            <button onClick={addRemedio} style={{width:"100%",padding:"15px",fontSize:14,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#3d9b7a,#5bb89a)",boxShadow:"0 5px 14px rgba(61,155,122,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Plus size={17}/> Adicionar Medicamento
            </button>
          </div>
        </div>
        {/* Lista */}
        {remedios.length === 0 ? <p style={{color:"#1a1a1a",textAlign:"center",padding:20}}>Nenhum medicamento cadastrado.</p> :
          remedios.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:r.ministrado?"#e8f5f0":"#fff",borderRadius:12,marginBottom:8,border:`1.5px solid ${r.ministrado?"#b8e0d2":"#eee"}`}}>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,margin:0,color:r.ministrado?"#3d9b7a":"#222",textDecoration:r.ministrado?"line-through":"none"}}>{r.nome}</p>
                <p style={{fontSize:14,color:"#1a1a1a",margin:"2px 0 0"}}>{r.dosagem} • {r.dias.join(", ")} • {r.horario}</p>
              </div>
              {!r.ministrado && <>
                <button onClick={()=>tocarAlarme(`⏰ Hora do remédio! ${r.nome} — ${r.dosagem}`)} style={{background:"#fff3e0",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:14,fontWeight:700,color:"#e07b39",fontFamily:"inherit"}} title="Simular alarme"><Volume2 size={14}/></button>
                <button onClick={()=>marcarMinistrado(r.id)} style={{background:"#e8f5f0",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:14,fontWeight:700,color:"#3d9b7a",fontFamily:"inherit"}}><Check size={14}/></button>
              </>}
              <button onClick={()=>setRemedios(p=>p.filter(x=>x.id!==r.id))} style={{background:"#fce4e4",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}><Trash2 size={14}/></button>
            </div>
          ))
        }
      </div>

      {/* ESTEIRA DE EVOLUÇÃO */}
      <div className="card" style={{marginBottom:24, background:"linear-gradient(135deg, #fafcfb 0%, #f8f5fc 100%)", border:"2px solid #e8f0ea"}}>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#3d9b7a,#7c5cbf)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Activity size={22} color="white"/>
            </div>
            <div>
              <h2 style={{fontWeight:800,fontSize:16,margin:0,color:"#222"}}>Esteira de Evolução</h2>
              <p style={{fontSize:13,color:"#666",margin:0}}>Atividades Continuadas • Roteiro Terapêutico</p>
            </div>
          </div>
          
          {/* Barra de Progresso Diário */}
          {atividades.length > 0 && (
            <div style={{background:"white",borderRadius:12,padding:"12px 16px",border:"1.5px solid #e0ede6",marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:"#3d9b7a"}}>Score de Evolução Diária</span>
                <span style={{fontSize:15,fontWeight:800,color:"#3d9b7a"}}>
                  {atividades.filter(a=>a.concluida).length} de {atividades.length} • {Math.round((atividades.filter(a=>a.concluida).length/atividades.length)*100)}%
                </span>
              </div>
              <div style={{height:12,background:"#e8f5f0",borderRadius:8,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(atividades.filter(a=>a.concluida).length/atividades.length)*100}%`,background:"linear-gradient(90deg,#3d9b7a,#7c5cbf)",borderRadius:8,transition:"width 0.3s"}}/>
              </div>
            </div>
          )}
        </div>
        
        {/* Formulário de Nova Atividade */}
        <div style={{background:"white",borderRadius:16,padding:18,marginBottom:20,border:"1.5px solid #e8f0ea"}}>
          <p style={{fontWeight:700,fontSize:14,color:"#7c5cbf",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
            <Plus size={18}/> Nova Atividade Terapêutica
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <CampoInput icon={<Star size={19}/>} label="NOME DA ATIVIDADE">
              <input style={inputBare} placeholder="Ex: Treino de Escovação Autônoma" value={novaAtividade.nome} onChange={e=>setNovaAtividade(p=>({...p,nome:e.target.value}))}/>
            </CampoInput>
            
            <div>
              <label style={{fontSize:13,fontWeight:700,color:"#333",display:"block",marginBottom:6}}>PROFISSIONAL ORIENTADOR</label>
              <select value={novaAtividade.profissional} onChange={e=>setNovaAtividade(p=>({...p,profissional:e.target.value}))} className="select-field">
                <option value="">Selecione o profissional...</option>
                {PROFISSIONAIS.map(prof=>(
                  <option key={prof.nome} value={prof.nome}>{prof.nome}</option>
                ))}
              </select>
            </div>
            
            <CampoInput icon={<Clock size={19}/>} label="PERÍODO / HORÁRIO PREVISTO">
              <input style={inputBare} placeholder="Ex: Logo após acordar, 14:00, Antes de dormir" value={novaAtividade.horario} onChange={e=>setNovaAtividade(p=>({...p,horario:e.target.value}))}/>
            </CampoInput>
            
            <CampoTextarea icon={<FileText size={19}/>} label="INSTRUÇÕES PRÁTICAS / PASSO A PASSO" cor="#7c5cbf" rows={5} value={novaAtividade.instrucoes} onChange={e=>setNovaAtividade(p=>({...p,instrucoes:e.target.value}))} placeholder="Descreva detalhadamente a orientação do profissional. Ex: 'Usar a escova macia, fazer movimentos circulares por 2 minutos e elogiar cada etapa concluída.'"/>
            
            <button onClick={addAtividade} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#7c5cbf,#9b7dd4)",boxShadow:"0 5px 14px rgba(124,92,191,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Plus size={17}/> Adicionar à Esteira de Evolução
            </button>
          </div>
        </div>
        
        {/* Timeline de Atividades */}
        {atividades.length === 0 ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#999"}}>
            <Activity size={48} strokeWidth={1}/>
            <p style={{marginTop:12,fontSize:14}}>Nenhuma atividade cadastrada ainda.</p>
            <p style={{fontSize:13,color:"#666"}}>Adicione as orientações dos profissionais acima.</p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {atividades.map((ativ,idx)=>{
              const prof = getProfissional(ativ.profissional);
              return (
                <div key={ativ.id} style={{background:ativ.concluida?"#e8f6ee":"white",borderRadius:16,padding:"16px 18px",border:`2px solid ${ativ.concluida?"#27ae60":prof.cor}`,position:"relative",transition:"all 0.3s"}}>
                  <div style={{position:"absolute",top:12,right:12,background:prof.corClara,color:prof.cor,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:8,border:`1px solid ${prof.cor}`}}>
                    {ativ.profissional}
                  </div>
                  
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <button onClick={()=>toggleAtividade(ativ.id)} style={{width:50,height:50,borderRadius:12,border:`3px solid ${ativ.concluida?"#27ae60":prof.cor}`,background:ativ.concluida?"#27ae60":"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",transform:ativ.concluida?"scale(1.05)":"scale(1)"}}>
                      {ativ.concluida && <Check size={30} color="white" strokeWidth={3}/>}
                    </button>
                    
                    <div style={{flex:1,paddingRight:60}}>
                      <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 4px",color:ativ.concluida?"#27ae60":"#222",textDecoration:ativ.concluida?"line-through":"none"}}>
                        {ativ.nome}
                      </h3>
                      {ativ.horario && (
                        <p style={{fontSize:13,color:"#666",margin:"0 0 8px",display:"flex",alignItems:"center",gap:6}}>
                          <Clock size={14}/> {ativ.horario}
                        </p>
                      )}
                      {ativ.instrucoes && (
                        <div style={{background:ativ.concluida?"#f0f9f3":"#f8f9fa",borderRadius:10,padding:"10px 12px",marginTop:8,border:"1px solid #e5e7eb"}}>
                          <p style={{fontSize:13,fontWeight:600,color:"#555",marginBottom:4}}>📋 Passo a Passo:</p>
                          <p style={{fontSize:13,color:"#333",margin:0,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{ativ.instrucoes}</p>
                        </div>
                      )}
                      
                      {ativ.concluida && (
                        <div style={{marginTop:10,background:"#e8f6ee",border:"1.5px solid #27ae60",borderRadius:10,padding:"8px 12px"}}>
                          <p style={{fontSize:13,fontWeight:700,color:"#27ae60",margin:0,display:"flex",alignItems:"center",gap:6}}>
                            <Check size={16}/> Evolução Concluída! Orientação Executada.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={()=>setAtividades(p=>p.filter(a=>a.id!==ativ.id))} style={{position:"absolute",top:50,right:12,background:"#fce4e4",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  
                  <div style={{position:"absolute",bottom:12,right:12,width:28,height:28,borderRadius:"50%",background:prof.cor,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>
                    {idx+1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EXAMES */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          <Calendar size={20} color="#7c5cbf"/>
          <h2 style={{fontWeight:800,fontSize:14,margin:0}}>Exames e Consultas</h2>
        </div>
        <div style={{background:"#f8f0fc",borderRadius:18,padding:18,marginBottom:20,border:"1px solid #e8d8f4"}}>
          <p style={{fontWeight:700,fontSize:14,color:"#7c5cbf",marginBottom:14}}>+ Novo Exame/Consulta</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <CampoInput icon={<FileText size={19}/>} label="CONSULTA / EXAME">
              <input style={inputBare} placeholder="Ex: Consulta neuropediatra" value={novoExame.titulo} onChange={e=>setNovoExame(p=>({...p,titulo:e.target.value}))}/>
            </CampoInput>
            <CampoInput icon={<MapPin size={19}/>} label="LOCAL">
              <input style={inputBare} placeholder="Ex: HRAN, Asa Norte" value={novoExame.local} onChange={e=>setNovoExame(p=>({...p,local:e.target.value}))}/>
            </CampoInput>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <CampoInput icon={<Calendar size={19}/>} label="DATA">
                <input style={inputBare} type="date" value={novoExame.data} onChange={e=>setNovoExame(p=>({...p,data:e.target.value}))}/>
              </CampoInput>
              <CampoInput icon={<Clock size={19}/>} label="HORA">
                <input style={inputBare} type="time" value={novoExame.hora} onChange={e=>setNovoExame(p=>({...p,hora:e.target.value}))}/>
              </CampoInput>
            </div>
            
            <div>
              <label style={{fontSize:13,fontWeight:700,color:"#333",display:"block",marginBottom:6}}>⏰ ALARME DE PREPARAÇÃO</label>
              <p style={{fontSize:12,color:"#666",marginBottom:8}}>Quantas horas ANTES do exame você quer ser avisado para se arrumar?</p>
              <select value={novoExame.horasAntesPreparacao} onChange={e=>setNovoExame(p=>({...p,horasAntesPreparacao:+e.target.value}))} className="select-field">
                <option value="0.5">30 minutos antes</option>
                <option value="1">1 hora antes</option>
                <option value="1.5">1h30 antes</option>
                <option value="2">2 horas antes</option>
                <option value="3">3 horas antes</option>
                <option value="4">4 horas antes</option>
              </select>
            </div>
            
            <CampoInput icon={<AlertTriangle size={19}/>} label="NOTAS IMPORTANTES" dica="Observações como jejum, documentos, etc.">
              <input style={inputBare} placeholder="Ex: Jejum de 8h, levar laudo antigo" value={novoExame.notas} onChange={e=>setNovoExame(p=>({...p,notas:e.target.value}))}/>
            </CampoInput>
            <button onClick={addExame} style={{width:"100%",padding:"15px",fontSize:14,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#7c5cbf,#9b7dd4)",boxShadow:"0 5px 14px rgba(124,92,191,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Plus size={17}/> Adicionar Exame
            </button>
          </div>
        </div>
        {exames.length === 0 ? <p style={{color:"#1a1a1a",textAlign:"center",padding:20}}>Nenhum exame agendado.</p> :
          exames.map(e=>{
            const horasAntes = e.horasAntesPreparacao || 1;
            const txtHoras = horasAntes === 1 ? '1 hora' : horasAntes < 1 ? '30 minutos' : `${horasAntes} horas`;
            return (
              <div key={e.id} style={{padding:"12px 14px",background:"#faf8ff",borderRadius:12,marginBottom:8,border:"1.5px solid #e8d8f4"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,margin:0,color:"#222"}}>{e.titulo}</p>
                    <p style={{fontSize:14,color:"#1a1a1a",margin:"2px 0 0"}}>{e.data} às {e.hora} • {e.local}</p>
                    {e.notas && <p style={{fontSize:14,color:"#e07b39",margin:"4px 0 0",background:"#fff8f0",padding:"4px 8px",borderRadius:6}}>⚠️ {e.notas}</p>}
                    <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
                      <span style={{fontSize:11,background:"#f0eaf8",color:"#7c5cbf",padding:"3px 8px",borderRadius:6,fontWeight:600}}>
                        🔔 Lembrete: 24h antes
                      </span>
                      <span style={{fontSize:11,background:"#fff3e6",color:"#e07b39",padding:"3px 8px",borderRadius:6,fontWeight:600}}>
                        ⏰ Preparação: {txtHoras} antes
                      </span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,marginLeft:10}}>
                    <button onClick={()=>tocarAlarme(`📅 Teste de Alarme:\n${e.titulo}\nLocal: ${e.local}\nData: ${e.data} às ${e.hora}`)} style={{background:"#f0eaf8",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#7c5cbf"}}><Bell size={14}/></button>
                    <button onClick={()=>setExames(p=>p.filter(x=>x.id!==e.id))} style={{background:"#fce4e4",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// ─── REQUERIMENTOS ────────────────────────────────────────────────────────────
function TelaRequerimentos({mae,filho,filhos,filhoSelecionado,setFilhoSelecionado,reqSelecionado,setReqSelecionado,textoCopied,setTextoCopied,docSalvo,salvarRequerimento,gerarTexto}) {
  const cats = [...new Set(REQUERIMENTOS.map(r=>r.categoria))];
  const texto = (reqSelecionado && filho) ? gerarTexto(reqSelecionado,mae,filho) : "";

  function copiar() {
    navigator.clipboard.writeText(texto).then(()=>{
      setTextoCopied(true);
      setTimeout(()=>setTextoCopied(false),2200);
    });
  }

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>Gerador de Requerimentos</h1>
      <p style={{color:"#1a1a1a",fontSize:14,marginBottom:20}}>9 modelos com fundamentação jurídica real • Clique para gerar</p>

      {filhos.length > 1 && (
        <div style={{marginBottom:20}}>
          <label style={{fontSize:15,fontWeight:700,color:"#1a1a1a",display:"block",marginBottom:6}}>Filho(a) para o documento:</label>
          <select value={filhoSelecionado} onChange={e=>setFilhoSelecionado(+e.target.value)} className="select-field" style={{maxWidth:300}}>
            {filhos.map((f,i)=><option key={f.id} value={i}>{f.nome}</option>)}
          </select>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:20,alignItems:"start"}}>
        {/* Menu de seleção */}
        <div>
          {cats.map(cat=>(
            <div key={cat} style={{marginBottom:16}}>
              <p style={{fontSize:15,fontWeight:800,color:"#1a1a1a",letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>{cat}</p>
              {REQUERIMENTOS.filter(r=>r.categoria===cat).map(r=>(
                <button key={r.id} onClick={()=>setReqSelecionado(r)} style={{width:"100%",textAlign:"left",padding:"10px 14px",borderRadius:12,marginBottom:6,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${reqSelecionado?.id===r.id?"#3d9b7a":"#eee"}`,background:reqSelecionado?.id===r.id?"#e8f5f0":"white",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:15,fontWeight:800,color:"#3d9b7a",flexShrink:0}}>#{r.id}</span>
                    <span style={{fontSize:15,fontWeight:600,color:reqSelecionado?.id===r.id?"#3d9b7a":"#333",lineHeight:1.3}}>{r.titulo}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Visualizador */}
        <div className="card" style={{minHeight:400,display:"flex",flexDirection:"column"}}>
          {!reqSelecionado ? (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#1a1a1a"}}>
              <FileText size={48} strokeWidth={1}/>
              <p style={{fontSize:15,fontWeight:600}}>Selecione um modelo à esquerda</p>
            </div>
          ) : !filho ? (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#e07b39"}}>
              <AlertTriangle size={40}/>
              <p style={{fontSize:15,fontWeight:600}}>Nenhum filho selecionado</p>
            </div>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div>
                  <span className="tag" style={{marginBottom:6}}>{reqSelecionado.categoria}</span>
                  <h3 style={{fontWeight:800,fontSize:14,margin:"6px 0 2px",color:"#222"}}>{reqSelecionado.titulo}</h3>
                  <p style={{fontSize:14,color:"#7c5cbf",fontWeight:600}}>{reqSelecionado.fundamentacao}</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-outline" onClick={copiar} style={{padding:"8px 14px",fontSize:15,display:"flex",alignItems:"center",gap:6}}>
                    {textoCopied ? <><Check size={14} color="#3d9b7a"/>Copiado!</> : <><Copy size={14}/>Copiar</>}
                  </button>
                  <button className="btn-mint" onClick={salvarRequerimento} style={{padding:"8px 14px",fontSize:15,display:"flex",alignItems:"center",gap:6}}>
                    {docSalvo ? <><Check size={14}/>Salvo!</> : <><Save size={14}/>Salvar no Arquivo</>}
                  </button>
                </div>
              </div>
              <div style={{background:"#f9f9f9",borderRadius:12,padding:"16px 20px",flex:1,border:"1px solid #eee",fontFamily:"'Courier New',monospace",fontSize:15,lineHeight:1.8,whiteSpace:"pre-wrap",overflowY:"auto",maxHeight:520,color:"#333"}}>
                {texto}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DOCUMENTOS ───────────────────────────────────────────────────────────────
function TelaDocumentos({filho,filhoSelecionado,getDocFilho,setDocFilho,gaveta,setGaveta,uploadProgress,cameraInputRef,galeriaInputRef,handleUpload}) {
  const GAVETAS = ["Saúde","Escola","Documentos Pessoais","Histórico de Requerimentos"];
  const docs = getDocFilho(filhoSelecionado, gaveta);
  const uploading = Object.entries(uploadProgress);

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>Meu Arquivo Digital</h1>
      <p style={{color:"#1a1a1a",fontSize:14,marginBottom:20}}>{filho ? `Pasta de ${filho.nome}` : "Selecione um filho no dashboard"}</p>

      {/* Inputs hidden */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleUpload(e,"camera")}/>
      <input ref={galeriaInputRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={e=>handleUpload(e,"galeria")}/>

      {/* Ações de upload */}
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <button className="btn-mint" onClick={()=>cameraInputRef.current.click()} style={{display:"flex",alignItems:"center",gap:8}}>
          <Camera size={16}/> Tirar Foto do Laudo
        </button>
        <button className="btn-lav" onClick={()=>galeriaInputRef.current.click()} style={{display:"flex",alignItems:"center",gap:8}}>
          <Upload size={16}/> Anexar da Galeria/PDF
        </button>
      </div>

      {/* Progresso de upload */}
      {uploading.map(([key,prog])=>(
        <div key={key} style={{background:"#f8fcfa",borderRadius:12,padding:"14px 16px",marginBottom:12,border:"1px solid #e0ede6"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:15,fontWeight:700,color:"#3d9b7a"}}>A carregar ficheiro...</span>
            <span style={{fontSize:15,fontWeight:700,color:"#3d9b7a"}}>{Math.round(prog)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width:`${prog}%`}}/>
          </div>
        </div>
      ))}

      {/* Gavetas */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {GAVETAS.map(g=>(
          <button key={g} className={`gaveta-btn ${gaveta===g?"active":""}`} onClick={()=>setGaveta(g)}>
            {g==="Saúde"?"🏥":g==="Escola"?"📚":g==="Documentos Pessoais"?"🪪":"📋"} {g}
          </button>
        ))}
      </div>

      {/* Lista de documentos */}
      <div className="card">
        <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 16px",color:"#222"}}>
          {gaveta === "Saúde" ? "🏥" : gaveta === "Escola" ? "📚" : gaveta === "Documentos Pessoais" ? "🪪" : "📋"} {gaveta}
          <span style={{fontSize:15,fontWeight:600,color:"#1a1a1a",marginLeft:8}}>({docs.length} arquivo{docs.length!==1?"s":""})</span>
        </h3>
        {docs.length === 0 ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#1a1a1a"}}>
            <Folder size={48} strokeWidth={1}/>
            <p style={{marginTop:12,fontSize:15}}>Pasta vazia. Adicione arquivos acima.</p>
          </div>
        ) : docs.map(doc=>(
          <div key={doc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{width:40,height:40,background: doc.tipo?.includes("image")?"#fff3e6":"#f0eaf8",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <FileText size={20} color={doc.tipo?.includes("image")?"#e07b39":"#7c5cbf"}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:15,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.nome}</p>
              <p style={{fontSize:14,color:"#1a1a1a",margin:"2px 0 0"}}>{doc.data} • {doc.tamanho}</p>
              {doc.conteudo && <p style={{fontSize:15,color:"#7c5cbf",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.conteudo.substring(0,60)}...</p>}
            </div>
            <div style={{display:"flex",gap:6}}>
              {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" style={{background:"#e8f5f0",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#3d9b7a",display:"flex",alignItems:"center",textDecoration:"none"}}><Eye size={14}/></a>}
              {doc.url && <a href={doc.url} download={doc.nome} style={{background:"#f0eaf8",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#7c5cbf",display:"flex",alignItems:"center",textDecoration:"none"}}><Download size={14}/></a>}
              <button onClick={()=>setDocFilho(filhoSelecionado,gaveta,docs.filter(d=>d.id!==doc.id))} style={{background:"#fce4e4",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CUIDADOR ─────────────────────────────────────────────────────────────────
function TelaCuidador({filho,filhoSelecionado,cuidador,setCuidador,mae,gerarMsg,enviarWhatsApp,msgCopiada,setMsgCopiada}) {
  const c = cuidador[filhoSelecionado] || {};
  function update(campo, val) { setCuidador(prev=>({...prev, [filhoSelecionado]:{...prev[filhoSelecionado],[campo]:val}})); }

  function copiarMsg() {
    navigator.clipboard.writeText(gerarMsg()).then(()=>{
      setMsgCopiada(true);
      setTimeout(()=>setMsgCopiada(false),2200);
    });
  }

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>Módulo Cuidador</h1>
      <p style={{color:"#1a1a1a",fontSize:14,marginBottom:24}}>Envie as instruções do dia para quem cuida de {filho?.nome || "sua criança"}</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20,alignItems:"start"}}>
        {/* Formulário */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#3d9b7a",display:"flex",alignItems:"center",gap:8}}><Pill size={18}/>Medicamentos do Dia</h3>
            <CampoTextarea icon={<Clock size={15}/>} label="HORÁRIOS E DOSES" cor="#3d9b7a" rows={5} value={c.remedios||""} onChange={e=>update("remedios",e.target.value)} placeholder={"Ex:\n07h - Risperidona 1mg (2 comp)\n12h - Ômega 3 (1 cápsula)\n18h - Melatonina 3mg (1 comp)"}/>
          </div>
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#7c5cbf",display:"flex",alignItems:"center",gap:8}}>🥗 Restrições Alimentares</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <CampoTextarea icon={<Check size={15}/>} label="✅ PODE COMER" cor="#3d9b7a" rows={3} value={c.podeAlimentar||""} onChange={e=>update("podeAlimentar",e.target.value)} placeholder="Ex: Frango, arroz, feijão, frutas..."/>
              <CampoTextarea icon={<X size={15}/>} label="❌ NÃO PODE COMER" cor="#c0392b" rows={3} value={c.naoPodeAlimentar||""} onChange={e=>update("naoPodeAlimentar",e.target.value)} placeholder="Ex: Glúten, leite, corantes..."/>
            </div>
          </div>
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#e07b39",display:"flex",alignItems:"center",gap:8}}><Phone size={18}/>Contatos de Emergência</h3>
            <CampoTextarea icon={<Phone size={15}/>} label="TELEFONES IMPORTANTES" cor="#e07b39" rows={4} value={c.telefones||""} onChange={e=>update("telefones",e.target.value)} placeholder={"Ex:\n📱 Mãe: (61) 9 9999-0001\n👨 Pai: (61) 9 9999-0002\n🏥 SAMU: 192\n👩‍⚕️ Dra. Ana: (61) 3333-4444"}/>
          </div>
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#1a1a1a",display:"flex",alignItems:"center",gap:8}}>📌 Observações Especiais</h3>
            <CampoTextarea icon={<Star size={15}/>} label="NOTAS PARA O CUIDADOR" cor="#7c5cbf" rows={3} value={c.obs||""} onChange={e=>update("obs",e.target.value)} placeholder="Ex: Não gosta de barulho alto. Usa fone de ouvido quando agitado."/>
          </div>
        </div>

        {/* Preview e envio */}
        <div>
          <div className="card" style={{marginBottom:16}}>
            <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 14px",color:"#222",display:"flex",alignItems:"center",gap:8}}><Eye size={18}/>Preview da Mensagem</h3>
            <div style={{background:"#f0f8f4",borderRadius:12,padding:16,border:"1px solid #c8e6d8",fontFamily:"'Courier New',monospace",fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:360,overflowY:"auto",color:"#333"}}>
              {gerarMsg()}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button className="btn-mint" onClick={enviarWhatsApp} style={{width:"100%",padding:"14px",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Send size={18}/> Enviar via WhatsApp
            </button>
            <button className="btn-outline" onClick={copiarMsg} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {msgCopiada ? <><Check size={16} color="#3d9b7a"/>Copiado!</> : <><Copy size={16}/>Copiar Mensagem</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DIREITOS ─────────────────────────────────────────────────────────────────
function TelaDireitos({direitoAberto,setDireitoAberto,checklistFeito,setChecklistFeito,setTela}) {
  function toggleCheck(dirId, idx) {
    const key = `${dirId}_${idx}`;
    setChecklistFeito(prev=>({...prev,[key]:!prev[key]}));
  }
  const TIPOS = ["APAE","CAPSi","Na Hora","CRAS","Hospital"];
  const [filtroRede, setFiltroRede] = useState("");

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>Guia de Direitos & Rede de Apoio</h1>
      <p style={{color:"#1a1a1a",fontSize:14,marginBottom:24}}>Focado no Distrito Federal • Checklists interativos passo a passo</p>

      {/* Cards de direitos */}
      <div style={{marginBottom:32}}>
        <h2 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:16}}>📋 Seus Direitos — Passo a Passo</h2>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {DIREITOS_GUIA.map(d=>{
            const done = d.checklist.filter((_,i)=>checklistFeito[`${d.id}_${i}`]).length;
            const open = direitoAberto === d.id;
            return (
              <div key={d.id} className="card" style={{padding:0,overflow:"hidden"}}>
                <button onClick={()=>setDireitoAberto(open?null:d.id)} style={{width:"100%",background:"none",border:"none",padding:"16px 20px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:12}}>{d.icon}</span>
                      <div>
                        <p style={{fontWeight:700,fontSize:15,margin:0,color:"#222"}}>{d.titulo}</p>
                        <p style={{fontSize:14,color:"#1a1a1a",margin:"2px 0 0"}}>{done}/{d.checklist.length} etapas concluídas</p>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:60,height:6,background:"#eee",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(done/d.checklist.length)*100}%`,background:"linear-gradient(90deg,#3d9b7a,#7c5cbf)",borderRadius:4}}/>
                      </div>
                      {open ? <ChevronUp size={18} color="#888"/> : <ChevronDown size={18} color="#888"/>}
                    </div>
                  </div>
                </button>
                {open && (
                  <div style={{borderTop:"1px solid #f0f0f0",padding:"16px 20px"}}>
                    <p style={{fontSize:15,fontWeight:700,color:"#1a1a1a",marginBottom:12}}>Passo a passo:</p>
                    {d.checklist.map((passo,i)=>{
                      const checked = !!checklistFeito[`${d.id}_${i}`];
                      return (
                        <div key={i} className="checklist-item" onClick={()=>toggleCheck(d.id,i)}>
                          <div className={`check-box ${checked?"checked":""}`}>
                            {checked && <Check size={12} color="white" strokeWidth={3}/>}
                          </div>
                          <span style={{fontSize:14,color:checked?"#888":"#333",textDecoration:checked?"line-through":"none",lineHeight:1.5}}>{passo}</span>
                        </div>
                      );
                    })}
                    <div style={{background:"#fff8e6",border:"1.5px solid #ffd87a",borderRadius:12,padding:"12px 16px",marginTop:16}}>
                      <p style={{fontWeight:800,fontSize:15,color:"#b8860b",margin:"0 0 4px"}}>⚠️ Em caso de Negativa ou Recusa:</p>
                      <p style={{fontSize:15,color:"#1a1a1a",margin:0,lineHeight:1.6}}>{d.negativa}</p>
                    </div>
                    <button className="btn-outline" onClick={()=>setTela("requerimentos")} style={{marginTop:14,fontSize:15,display:"flex",alignItems:"center",gap:6}}>
                      <FileText size={14}/> Abrir Gerador de Requerimentos
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rede de Apoio */}
      <div>
        <h2 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:12}}>🗺️ Rede de Apoio no DF</h2>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>setFiltroRede("")} style={{padding:"6px 14px",borderRadius:20,fontSize:14,fontWeight:700,cursor:"pointer",border:"1.5px solid",fontFamily:"inherit",borderColor:filtroRede===""?"#3d9b7a":"#ddd",background:filtroRede===""?"#e8f5f0":"white",color:filtroRede===""?"#3d9b7a":"#888"}}>Todos</button>
          {TIPOS.map(t=>(
            <button key={t} onClick={()=>setFiltroRede(t===filtroRede?"":t)} style={{padding:"6px 14px",borderRadius:20,fontSize:14,fontWeight:700,cursor:"pointer",border:"1.5px solid",fontFamily:"inherit",borderColor:filtroRede===t?"#7c5cbf":"#ddd",background:filtroRede===t?"#f0eaf8":"white",color:filtroRede===t?"#7c5cbf":"#888"}}>{t}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {REDE_APOIO.filter(r=>!filtroRede||r.tipo===filtroRede).map(r=>{
            const colors = {APAE:{bg:"#f0eaf8",border:"#c9b8e8",tag:"#7c5cbf"},CAPSi:{bg:"#e8f5f0",border:"#b8e0d2",tag:"#3d9b7a"},"Na Hora":{bg:"#fff3e6",border:"#ffd4a8",tag:"#e07b39"},CRAS:{bg:"#e6f0fb",border:"#b5d4f4",tag:"#185fa5"},Hospital:{bg:"#fce4e4",border:"#f7c1c1",tag:"#c0392b"}};
            const col = colors[r.tipo] || {bg:"#f5f5f5",border:"#ddd",tag:"#888"};
            return (
              <div key={r.nome} style={{background:col.bg,border:`1.5px solid ${col.border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:15,fontWeight:800,color:col.tag,background:"white",borderRadius:8,padding:"2px 8px",border:`1px solid ${col.border}`}}>{r.tipo}</span>
                  <span style={{fontSize:15,color:"#1a1a1a"}}>{r.regiao}</span>
                </div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:"#222"}}>{r.nome}</p>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <MapPin size={11} color="#aaa"/>
                  <p style={{fontSize:14,color:"#1a1a1a",margin:0}}>{r.endereco}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Phone size={11} color="#aaa"/>
                  <p style={{fontSize:14,fontWeight:700,color:col.tag,margin:0}}>{r.tel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── GERENCIAR FILHOS ─────────────────────────────────────────────────────────
function TelaGerenciarFilhos({filhos, setFilhos, onSalvarPerfil, mae, filhoSelecionado, setFilhoSelecionado}) {
  const [novoFilho, setNovoFilho] = useState({nome:"", idade:"", diagnosticos:[]});
  
  function toggleDiag(d) {
    setNovoFilho(prev => ({
      ...prev,
      diagnosticos: prev.diagnosticos.includes(d)
        ? prev.diagnosticos.filter(x => x !== d)
        : [...prev.diagnosticos, d]
    }));
  }
  
  function adicionarFilho() {
    if (!novoFilho.nome.trim() || !novoFilho.idade) return;
    const novosFilhos = [...filhos, {...novoFilho, id:Date.now()}];
    setFilhos(novosFilhos);
    onSalvarPerfil({mae, filhos:novosFilhos});
    setNovoFilho({nome:"", idade:"", diagnosticos:[]});
  }
  
  function removerFilho(idx) {
    const novosFilhos = filhos.filter((_,i)=>i!==idx);
    setFilhos(novosFilhos);
    onSalvarPerfil({mae, filhos:novosFilhos});
    if (filhoSelecionado >= novosFilhos.length) {
      setFilhoSelecionado(Math.max(0, novosFilhos.length - 1));
    }
  }
  
  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>Gerenciar Filhos</h1>
      <p style={{color:"#1a1a1a",fontSize:15,marginBottom:24}}>Adicione ou remova filhos do seu cadastro</p>
      
      {/* Filhos cadastrados */}
      {filhos.length > 0 && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#222"}}>👶 Filhos Cadastrados ({filhos.length})</h3>
          {filhos.map((f,i)=>(
            <div key={f.id} style={{background:"#fff", border:"1.5px solid #d8efe6", borderRadius:16, padding:"14px 16px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <div style={{width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#e8f5f0,#f0eaf8)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <Baby size={20} color="#3d9b7a"/>
                </div>
                <div>
                  <p style={{fontWeight:700, color:"#2f7d62", margin:0, fontSize:15}}>{f.nome}, {f.idade} anos</p>
                  <p style={{fontSize:13, color:"#1a1a1a", margin:0}}>{f.diagnosticos.join(", ") || "Sem diagnóstico"}</p>
                </div>
              </div>
              <button onClick={()=>removerFilho(i)} disabled={filhos.length===1} style={{background:filhos.length===1?"#f5f5f5":"#fef0f0", border:"none", borderRadius:10, padding:"8px", cursor:filhos.length===1?"not-allowed":"pointer", color:filhos.length===1?"#ccc":"#c0392b", display:"flex", opacity:filhos.length===1?0.5:1}}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
          {filhos.length === 1 && (
            <p style={{fontSize:13,color:"#e07b39",background:"#fff8f0",padding:"8px 12px",borderRadius:8,margin:"8px 0 0"}}>
              ⚠️ Você precisa ter pelo menos 1 filho cadastrado
            </p>
          )}
        </div>
      )}
      
      {/* Formulário adicionar filho */}
      <div className="card">
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#7c5cbf",display:"flex",alignItems:"center",gap:8}}>
          <Plus size={18}/> Adicionar Novo Filho
        </h3>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <CampoInput icon={<Baby size={19}/>} label="NOME DA CRIANÇA">
            <input style={inputBare} placeholder="Nome do filho(a)" value={novoFilho.nome} onChange={e=>setNovoFilho(p=>({...p,nome:e.target.value}))}/>
          </CampoInput>
          <CampoInput icon={<Clock size={19}/>} label="IDADE">
            <input style={inputBare} type="number" placeholder="Idade em anos" value={novoFilho.idade} onChange={e=>setNovoFilho(p=>({...p,idade:e.target.value}))} min="0" max="25"/>
          </CampoInput>
          <div>
            <p style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:6,marginLeft:4}}>DIAGNÓSTICO(S)</p>
            <p style={{fontSize:12,color:"#666",marginBottom:10,marginLeft:4}}>Selecione um ou mais:</p>
            <div style={{maxHeight:240,overflowY:"auto",border:"1.5px solid #e5e7eb",borderRadius:14,padding:10,background:"#fafbfa"}}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {DIAGNOSTICOS.map(d=>{
                  const on = novoFilho.diagnosticos.includes(d);
                  return (
                    <button key={d} onClick={()=>toggleDiag(d)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,fontSize:14,fontWeight:on?700:600,cursor:"pointer",border:"none",fontFamily:"inherit",transition:"all .15s",background:on?"#e8f5f0":"white",color:on?"#2f7d62":"#333",textAlign:"left",width:"100%"}}>
                      <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?"#3d9b7a":"#d1d5db"}`,background:on?"#3d9b7a":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                        {on && <Check size={15} color="white" strokeWidth={3}/>}
                      </div>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button onClick={adicionarFilho} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#3d9b7a,#5bb89a)",boxShadow:"0 6px 18px rgba(61,155,122,0.32)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Plus size={17}/> Adicionar Filho
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIÁRIO DE COMPORTAMENTO ──────────────────────────────────────────────────
function TelaDiario({registros, setRegistros, novoRegistro, setNovoRegistro, filho}) {
  const TIPOS = [
    {id:"crise_sensorial", nome:"😖 Crise Sensorial", cor:"#e07b39"},
    {id:"agressividade", nome:"😠 Agressividade", cor:"#c0392b"},
    {id:"euforia", nome:"😄 Euforia", cor:"#f39c12"},
    {id:"estereotipia", nome:"🔄 Estereotipia", cor:"#3498db"},
    {id:"ansiedade", nome:"😰 Ansiedade", cor:"#9b59b6"},
    {id:"positivo", nome:"✨ Momento Positivo", cor:"#27ae60"},
    {id:"outro", nome:"📝 Outro", cor:"#7f8c8d"}
  ];
  
  const GATILHOS = [
    "Barulho alto", "Mudança de rotina", "Ambiente lotado", 
    "Transição de atividade", "Fome/Sede", "Cansaço/Sono",
    "Frustração", "Dor física", "Ansiedade", "Outro"
  ];
  
  function adicionarRegistro() {
    if (!novoRegistro.tipo || !novoRegistro.data) return;
    setRegistros(prev => [...prev, {...novoRegistro, id:Date.now(), filho:filho?.nome}]);
    setNovoRegistro({ tipo:"", data:"", hora:"", duracao:"", gatilho:"", oQueAjudou:"", notas:"" });
  }
  
  // Estatísticas
  const registrosFilho = registros.filter(r => r.filho === filho?.nome);
  const ultimosMes = registrosFilho.filter(r => {
    const diff = Date.now() - new Date(r.data).getTime();
    return diff < 30 * 24 * 60 * 60 * 1000;
  });
  
  const frequenciaPorTipo = TIPOS.map(t => ({
    ...t,
    count: ultimosMes.filter(r => r.tipo === t.id).length
  })).filter(t => t.count > 0);
  
  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>📊 Diário de Comportamento</h1>
      <p style={{color:"#1a1a1a",fontSize:15,marginBottom:24}}>Registre eventos e identifique padrões de {filho?.nome}</p>
      
      {/* Estatísticas */}
      {ultimosMes.length > 0 && (
        <div className="card" style={{marginBottom:24, background:"linear-gradient(135deg, #f0eaf8, #e8f5f0)"}}>
          <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 12px",color:"#7c5cbf",display:"flex",alignItems:"center",gap:8}}>
            <TrendingUp size={18}/> Últimos 30 dias
          </h3>
          <p style={{fontSize:13,color:"#666",marginBottom:12}}>Total de registros: <strong>{ultimosMes.length}</strong></p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {frequenciaPorTipo.map(t => (
              <div key={t.id} style={{background:"white",padding:"6px 12px",borderRadius:8,border:`2px solid ${t.cor}`,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>{t.nome.split(" ")[0]}</span>
                <span style={{fontWeight:800,color:t.cor,fontSize:14}}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formulário */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#3d9b7a",display:"flex",alignItems:"center",gap:8}}>
          <Plus size={18}/> Novo Registro
        </h3>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:13,fontWeight:700,color:"#333",display:"block",marginBottom:6}}>TIPO DE EVENTO</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:8}}>
              {TIPOS.map(t => (
                <button key={t.id} onClick={()=>setNovoRegistro(p=>({...p,tipo:t.id}))} style={{padding:"10px",borderRadius:10,border:`2px solid ${novoRegistro.tipo===t.id?t.cor:"#e5e7eb"}`,background:novoRegistro.tipo===t.id?t.cor:"white",color:novoRegistro.tipo===t.id?"white":"#333",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s",fontFamily:"inherit"}}>
                  {t.nome}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <CampoInput icon={<Calendar size={19}/>} label="DATA">
              <input style={inputBare} type="date" value={novoRegistro.data} onChange={e=>setNovoRegistro(p=>({...p,data:e.target.value}))}/>
            </CampoInput>
            <CampoInput icon={<Clock size={19}/>} label="HORA">
              <input style={inputBare} type="time" value={novoRegistro.hora} onChange={e=>setNovoRegistro(p=>({...p,hora:e.target.value}))}/>
            </CampoInput>
            <CampoInput icon={<Clock size={19}/>} label="DURAÇÃO (MIN)">
              <input style={inputBare} type="number" placeholder="Ex: 15" value={novoRegistro.duracao} onChange={e=>setNovoRegistro(p=>({...p,duracao:e.target.value}))} min="0"/>
            </CampoInput>
          </div>
          
          <CampoInput icon={<Zap size={19}/>} label="GATILHO / SITUAÇÃO">
            <select style={{...inputBare,cursor:"pointer"}} value={novoRegistro.gatilho} onChange={e=>setNovoRegistro(p=>({...p,gatilho:e.target.value}))}>
              <option value="">Selecione...</option>
              {GATILHOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </CampoInput>
          
          <CampoInput icon={<Check size={19}/>} label="O QUE AJUDOU">
            <input style={inputBare} placeholder="Ex: Abraço firme, música calma, espaço silencioso" value={novoRegistro.oQueAjudou} onChange={e=>setNovoRegistro(p=>({...p,oQueAjudou:e.target.value}))}/>
          </CampoInput>
          
          <CampoInput icon={<FileText size={19}/>} label="OBSERVAÇÕES">
            <textarea style={{...inputBare,minHeight:60,resize:"vertical"}} placeholder="Detalhes adicionais..." value={novoRegistro.notas} onChange={e=>setNovoRegistro(p=>({...p,notas:e.target.value}))}/>
          </CampoInput>
          
          <button onClick={adicionarRegistro} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#7c5cbf,#9b7dd4)",boxShadow:"0 5px 14px rgba(124,92,191,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Plus size={17}/> Adicionar Registro
          </button>
        </div>
      </div>
      
      {/* Lista de registros */}
      <div className="card">
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#222"}}>📋 Histórico ({registrosFilho.length})</h3>
        {registrosFilho.length === 0 ? (
          <p style={{color:"#666",textAlign:"center",padding:20}}>Nenhum registro ainda</p>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[...registrosFilho].reverse().map(r => {
              const tipo = TIPOS.find(t => t.id === r.tipo);
              return (
                <div key={r.id} style={{background:"#fafbfa",border:`2px solid ${tipo?.cor}`,borderRadius:14,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <span style={{fontSize:15,fontWeight:800,color:tipo?.cor}}>{tipo?.nome}</span>
                      <p style={{fontSize:13,color:"#666",margin:"2px 0 0"}}>{r.data} {r.hora && `às ${r.hora}`}</p>
                    </div>
                    <button onClick={()=>setRegistros(prev=>prev.filter(x=>x.id!==r.id))} style={{background:"#fef0f0",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  {r.duracao && <p style={{fontSize:13,color:"#333",margin:"4px 0"}}><strong>Duração:</strong> {r.duracao} min</p>}
                  {r.gatilho && <p style={{fontSize:13,color:"#333",margin:"4px 0"}}><strong>Gatilho:</strong> {r.gatilho}</p>}
                  {r.oQueAjudou && <p style={{fontSize:13,color:"#27ae60",margin:"4px 0",background:"#e8f6ee",padding:"6px 8px",borderRadius:6}}><strong>✅ O que ajudou:</strong> {r.oQueAjudou}</p>}
                  {r.notas && <p style={{fontSize:13,color:"#666",margin:"4px 0",fontStyle:"italic"}}>{r.notas}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONTROLE FINANCEIRO ──────────────────────────────────────────────────────
function TelaFinanceiro({gastos, setGastos, novoGasto, setNovoGasto, orcamento, setOrcamento, filho}) {
  const CATEGORIAS = [
    {id:"medicamentos", nome:"💊 Medicamentos", cor:"#3498db"},
    {id:"terapias", nome:"🧠 Terapias", cor:"#9b59b6"},
    {id:"transporte", nome:"🚗 Transporte", cor:"#e67e22"},
    {id:"alimentacao", nome:"🍽️ Alimentação", cor:"#27ae60"},
    {id:"outros", nome:"📦 Outros", cor:"#95a5a6"}
  ];
  
  const [editandoOrcamento, setEditandoOrcamento] = useState(false);
  
  function adicionarGasto() {
    if (!novoGasto.categoria || !novoGasto.valor || !novoGasto.data) return;
    setGastos(prev => [...prev, {...novoGasto, id:Date.now(), filho:filho?.nome}]);
    setNovoGasto({ categoria:"", valor:"", data:"", descricao:"" });
  }
  
  // Estatísticas
  const gastosFilho = gastos.filter(g => g.filho === filho?.nome);
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const gastosMesAtual = gastosFilho.filter(g => {
    const d = new Date(g.data);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });
  
  const totalPorCategoria = CATEGORIAS.map(c => ({
    ...c,
    total: gastosMesAtual.filter(g => g.categoria === c.id).reduce((sum, g) => sum + parseFloat(g.valor || 0), 0)
  }));
  
  const totalGeral = totalPorCategoria.reduce((sum, c) => sum + c.total, 0);
  const totalOrcamento = Object.values(orcamento).reduce((sum, v) => sum + parseFloat(v || 0), 0);
  
  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>💰 Controle Financeiro</h1>
      <p style={{color:"#1a1a1a",fontSize:15,marginBottom:24}}>Acompanhe gastos com {filho?.nome}</p>
      
      {/* Resumo Mensal */}
      <div className="card" style={{marginBottom:24, background:"linear-gradient(135deg, #e8f5f0, #f0eaf8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{fontWeight:800,fontSize:15,margin:0,color:"#3d9b7a",display:"flex",alignItems:"center",gap:8}}>
            <PieChart size={18}/> Mês Atual
          </h3>
          <button onClick={()=>setEditandoOrcamento(!editandoOrcamento)} style={{background:"white",border:"1.5px solid #3d9b7a",color:"#3d9b7a",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {editandoOrcamento ? "Salvar" : "Editar Orçamento"}
          </button>
        </div>
        
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:"#666"}}>Total Gasto:</span>
            <span style={{fontSize:18,fontWeight:800,color:totalGeral > totalOrcamento ? "#c0392b" : "#27ae60"}}>
              R$ {totalGeral.toFixed(2)}
            </span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:"#666"}}>Orçamento:</span>
            <span style={{fontSize:15,fontWeight:700,color:"#666"}}>R$ {totalOrcamento.toFixed(2)}</span>
          </div>
        </div>
        
        {totalOrcamento > 0 && (
          <div>
            <div style={{width:"100%",height:10,background:"#e5e7eb",borderRadius:10,overflow:"hidden",marginBottom:12}}>
              <div style={{width:`${Math.min((totalGeral/totalOrcamento)*100, 100)}%`,height:"100%",background:totalGeral > totalOrcamento ? "linear-gradient(90deg,#c0392b,#e74c3c)" : "linear-gradient(90deg,#27ae60,#2ecc71)",transition:"width .3s"}}/>
            </div>
            <p style={{fontSize:12,textAlign:"center",color:totalGeral > totalOrcamento ? "#c0392b" : "#666"}}>
              {totalGeral > totalOrcamento ? `⚠️ Ultrapassou em R$ ${(totalGeral - totalOrcamento).toFixed(2)}` : `Restante: R$ ${(totalOrcamento - totalGeral).toFixed(2)}`}
            </p>
          </div>
        )}
        
        {/* Orçamento por categoria */}
        {editandoOrcamento && (
          <div style={{marginTop:16,padding:"12px",background:"#fff8f0",borderRadius:10,border:"1.5px dashed #e07b39"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#e07b39",marginBottom:12}}>DEFINIR ORÇAMENTO MENSAL:</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:10}}>
              {CATEGORIAS.map(c => (
                <div key={c.id} style={{display:"flex",flexDirection:"column",gap:4}}>
                  <label style={{fontSize:11,fontWeight:700,color:"#666"}}>{c.nome}</label>
                  <input type="number" placeholder="0.00" value={orcamento[c.id]||""} onChange={e=>setOrcamento(p=>({...p,[c.id]:e.target.value}))} style={{padding:"6px 8px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,fontWeight:600}}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Gráfico por Categoria */}
      {totalPorCategoria.some(c => c.total > 0) && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#222"}}>📊 Por Categoria</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {totalPorCategoria.filter(c => c.total > 0).map(c => {
              const percent = totalGeral > 0 ? (c.total / totalGeral) * 100 : 0;
              const orcCat = parseFloat(orcamento[c.id] || 0);
              const ultrapassou = orcCat > 0 && c.total > orcCat;
              return (
                <div key={c.id}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:700}}>{c.nome}</span>
                    <span style={{fontSize:13,fontWeight:800,color:ultrapassou?"#c0392b":c.cor}}>R$ {c.total.toFixed(2)}</span>
                  </div>
                  <div style={{width:"100%",height:8,background:"#e5e7eb",borderRadius:8,overflow:"hidden"}}>
                    <div style={{width:`${percent}%`,height:"100%",background:ultrapassou?"#c0392b":c.cor,transition:"width .3s"}}/>
                  </div>
                  {orcCat > 0 && (
                    <p style={{fontSize:11,color:ultrapassou?"#c0392b":"#666",marginTop:2}}>
                      {ultrapassou ? `⚠️ Ultrapassou R$ ${(c.total - orcCat).toFixed(2)}` : `Restante: R$ ${(orcCat - c.total).toFixed(2)}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Formulário */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#3d9b7a",display:"flex",alignItems:"center",gap:8}}>
          <Plus size={18}/> Novo Gasto
        </h3>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:13,fontWeight:700,color:"#333",display:"block",marginBottom:6}}>CATEGORIA</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",gap:8}}>
              {CATEGORIAS.map(c => (
                <button key={c.id} onClick={()=>setNovoGasto(p=>({...p,categoria:c.id}))} style={{padding:"10px",borderRadius:10,border:`2px solid ${novoGasto.categoria===c.id?c.cor:"#e5e7eb"}`,background:novoGasto.categoria===c.id?c.cor:"white",color:novoGasto.categoria===c.id?"white":"#333",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s",fontFamily:"inherit"}}>
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <CampoInput icon={<DollarSign size={19}/>} label="VALOR (R$)">
              <input style={inputBare} type="number" step="0.01" placeholder="0.00" value={novoGasto.valor} onChange={e=>setNovoGasto(p=>({...p,valor:e.target.value}))} min="0"/>
            </CampoInput>
            <CampoInput icon={<Calendar size={19}/>} label="DATA">
              <input style={inputBare} type="date" value={novoGasto.data} onChange={e=>setNovoGasto(p=>({...p,data:e.target.value}))}/>
            </CampoInput>
          </div>
          
          <CampoInput icon={<FileText size={19}/>} label="DESCRIÇÃO">
            <input style={inputBare} placeholder="Ex: Consulta com neurologista" value={novoGasto.descricao} onChange={e=>setNovoGasto(p=>({...p,descricao:e.target.value}))}/>
          </CampoInput>
          
          <button onClick={adicionarGasto} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#27ae60,#2ecc71)",boxShadow:"0 5px 14px rgba(39,174,96,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Plus size={17}/> Adicionar Gasto
          </button>
        </div>
      </div>
      
      {/* Histórico */}
      <div className="card">
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#222"}}>📋 Histórico de Gastos ({gastosFilho.length})</h3>
        {gastosFilho.length === 0 ? (
          <p style={{color:"#666",textAlign:"center",padding:20}}>Nenhum gasto registrado</p>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...gastosFilho].reverse().map(g => {
              const cat = CATEGORIAS.find(c => c.id === g.categoria);
              return (
                <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafbfa",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontSize:15}}>{cat?.nome.split(" ")[0]}</span>
                      <span style={{fontSize:14,fontWeight:800,color:cat?.cor}}>R$ {parseFloat(g.valor).toFixed(2)}</span>
                    </div>
                    <p style={{fontSize:12,color:"#666",margin:0}}>{g.data} • {g.descricao}</p>
                  </div>
                  <button onClick={()=>setGastos(prev=>prev.filter(x=>x.id!==g.id))} style={{background:"#fef0f0",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REDE DE APOIO / CONTATOS ─────────────────────────────────────────────────
function TelaContatos({contatos, setContatos, novoContato, setNovoContato}) {
  const CATEGORIAS = [
    {id:"medicos", nome:"🏥 Médicos", cor:"#3498db"},
    {id:"terapeutas", nome:"🧠 Terapeutas", cor:"#9b59b6"},
    {id:"familia", nome:"👨‍👩‍👧 Família", cor:"#27ae60"},
    {id:"emergencia", nome:"🚑 Emergência", cor:"#c0392b"},
    {id:"escola", nome:"🏫 Escola/Creche", cor:"#e67e22"}
  ];
  
  async function adicionarContato() {
    if (!novoContato.nome || !novoContato.categoria || !novoContato.telefone) return;
    const novoArray = [...contatos, {...novoContato, id:Date.now()}];
    setContatos(novoArray);
    setNovoContato({ nome:"", categoria:"", telefone:"", especialidade:"", notas:"" });
  }
  const contatosPorCategoria = CATEGORIAS.map(c => ({
    ...c,
    contatos: contatos.filter(ct => ct.categoria === c.id)
  })).filter(c => c.contatos.length > 0);
  
  function ligar(telefone) {
    window.location.href = `tel:${telefone}`;
  }
  
  function whatsapp(telefone) {
    const tel = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${tel}`, '_blank');
  }
  
  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:14,color:"#222",marginBottom:4}}>📞 Rede de Apoio</h1>
      <p style={{color:"#1a1a1a",fontSize:15,marginBottom:24}}>Seus contatos de confiança organizados</p>
      
      {/* Contatos por Categoria */}
      {contatosPorCategoria.map(cat => (
        <div key={cat.id} className="card" style={{marginBottom:20}}>
          <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 12px",color:cat.cor,display:"flex",alignItems:"center",gap:8}}>
            {cat.nome} ({cat.contatos.length})
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {cat.contatos.map(c => (
              <div key={c.id} style={{background:"#fafbfa",border:`2px solid ${cat.cor}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:15,fontWeight:800,color:"#222",margin:"0 0 4px"}}>{c.nome}</p>
                    {c.especialidade && <p style={{fontSize:13,color:"#666",margin:"0 0 4px"}}>{c.especialidade}</p>}
                    <p style={{fontSize:14,fontWeight:700,color:cat.cor,margin:0}}>{c.telefone}</p>
                    {c.notas && <p style={{fontSize:12,color:"#666",margin:"4px 0 0",fontStyle:"italic"}}>{c.notas}</p>}
                  </div>
                  <button onClick={()=>setContatos(prev=>prev.filter(x=>x.id!==c.id))} style={{background:"#fef0f0",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#c0392b"}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>ligar(c.telefone)} style={{flex:1,background:cat.cor,color:"white",border:"none",borderRadius:10,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit"}}>
                    <Phone size={14}/> Ligar
                  </button>
                  <button onClick={()=>whatsapp(c.telefone)} style={{flex:1,background:"#25d366",color:"white",border:"none",borderRadius:10,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit"}}>
                    <MessageCircle size={14}/> WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Formulário */}
      <div className="card">
        <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px",color:"#3d9b7a",display:"flex",alignItems:"center",gap:8}}>
          <Plus size={18}/> Novo Contato
        </h3>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:13,fontWeight:700,color:"#333",display:"block",marginBottom:6}}>CATEGORIA</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",gap:8}}>
              {CATEGORIAS.map(c => (
                <button key={c.id} onClick={()=>setNovoContato(p=>({...p,categoria:c.id}))} style={{padding:"10px",borderRadius:10,border:`2px solid ${novoContato.categoria===c.id?c.cor:"#e5e7eb"}`,background:novoContato.categoria===c.id?c.cor:"white",color:novoContato.categoria===c.id?"white":"#333",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s",fontFamily:"inherit"}}>
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
          
          <CampoInput icon={<User size={19}/>} label="NOME COMPLETO">
            <input style={inputBare} placeholder="Ex: Dr. João Silva" value={novoContato.nome} onChange={e=>setNovoContato(p=>({...p,nome:e.target.value}))}/>
          </CampoInput>
          
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <CampoInput icon={<Phone size={19}/>} label="TELEFONE">
              <input style={inputBare} type="tel" placeholder="(61) 9 9999-9999" value={novoContato.telefone} onChange={e=>setNovoContato(p=>({...p,telefone:e.target.value}))}/>
            </CampoInput>
            <CampoInput icon={<Star size={19}/>} label="ESPECIALIDADE">
              <input style={inputBare} placeholder="Ex: Neuropediatra" value={novoContato.especialidade} onChange={e=>setNovoContato(p=>({...p,especialidade:e.target.value}))}/>
            </CampoInput>
          </div>
          
          <CampoInput icon={<FileText size={19}/>} label="OBSERVAÇÕES">
            <input style={inputBare} placeholder="Ex: Atende terças 14h-18h" value={novoContato.notas} onChange={e=>setNovoContato(p=>({...p,notas:e.target.value}))}/>
          </CampoInput>
          
          <button onClick={adicionarContato} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:800,letterSpacing:0.4,textTransform:"uppercase",color:"white",border:"none",borderRadius:16,cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#3498db,#5dade2)",boxShadow:"0 5px 14px rgba(52,152,219,0.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Plus size={17}/> Adicionar Contato
          </button>
        </div>
      </div>
    </div>
  );
}
