import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3333;
const secret = process.env.JWT_SECRET || "dev-secret-change-me";

// Persistencia temporaria: estes dados sao apagados ao reiniciar o servidor.
const users = [];
const favorites = [];
let nextUserId = 1;
let nextFavoriteId = 1;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const clean = (value) => String(value || "").trim();
const slug = (value) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]+/g, "");

function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Autenticacao necessaria." });
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: "Token invalido ou expirado." });
  }
}

// Gera os seis formatos de texto usando regras e templates locais.
function generateDescription(body) {
  const productName = clean(body.productName);
  const category = clean(body.category);
  const audience = clean(body.audience);
  const platform = clean(body.platform);
  const features = clean(body.features).split(/\n|,/).map(clean).filter(Boolean);
  const featureText = features.length ? features.join(", ") : "qualidade, praticidade e excelente acabamento";
  const benefits = features.length
    ? features.map((item) => `${item}: pensado para oferecer mais valor e praticidade no dia a dia.`)
    : [
        "Qualidade que voce percebe desde o primeiro uso.",
        "Praticidade para tornar sua rotina mais simples.",
        "Uma escolha confiavel com excelente custo-beneficio."
      ];

  return {
    productName,
    category,
    platform,
    title: `${productName} | ${category} para ${audience}`,
    shortDescription: `Descubra ${productName}: ${featureText}. A escolha ideal para ${audience}, disponivel na ${platform}.`,
    fullDescription: `Transforme sua experiencia com ${productName}. Desenvolvido especialmente para ${audience}, este produto da categoria ${category} combina ${featureText}. Cada detalhe foi pensado para entregar praticidade, confianca e uma experiencia marcante. Garanta o seu na ${platform} e leve mais qualidade para a sua rotina.`,
    benefits,
    hashtags: [`#${slug(productName)}`, `#${slug(category)}`, `#${slug(platform)}`, "#Oferta", "#CompreAgora"],
    adText: `Seu novo favorito chegou! Conheca ${productName} e aproveite ${featureText}. Perfeito para ${audience}. Compre agora na ${platform}!`
  };
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Cria um usuario, protege sua senha com hash e retorna um token JWT.
app.post("/auth/register", asyncRoute(async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);
  if (!name || !email || password.length < 6) return res.status(400).json({ error: "Informe nome, e-mail e senha com pelo menos 6 caracteres." });
  if (users.some((user) => user.email === email)) return res.status(409).json({ error: "E-mail ja cadastrado." });
  const user = { id: nextUserId++, name, email, passwordHash: await bcrypt.hash(password, 10) };
  users.push(user);
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, secret, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}));

app.post("/auth/login", asyncRoute(async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const user = users.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(clean(req.body.password), user.passwordHash))) return res.status(401).json({ error: "E-mail ou senha invalidos." });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, secret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}));

app.post("/descriptions/generate", auth, (req, res) => {
  const required = ["productName", "category", "audience", "platform", "features"];
  if (required.some((key) => !clean(req.body[key]))) return res.status(400).json({ error: "Preencha todos os campos." });
  res.json(generateDescription(req.body));
});

app.get("/favorites", auth, asyncRoute(async (req, res) => {
  res.json(favorites.filter((item) => item.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}));

app.post("/favorites", auth, asyncRoute(async (req, res) => {
  const data = req.body;
  const favorite = {
    id: nextFavoriteId++, userId: req.user.id, productName: clean(data.productName), category: clean(data.category),
    platform: clean(data.platform), title: clean(data.title), shortDescription: clean(data.shortDescription),
    fullDescription: clean(data.fullDescription), benefits: data.benefits || [], hashtags: data.hashtags || [],
    adText: clean(data.adText), createdAt: new Date().toISOString()
  };
  favorites.push(favorite);
  res.status(201).json(favorite);
}));

app.delete("/favorites/:id", auth, asyncRoute(async (req, res) => {
  const index = favorites.findIndex((item) => item.id === Number(req.params.id) && item.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: "Favorito nao encontrado." });
  favorites.splice(index, 1);
  res.status(204).end();
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Ocorreu um erro inesperado." });
});

app.listen(port, () => console.log(`API em http://localhost:${port}`));
