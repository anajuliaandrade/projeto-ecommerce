import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Copy, Heart, LogOut, Sparkles, Trash2, WandSparkles } from "lucide-react";
import "./styles.css";

const API = "http://localhost:3333";
const blankForm = { productName: "", category: "", audience: "", platform: "", features: "" };
const categories = ["Cama, mesa e banho", "Vestuario", "Calcados", "Beleza e cuidados pessoais", "Casa e cozinha", "Eletronicos", "Esportes e lazer", "Acessorios"];
const audiences = ["Homens", "Mulheres", "Unissex", "Esportistas", "Criancas", "Adolescentes", "Adultos", "Familias"];
const platforms = ["Mercado Livre", "Shopee", "Shein", "Amazon", "Magalu", "Loja propria", "Instagram"];

// Centraliza todas as chamadas do frontend para a API e envia o token JWT.
async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Nao foi possivel concluir.");
  return data;
}

function Auth({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      const data = await request(`/auth/${register ? "register" : "login"}`, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); onAuth(data.user);
    } catch (err) { setError(err.message); }
  };
  return <main className="auth-page">
    <section className="auth-copy">
      <div className="brand"><WandSparkles /> Product <strong>Description</strong></div>
      <h1>Palavras que <span>vendem.</span><br />Em segundos.</h1>
      <p>Crie descrições atraentes, completas e prontas para publicar em qualquer canal de venda.</p>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <Sparkles className="form-icon" /><h2>{register ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
      <p>{register ? "Comece a criar textos melhores hoje." : "Entre para continuar criando."}</p>
      {register && <label>Nome<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>}
      <label>E-mail<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
      <label>Senha<input type="password" minLength="6" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
      {error && <div className="error">{error}</div>}
      <button className="primary">{register ? "Criar conta" : "Entrar"} <span>→</span></button>
      <button type="button" className="link" onClick={() => setRegister(!register)}>{register ? "Ja tenho uma conta" : "Criar uma conta gratis"}</button>
    </form>
  </main>;
}

function ResultCard({ title, children, copy }) {
  return <article className="result-card"><header><h3>{title}</h3><button title="Copiar" onClick={() => navigator.clipboard.writeText(copy)}><Copy size={17} /></button></header>{children}</article>;
}

function Generator({ onFavorite }) {
  const [form, setForm] = useState(blankForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generate = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { setResult(await request("/descriptions/generate", { method: "POST", body: JSON.stringify(form) })); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <div className="workspace">
    <section className="form-panel"><div className="eyebrow">Novo produto</div><h2>O que vamos vender hoje?</h2><p>Conte os detalhes. Nós cuidamos das palavras.</p>
      <form onSubmit={generate}>
        <label>Nome do produto<input placeholder="Ex: Garrafa Termica Aurora" value={form.productName} onChange={e => setForm({...form, productName:e.target.value})} required /></label>
        <div className="two">
          <label>Categoria<select value={form.category} onChange={e => setForm({...form, category:e.target.value})} required><option value="">Selecione</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Plataforma<select value={form.platform} onChange={e => setForm({...form, platform:e.target.value})} required><option value="">Selecione</option>{platforms.map(item => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label>Publico-alvo<select value={form.audience} onChange={e => setForm({...form, audience:e.target.value})} required><option value="">Selecione</option>{audiences.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Caracteristicas<textarea rows="5" placeholder="Confortável, salto médio..." value={form.features} onChange={e => setForm({...form, features:e.target.value})} required /></label>
        {error && <div className="error">{error}</div>}<button className="primary" disabled={loading}><Sparkles size={18}/>{loading ? "Criando..." : "Gerar descricao"}</button>
      </form>
    </section>
    <section className="results-panel">{!result ? <div className="empty"><div><WandSparkles /></div><h2>Pronto para criar</h2><p>Preencha os dados do produto e seus textos aparecerao aqui.</p></div> :
      <><div className="result-heading"><div><div className="eyebrow">Resultado gerado</div><h2>{result.productName}</h2></div><button className="favorite" onClick={() => onFavorite(result)}><Heart size={18}/> Salvar</button></div>
      <ResultCard title="Titulo otimizado" copy={result.title}><strong>{result.title}</strong></ResultCard>
      <ResultCard title="Descricao curta" copy={result.shortDescription}><p>{result.shortDescription}</p></ResultCard>
      <ResultCard title="Descricao completa" copy={result.fullDescription}><p>{result.fullDescription}</p></ResultCard>
      <ResultCard title="Beneficios" copy={result.benefits.join("\n")}><ul>{result.benefits.map(x=><li key={x}>{x}</li>)}</ul></ResultCard>
      <ResultCard title="Hashtags" copy={result.hashtags.join(" ")}><div className="tags">{result.hashtags.map(x=><span key={x}>{x}</span>)}</div></ResultCard>
      <ResultCard title="Texto para anuncio" copy={result.adText}><p>{result.adText}</p></ResultCard></>}
    </section>
  </div>;
}

function App() {
  // O usuario e o token ficam no navegador para manter a sessao ativa.
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [tab, setTab] = useState("create");
  const [favorites, setFavorites] = useState([]);
  const load = async () => { try { setFavorites(await request("/favorites")); } catch {} };
  useEffect(() => { if (user) load(); }, [user]);
  const save = async data => { await request("/favorites", { method: "POST", body: JSON.stringify(data) }); load(); setTab("favorites"); };
  const remove = async id => { await request(`/favorites/${id}`, { method: "DELETE" }); load(); };
  const logout = () => { localStorage.clear(); setUser(null); };
  // Sem usuario autenticado, a aplicacao mostra apenas cadastro e login.
  if (!user) return <Auth onAuth={setUser}/>;
  return <><nav><div className="brand"><WandSparkles /> Product Description <strong>AI</strong></div><div className="nav-actions"><button className={tab==="create"?"active":""} onClick={()=>setTab("create")}>Criar</button><button className={tab==="favorites"?"active":""} onClick={()=>setTab("favorites")}><Heart size={16}/> Favoritos <span>{favorites.length}</span></button><div className="avatar">{user.name[0].toUpperCase()}</div><button title="Sair" onClick={logout}><LogOut size={18}/></button></div></nav>
  {tab === "create" ? <Generator onFavorite={save}/> : <main className="favorites-page"><div className="eyebrow">Sua biblioteca</div><h1>Textos favoritos</h1><p>Todos os seus melhores textos, prontos para usar.</p><div className="favorites-grid">{favorites.length ? favorites.map(item=><article className="favorite-card" key={item.id}><div><span>{item.category}</span><button onClick={()=>remove(item.id)}><Trash2 size={17}/></button></div><h3>{item.title}</h3><p>{item.shortDescription}</p><small>{item.platform}</small></article>) : <div className="empty wide"><Heart/><h2>Nenhum favorito ainda</h2><p>Salve uma descricao para encontra-la aqui.</p></div>}</div></main>}</>;
}

createRoot(document.getElementById("root")).render(<App />);
