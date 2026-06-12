# Docker Compose - Disponibilidade Aulas Práticas

## 📋 Configuração para Hetzner

### 1. Adicione este serviço ao seu docker-compose.yml

```yaml
  disponibilidade-aulas:
    build:
      context: ./disponibilidade-aulas-praticas
      dockerfile: Dockerfile
    container_name: disponibilidade-aulas
    restart: always
    env_file:
      - ./disponibilidade-aulas-praticas/.env
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TZ=America/Sao_Paulo
    networks:
      - infra_default
    expose:
      - "3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.disponibilidade-aulas.rule=Host(\`disponibilidade.vempramodelo.com\`)"
      - "traefik.http.routers.disponibilidade-aulas.entrypoints=websecure"
      - "traefik.http.routers.disponibilidade-aulas.tls.certresolver=letsencrypt"
      - "traefik.http.services.disponibilidade-aulas.loadbalancer.server.port=3000"
      - "traefik.docker.network=infra_default"
```

## 🚀 Passos para Deploy Manual

### 1. SSH no servidor Hetzner

```bash
ssh root@seu-servidor-hetzner
```

### 2. Vá para pasta do docker-compose

```bash
cd /caminho/do/seu/docker-compose
```

### 3. Clone o repositório

```bash
git clone https://github.com/marcoscdoni/disponibilidade-aulas-praticas.git
```

### 4. Configure o .env

```bash
cd disponibilidade-aulas-praticas
cp .env.example .env
nano .env
```

**Conteúdo do .env:**
```env
### Production Environment - Disponibilidade Aulas Práticas

# Backend endpoints (usados internamente pelo server)
BACKEND_SURVEY_URL=/api/availability
BACKEND_TOKEN_VALIDATION_URL=/api/validate-token

# N8N Configuration
N8N_API_KEY_HEADER=x-api-key
N8N_API_KEY=WnILyK16zL8WH6hi3vSL587QvC3TyaUR

# N8N Webhook URLs
N8N_AVAILABILITY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/SalvarDisponibilidade
N8N_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetDadosProcesso  
N8N_INSTRUCTORS_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetInstrutroes

# Default token para desenvolvimento (opcional)
# DEFAULT_TOKEN=27A71581-FBE9-4D65-88D2-3A99DC4199AB
```

### 5. Volte para pasta do docker-compose

```bash
cd ..
```

### 6. Adicione o serviço ao docker-compose.yml

```bash
nano docker-compose.yml
```

Cole a configuração do serviço `disponibilidade-aulas` mostrada acima.

### 7. Configure DNS

No painel DNS (KingHost):
```
Tipo: A
Nome: disponibilidade  
Valor: IP_DO_SERVIDOR_HETZNER
TTL: 3600
```

### 8. Deploy

```bash
# Build da imagem
docker compose build disponibilidade-aulas

# Suba o container
docker compose up -d disponibilidade-aulas

# Veja os logs
docker compose logs -f disponibilidade-aulas
```

### 9. Teste

```bash
# Teste interno
curl -i http://localhost:3000

# Teste externo
curl -i https://disponibilidade.vempramodelo.com
```

## 🔧 Comandos Úteis

### Atualizar aplicação

```bash
# Pare o container
docker compose down disponibilidade-aulas

# Atualize código
cd disponibilidade-aulas-praticas
git pull origin main
cd ..

# Rebuild e restart
docker compose build disponibilidade-aulas
docker compose up -d disponibilidade-aulas
```

### Debug

```bash
# Ver logs
docker compose logs disponibilidade-aulas

# Entrar no container
docker compose exec disponibilidade-aulas sh

# Ver status
docker compose ps disponibilidade-aulas
```

### Limpar e rebuild

```bash
# Para forçar rebuild completo
docker compose build --no-cache disponibilidade-aulas
docker compose up -d disponibilidade-aulas
```

## 📊 URLs de Acesso

- **Frontend**: https://disponibilidade.vempramodelo.com
- **API Health**: https://disponibilidade.vempramodelo.com/api/validate-token?token=test
- **API Instructors**: https://disponibilidade.vempramodelo.com/api/instructors

## ⚠️ Importante

1. **DNS**: Certifique-se que `disponibilidade.vempramodelo.com` aponta para seu servidor
2. **Firewall**: Porta 3000 deve estar accessible pelo Traefik
3. **SSL**: Traefik gerará certificado automaticamente
4. **Logs**: Monitore logs durante o primeiro deploy