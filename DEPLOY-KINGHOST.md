# Deploy na KingHost - NPS Survey

## ⚠️ Limitações da KingHost

A KingHost **NÃO suporta Docker** e tem limitações para aplicações Node.js:
- Apenas planos específicos suportam Node.js
- Configuração via Plesk (interface gráfica)
- Reinicializações manuais necessárias
- Menos controle sobre o ambiente

---

## 📋 Pré-requisitos

1. **Plano KingHost com Node.js habilitado**
2. **Acesso SSH** (se disponível no seu plano)
3. **Domínio configurado**: `survey.vempramodelo.com`

---

## 🚀 Deploy na KingHost

### Opção 1: Via Plesk (Interface Gráfica)

1. **Acesse o Plesk da KingHost**
   - Login no painel KingHost
   - Acesse o Plesk

2. **Configure o Node.js**
   - Vá em "Node.js"
   - Clique em "Ativar Node.js"
   - Versão: Node.js 20.x
   - Modo de aplicação: Production
   - Documento raiz: `/httpdocs/survey`
   - Arquivo de inicialização: `server/index.js`

3. **Envie os arquivos via FTP/SFTP**
   ```
   Conecte em: ftp.vempramodelo.com
   Usuário: seu_usuario
   Pasta destino: /httpdocs/survey/
   ```

4. **Configure o subdomínio**
   - Plesk > Domínios > Adicionar Subdomínio
   - Nome: `survey`
   - Documento raiz: `/httpdocs/survey`
   - SSL: Ative o Let's Encrypt gratuito

5. **Instale as dependências no Plesk**
   - Vá em Node.js > NPM
   - Execute: `npm install --production`

6. **Configure as variáveis de ambiente**
   - Node.js > Variáveis de Ambiente
   - Adicione:
     ```
     NODE_ENV=production
     PORT=3000
     NPS_SURVEY_WEBHOOK_URL=https://seu-n8n.com/webhook/pesquisa
     NPS_VALIDATION_WEBHOOK_URL=https://seu-n8n.com/webhook/validar-token
     NPS_API_KEY=sua-chave-aqui
     ```

7. **Build da aplicação**
   - SSH ou terminal do Plesk
   - `cd /httpdocs/survey`
   - `npm run build`

8. **Inicie a aplicação**
   - Node.js > Reiniciar aplicação

### Opção 2: Via SSH (se disponível)

```bash
# 1. Conectar via SSH
ssh usuario@vempramodelo.com

# 2. Navegar até a pasta
cd ~/httpdocs/survey

# 3. Clone o repositório
git clone https://github.com/marcoscdoni/nps-modelo.git .

# 4. Instalar dependências
npm ci --production

# 5. Build
npm run build

# 6. Criar arquivo .env
nano .env
# Adicione as variáveis de ambiente

# 7. Reiniciar pelo Plesk
```

---

## 🔄 Atualizar a aplicação

### Via FTP:
1. Envie os novos arquivos
2. Acesse SSH e execute `npm install` se houver novas dependências
3. Execute `npm run build`
4. Reinicie a aplicação no Plesk

### Via SSH + Git:
```bash
cd ~/httpdocs/survey
git pull
npm install
npm run build
# Reiniciar pelo Plesk
```

---

## ⚡ ALTERNATIVA RECOMENDADA: VPS com Docker

### Por que NÃO usar KingHost para esta aplicação?

❌ **Problemas da KingHost:**
- Sem suporte a Docker
- Configuração limitada
- Reinicializações manuais
- Difícil debug
- Mais caro para aplicações Node.js
- Menos controle

✅ **Vantagens de uma VPS:**
- Controle total
- Docker disponível
- Mais barato (R$ 20-40/mês)
- Deploy automatizado
- PM2 para auto-restart
- Melhor performance

### Provedores VPS Recomendados no Brasil:

1. **HostGator VPS** (R$ 29,99/mês)
   - 1 vCore, 1GB RAM
   - Painel cPanel
   - Suporte em PT-BR

2. **Contabo VPS** (€4,99 ~R$ 27/mês)
   - 4 vCores, 6GB RAM
   - Muito mais recursos
   - Datacenter na Europa

3. **DigitalOcean** (US$ 6/mês ~R$ 30)
   - 1 vCore, 1GB RAM
   - Excelente documentação
   - Interface simples

4. **Vultr** (US$ 6/mês)
   - Similar ao DigitalOcean
   - Datacenter em São Paulo

### Setup ideal com VPS + Domínio KingHost:

1. **Contrate uma VPS** (recomendo Contabo ou DigitalOcean)

2. **Configure o DNS na KingHost:**
   ```
   Tipo: A
   Nome: survey
   Valor: IP_DA_VPS
   TTL: 3600
   ```

3. **Deploy com Docker na VPS:**
   ```bash
   # Na VPS
   git clone https://github.com/marcoscdoni/nps-modelo.git
   cd nps-modelo
   docker compose up -d
   
   # Nginx reverse proxy
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d survey.vempramodelo.com
   ```

4. **Resultado:**
   - HTTPS automático
   - Auto-restart se cair
   - Deploy com 1 comando
   - Logs centralizados
   - Melhor performance

---

## 💰 Comparação de Custos

| Hospedagem | Custo/mês | Docker | Controle | Performance |
|------------|-----------|--------|----------|-------------|
| KingHost (Node.js) | R$ 80+ | ❌ | Baixo | Média |
| VPS + Domínio KingHost | R$ 30-50 | ✅ | Total | Alta |
| Vercel (gratuito) | R$ 0 | N/A | Médio | Alta |

---

## 🎯 Minha Recomendação

**Use o domínio da KingHost, mas hospede em VPS:**

1. Mantenha o domínio `vempramodelo.com` na KingHost
2. Contrate VPS Contabo (€4,99/mês = R$ 27)
3. Configure DNS: `survey.vempramodelo.com` → IP da VPS
4. Deploy com Docker (5 minutos)

**Vantagens:**
- ✅ Mesmo domínio bonito: `survey.vempramodelo.com`
- ✅ Deploy profissional com Docker
- ✅ HTTPS gratuito automático
- ✅ Mais barato que plano Node.js da KingHost
- ✅ Controle total
- ✅ Fácil de atualizar

**Quer que eu crie um guia específico de como configurar DNS na KingHost apontando para VPS?**
