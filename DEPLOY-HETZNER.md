# Deploy NPS Survey na Hetzner com Traefik

## 📋 Passo a Passo

### 1. No servidor Hetzner, crie a pasta do projeto

```bash
# SSH no servidor
ssh usuario@seu-servidor-hetzner

# Navegue até onde está o docker-compose.yml
cd /caminho/do/seu/docker-compose

# Clone o repositório NPS
git clone https://github.com/marcoscdoni/nps-modelo.git
```

### 2. Configure as variáveis de ambiente

Crie ou edite o arquivo `.env` no mesmo diretório do `docker-compose.yml`:

```bash
nano .env
```

Adicione estas variáveis (ou crie um arquivo separado `.env.nps`):

```env
# NPS Survey Configuration
NPS_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/pesquisa
NPS_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/validar-token
NPS_API_KEY=sua-chave-api-segura-aqui
NPS_API_KEY_HEADER=x-api-key
```

### 3. Adicione o serviço ao docker-compose.yml

Edite seu `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Adicione este serviço na seção `services:` (depois do último serviço, antes de `volumes:`):

```yaml
  nps-survey:
    build:
      context: ./nps-modelo
      dockerfile: Dockerfile
    container_name: nps-survey
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TZ=America/Sao_Paulo
      - NPS_SURVEY_WEBHOOK_URL=${NPS_SURVEY_WEBHOOK_URL}
      - NPS_VALIDATION_WEBHOOK_URL=${NPS_VALIDATION_WEBHOOK_URL}
      - NPS_API_KEY=${NPS_API_KEY}
      - NPS_API_KEY_HEADER=${NPS_API_KEY_HEADER:-x-api-key}
    networks:
      - infra_default
    expose:
      - "3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nps-survey.rule=Host(`survey.vempramodelo.com`)"
      - "traefik.http.routers.nps-survey.entrypoints=websecure"
      - "traefik.http.routers.nps-survey.tls.certresolver=letsencrypt"
      - "traefik.http.services.nps-survey.loadbalancer.server.port=3000"
      - "traefik.docker.network=infra_default"
```

### 4. Configure o DNS

No painel da KingHost ou seu provedor DNS:

```
Tipo: A
Nome: survey
Valor: IP_DO_SERVIDOR_HETZNER
TTL: 3600
```

### 5. Build e deploy

```bash
# Build da imagem
docker compose build nps-survey

# Inicie o container
docker compose up -d nps-survey

# Veja os logs
docker compose logs -f nps-survey
```

### 6. Verificar

Acesse: `https://survey.vempramodelo.com`

O Traefik vai automaticamente:
- ✅ Gerar certificado SSL via Let's Encrypt
- ✅ Configurar HTTPS
- ✅ Rotear as requisições

---

## 🔄 Atualizar a aplicação

```bash
# SSH no servidor
cd /caminho/do/seu/docker-compose/nps-modelo

# Atualizar código
git pull

# Rebuild e restart
docker compose up -d --build nps-survey
```

---

## 🐛 Troubleshooting

### Ver logs:
```bash
docker compose logs -f nps-survey
```

### Reiniciar:
```bash
docker compose restart nps-survey
```

### Verificar se está rodando:
```bash
docker compose ps | grep nps
```

### Entrar no container:
```bash
docker compose exec nps-survey sh
```

### Verificar certificado SSL:
```bash
docker compose logs traefik | grep survey
```

---

## 📝 Estrutura de Pastas no Servidor

```
/opt/docker/ (ou onde está seu compose)
├── docker-compose.yml
├── .env
├── nps-modelo/          # ← Repositório clonado
│   ├── Dockerfile
│   ├── package.json
│   ├── server/
│   ├── src/
│   └── dist/ (gerado no build)
├── evolution-api/
├── evolution/
└── chatwoot/
```

---

## ⚡ Comandos Úteis

```bash
# Ver todos os containers
docker compose ps

# Parar apenas o NPS
docker compose stop nps-survey

# Remover o NPS
docker compose down nps-survey

# Ver uso de recursos
docker stats nps-survey

# Rebuild forçado
docker compose build --no-cache nps-survey
```

---

## 🔐 Segurança

O NPS já está configurado para:
- ✅ HTTPS automático via Traefik
- ✅ Validação de token no backend
- ✅ API Key para n8n
- ✅ Captura de IP do cliente
- ✅ Variáveis de ambiente isoladas

---

## 🎯 Vantagens desta configuração

- ✅ **SSL automático**: Traefik gerencia tudo
- ✅ **Mesmo cluster**: Todos os serviços na mesma rede
- ✅ **N8N integrado**: Webhooks locais (mais rápido)
- ✅ **Fácil manutenção**: `git pull` + `docker compose up -d --build`
- ✅ **Logs centralizados**: `docker compose logs`
- ✅ **Auto-restart**: Se cair, sobe automaticamente

---

## 📊 Monitoramento

Você pode acessar:
- **Portainer**: `https://portainer.vempramodelo.com` - Ver status dos containers
- **Traefik Dashboard**: `https://traefik.vempramodelo.com` - Ver rotas e SSL
- **Logs em tempo real**: `docker compose logs -f nps-survey`
