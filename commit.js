// commit.js
const { execSync } = require("child_process"); // Corrigido: 'import' -> 'require'
const fs = require("fs"); // Corrigido: 'import' -> 'require'
const path = require("path"); // Adicionado: para caminhos mais robustos

// Melhoria: Resolve o caminho absoluto a partir do diretório atual
// (Usa o nome de arquivo 'COMMIT_MESSAGE.md' que você definiu)
const MESSAGE_FILE = path.resolve(process.cwd(), "COMMIT_MESSAGE.md");

// Verifica se o arquivo existe e não está vazio
if (!fs.existsSync(MESSAGE_FILE)) {
  console.error(`❌ Arquivo ${MESSAGE_FILE} não encontrado.`);
  process.exit(1);
}

const message = fs.readFileSync(MESSAGE_FILE, "utf-8").trim();

if (!message) {
  console.error("⚠️  O arquivo COMMIT_MESSAGE.md está vazio.");
  process.exit(1);
}

try {
  console.log("📦 Adicionando alterações...");
  execSync("git add .", { stdio: "inherit" });

  console.log("📝 Fazendo commit...");
  // Melhoria: Coloca o caminho entre aspas para lidar com espaços
  execSync(`git commit -F "${MESSAGE_FILE}"`, { stdio: "inherit" });

  console.log("🚀 Enviando para o repositório remoto...");
  execSync("git push", { stdio: "inherit" });

  // Opcional: limpar o arquivo após o commit
  fs.writeFileSync(MESSAGE_FILE, "");
  console.log("✅ Commit realizado com sucesso! Mensagem limpa.");
} catch (err) {
  console.error("❌ Erro durante o commit:", err.message);
  process.exit(1);
}