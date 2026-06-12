# Deploy Commands - Hetzner

## 🚀 Comandos para Deploy Rápido

### 1. SSH no servidor Hetzner

```bash
# SSH no servidor (substitua pelo seu IP/domínio)
ssh root@SEU_SERVIDOR_HETZNER
# ou
ssh usuario@disponibilidade.vempramodelo.com
```

### 2. Navegar até pasta do docker-compose

```bash
# Substitua pelo caminho correto onde está seu docker-compose.yml
cd /docker
# ou 
cd /home/usuario/docker
# ou
cd /root/docker-compose
```

### 3. Clone/Update do repositório

```bash
# Se é a primeira vez
git clone https://github.com/marcoscdoni/disponibilidade-aulas-praticas.git

# Se já existe, atualize
cd disponibilidade-aulas-praticas
git pull origin main
cd ..
```

### 4. Configurar variáveis de ambiente

```bash
# Edite seu .env principal ou crie um específico
nano .env

# Adicione/verifique estas variáveis:
DISP_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/SalvarDisponibilidade
DISP_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetDadosProcesso
DISP_INSTRUCTORS_ENDPOINT=https://n8n.vempramodelo.com/webhook/link-aluno/GetInstrutroes
DISP_API_KEY=WnILyK16zL8WH6hi3vSL587QvC3TyaUR
DISP_API_KEY_HEADER=x-api-key
```

### 5. Adicionar serviço no docker-compose.yml

```bash
# Edite seu docker-compose.yml
nano docker-compose.yml

# Adicione na seção services:
```

```yaml
  disponibilidade-aulas:
    build:
      context: ./disponibilidade-aulas-praticas
      dockerfile: Dockerfile
    container_name: disponibilidade-aulas
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TZ=America/Sao_Paulo
      # N8N Configuration
      - N8N_AVAILABILITY_WEBHOOK_URL=${DISP_SURVEY_WEBHOOK_URL}
      - N8N_VALIDATION_WEBHOOK_URL=${DISP_VALIDATION_WEBHOOK_URL}
      - N8N_INSTRUCTORS_WEBHOOK_URL=${DISP_INSTRUCTORS_ENDPOINT}
      - N8N_API_KEY=${DISP_API_KEY}
      - N8N_API_KEY_HEADER=${DISP_API_KEY_HEADER:-x-api-key}
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

### 6. Deploy commands

```bash
# Build da nova imagem
docker compose build disponibilidade-aulas

# Para o container antigo (se existir)
docker compose down disponibilidade-aulas

# Inicia o novo container
docker compose up -d disponibilidade-aulas

# Verifique os logs
docker compose logs -f disponibilidade-aulas
```

### 7. Verificar funcionamento

```bash
# Teste interno no servidor
curl -i http://localhost:3000

# Verifique SSL/DNS
curl -i https://disponibilidade.vempramodelo.com

# Logs em tempo real
docker compose logs -f disponibilidade-aulas
```

## 🔧 Troubleshooting

### Container não inicia
```bash
# Verifique erros específicos
docker compose logs disponibilidade-aulas

# Verifique se a porta está ocupada
netstat -tlnp | grep :3000

# Rebuild forçado
docker compose build --no-cache disponibilidade-aulas
```

### DNS não resolve
```bash
# Teste DNS
nslookup disponibilidade.vempramodelo.com

# Verifique Traefik
docker compose logs traefik | grep disponibilidade
```

### SSL não funciona
```bash
# Força renovação certificado
docker compose exec traefik traefik healthcheck

# Verifique labels do Traefik
docker inspect disponibilidade-aulas | grep -A 20 Labels
```

## ⚡ One-liner para deploy rápido

```bash
cd /docker && git -C disponibilidade-aulas-praticas pull origin main && docker compose build disponibilidade-aulas && docker compose up -d disponibilidade-aulas && docker compose logs -f disponibilidade-aulas
```