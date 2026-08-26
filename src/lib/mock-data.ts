import type {
  CalendarEvent,
  ChatMessage,
  InboxItem,
  MemoryItem,
  Note,
  Project,
  Reminder,
  Task,
} from "./types";

export const USER = {
  name: "João",
  fullName: "João Pedral",
  email: "joao@aurora.app",
  initials: "JP",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const today = new Date();
const T = toISODate(today);
const TOMORROW = toISODate(addDays(today, 1));
const YESTERDAY = toISODate(addDays(today, -1));
const IN_2 = toISODate(addDays(today, 2));
const IN_4 = toISODate(addDays(today, 4));
const IN_12 = toISODate(addDays(today, 12));

export const projects: Project[] = [
  {
    id: "p1",
    name: "Workflow",
    description: "Plataforma interna de automação de processos do time.",
    color: "var(--primary)",
    deadline: IN_12,
    status: "ativo",
  },
  {
    id: "p2",
    name: "Site Cliente Marcos",
    description: "Redesign completo do site institucional e blog.",
    color: "var(--info)",
    deadline: IN_4,
    status: "ativo",
  },
  {
    id: "p3",
    name: "Faculdade",
    description: "Disciplinas, entregas e trabalho de conclusão.",
    color: "var(--warning)",
    status: "ativo",
  },
  {
    id: "p4",
    name: "Financeiro pessoal",
    description: "Contas, investimentos e planejamento mensal.",
    color: "var(--success)",
    status: "pausado",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Finalizar relatório mensal do projeto Workflow",
    description: "Consolidar métricas de adoção e enviar para a diretoria.",
    date: T,
    time: "09:30",
    priority: "urgente",
    status: "andamento",
    projectId: "p1",
    category: "Trabalho",
    subtasks: [
      { id: "s1", title: "Coletar métricas", done: true },
      { id: "s2", title: "Montar gráficos", done: true },
      { id: "s3", title: "Escrever conclusão", done: false },
    ],
    notes: "A diretoria pediu foco em retenção.",
    createdAt: YESTERDAY,
  },
  {
    id: "t2",
    title: "Responder proposta do cliente Marcos",
    date: T,
    time: "11:00",
    priority: "alta",
    status: "pendente",
    projectId: "p2",
    category: "Clientes",
    subtasks: [],
    createdAt: YESTERDAY,
  },
  {
    id: "t3",
    title: "Revisar wireframes da home",
    date: T,
    priority: "media",
    status: "pendente",
    projectId: "p2",
    category: "Design",
    subtasks: [],
    createdAt: T,
  },
  {
    id: "t4",
    title: "Enviar documentação da faculdade",
    date: YESTERDAY,
    priority: "alta",
    status: "pendente",
    projectId: "p3",
    category: "Faculdade",
    subtasks: [],
    createdAt: toISODate(addDays(today, -3)),
  },
  {
    id: "t5",
    title: "Pagar fatura do cartão",
    date: toISODate(addDays(today, -2)),
    priority: "urgente",
    status: "pendente",
    projectId: "p4",
    category: "Financeiro",
    subtasks: [],
    createdAt: toISODate(addDays(today, -6)),
  },
  {
    id: "t6",
    title: "Planejar sprint da próxima semana",
    date: TOMORROW,
    time: "10:00",
    priority: "media",
    status: "pendente",
    projectId: "p1",
    category: "Trabalho",
    subtasks: [],
    createdAt: T,
  },
  {
    id: "t7",
    title: "Estudar para prova de Estatística",
    date: IN_2,
    priority: "alta",
    status: "pendente",
    projectId: "p3",
    category: "Faculdade",
    subtasks: [
      { id: "s4", title: "Resumo capítulo 4", done: false },
      { id: "s5", title: "Lista de exercícios", done: false },
    ],
    createdAt: T,
  },
  {
    id: "t8",
    title: "Atualizar portfólio pessoal",
    date: IN_4,
    priority: "baixa",
    status: "pendente",
    category: "Pessoal",
    subtasks: [],
    createdAt: YESTERDAY,
  },
  {
    id: "t9",
    title: "Alinhar escopo com o time de produto",
    date: T,
    priority: "media",
    status: "concluido",
    projectId: "p1",
    category: "Trabalho",
    subtasks: [],
    createdAt: YESTERDAY,
  },
  {
    id: "t10",
    title: "Comprar presente de aniversário da Ana",
    date: IN_2,
    priority: "media",
    status: "pendente",
    category: "Pessoal",
    subtasks: [],
    createdAt: YESTERDAY,
  },
];

export const events: CalendarEvent[] = [
  {
    id: "e1",
    title: "Academia",
    date: T,
    time: "07:00",
    durationMin: 60,
    category: "Saúde",
    location: "Smart Fit — Centro",
  },
  {
    id: "e2",
    title: "Bloco de foco: projeto Workflow",
    date: T,
    time: "11:00",
    durationMin: 90,
    category: "Trabalho",
    description: "Sem reuniões, apenas execução.",
  },
  {
    id: "e3",
    title: "Reunião com Marcos",
    date: T,
    time: "14:30",
    durationMin: 45,
    category: "Clientes",
    location: "Google Meet",
    reminderMin: 15,
    description: "Apresentar a proposta de redesign.",
  },
  {
    id: "e4",
    title: "Faculdade — Estatística",
    date: T,
    time: "19:00",
    durationMin: 180,
    category: "Faculdade",
    location: "Campus Norte",
  },
  {
    id: "e5",
    title: "Daily do time",
    date: TOMORROW,
    time: "09:15",
    durationMin: 15,
    category: "Trabalho",
    location: "Google Meet",
  },
  {
    id: "e6",
    title: "Consulta médica",
    date: IN_2,
    time: "16:00",
    durationMin: 60,
    category: "Saúde",
    location: "Clínica Vida",
  },
  {
    id: "e7",
    title: "Entrega do trabalho de TCC",
    date: IN_4,
    time: "23:59",
    durationMin: 30,
    category: "Faculdade",
  },
];

export const reminders: Reminder[] = [
  {
    id: "r1",
    title: "Ligar para o cliente Marcos",
    date: T,
    time: "13:45",
    repeat: "once",
    done: false,
  },
  {
    id: "r2",
    title: "Enviar o relatório para a diretoria",
    date: TOMORROW,
    time: "09:00",
    repeat: "once",
    done: false,
  },
  {
    id: "r3",
    title: "Pagar a internet",
    date: IN_4,
    time: "10:00",
    repeat: "monthly",
    done: false,
  },
  {
    id: "r4",
    title: "Tomar água e alongar",
    date: T,
    time: "16:00",
    repeat: "daily",
    done: true,
  },
];

export const notes: Note[] = [
  {
    id: "n1",
    title: "Cliente Marcos",
    content:
      "O cliente Marcos prefere reuniões pela manhã e contato por WhatsApp. Ele valoriza entregas incrementais e odeia apresentações longas.",
    category: "Clientes",
    pinned: true,
    updatedAt: YESTERDAY,
  },
  {
    id: "n2",
    title: "Ideias para o Workflow",
    content:
      "Automação de aprovações, painel de indicadores por squad e integração com o calendário corporativo.",
    category: "Trabalho",
    pinned: true,
    updatedAt: T,
  },
  {
    id: "n3",
    title: "Checklist de viagem",
    content: "Carregador, passaporte, fone, adaptador, remédios, cabo USB-C.",
    category: "Pessoal",
    pinned: false,
    updatedAt: toISODate(addDays(today, -5)),
  },
  {
    id: "n4",
    title: "Resumo — aula de Estatística",
    content:
      "Distribuição normal, intervalo de confiança e testes de hipótese caem na prova.",
    category: "Faculdade",
    pinned: false,
    updatedAt: toISODate(addDays(today, -2)),
  },
];

export const memories: MemoryItem[] = [
  {
    id: "m1",
    kind: "preferencia",
    content: "Prefere reuniões pela manhã e blocos de foco à tarde.",
    source: "assistente",
    createdAt: toISODate(addDays(today, -20)),
  },
  {
    id: "m2",
    kind: "pessoa",
    content: "Marcos — cliente do projeto Site Cliente Marcos, contato por WhatsApp.",
    source: "assistente",
    createdAt: toISODate(addDays(today, -14)),
  },
  {
    id: "m3",
    kind: "trabalho",
    content: "Trabalha no projeto Workflow como responsável pelo produto.",
    source: "manual",
    createdAt: toISODate(addDays(today, -30)),
  },
  {
    id: "m4",
    kind: "rotina",
    content: "Faculdade às segundas, quartas e sextas, das 19h às 22h.",
    source: "manual",
    createdAt: toISODate(addDays(today, -30)),
  },
  {
    id: "m5",
    kind: "rotina",
    content: "Treina na academia por volta das 07:00 nos dias úteis.",
    source: "assistente",
    createdAt: toISODate(addDays(today, -9)),
  },
];

export const inbox: InboxItem[] = [
  { id: "i1", content: "Comprar cabo USB-C", createdAt: T, processed: false },
  {
    id: "i2",
    content: "Ver curso de design systems recomendado pela Ana",
    createdAt: YESTERDAY,
    processed: false,
  },
  {
    id: "i3",
    content: "Pesquisar hospedagem para o site do Marcos",
    createdAt: YESTERDAY,
    processed: false,
  },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "c1",
    role: "assistant",
    content:
      "Olá, João. Já revisei sua agenda e suas tarefas. Você tem uma reunião às 14:30 com o Marcos e duas tarefas prioritárias ainda abertas. Quer que eu organize o resto do dia?",
    createdAt: new Date().toISOString(),
  },
];

export const dates = { T, TOMORROW, YESTERDAY, IN_2, IN_4, IN_12 };
