# Deploy Guide - NPS Survey Application

## Opção 1: Deploy com Docker (Recomendado)

### Pré-requisitos na VPS
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Deploy na VPS

1. **Clone o repositório na VPS:**
```bash
git clone https://github.com/marcoscdoni/nps-modelo.git
cd nps-modelo
```

2. **Configure as variáveis de ambiente:**
```bash
nano .env
```

Adicione:
```env
NPS_SURVEY_WEBHOOK_URL=https://seu-n8n.com/webhook/pesquisa
NPS_VALIDATION_WEBHOOK_URL=https://seu-n8n.com/webhook/validar-token
NPS_API_KEY=sua-chave-api-aqui
NPS_API_KEY_HEADER=x-api-key
PORT=3000
```

3. **Build e execute o container:**
```bash
# Build da imagem
docker compose build

# Iniciar o container
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

4. **Configurar Nginx como reverse proxy (opcional mas recomendado):**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/nps-survey
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nps-survey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **SSL com Certbot (HTTPS):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Atualizar a aplicação
```bash
cd nps-modelo
git pull
docker compose down
docker compose build
docker compose up -d
```

---

## Opção 2: Deploy sem Docker

### Pré-requisitos na VPS
```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### Deploy

1. **Clone o repositório:**
```bash
git clone https://github.com/marcoscdoni/nps-modelo.git
cd nps-modelo
```

2. **Instale as dependências:**
```bash
npm ci
```

3. **Configure o .env:**
```bash
nano .env
```

4. **Build da aplicação:**
```bash
npm run build
```

5. **Iniciar com PM2:**
```bash
pm2 start server/index.js --name nps-survey -i max
pm2 save
pm2 startup
```

6. **Configurar Nginx** (mesmo processo da Opção 1)

### Comandos PM2 úteis
```bash
pm2 status                # Ver status
pm2 logs nps-survey       # Ver logs
pm2 restart nps-survey    # Reiniciar
pm2 stop nps-survey       # Parar
pm2 delete nps-survey     # Remover
```

### Atualizar a aplicação
```bash
cd nps-modelo
git pull
npm ci
npm run build
pm2 restart nps-survey
```

---

## Vantagens de cada opção

### Docker (Recomendado)
✅ Ambiente isolado e consistente
✅ Fácil de replicar em qualquer servidor
✅ Gerenciamento simplificado de dependências
✅ Rollback fácil (versionamento de imagens)
✅ Menos conflitos com outras aplicações na VPS

### Sem Docker
✅ Menos overhead de recursos
✅ Mais simples se você já conhece PM2
✅ Acesso direto aos logs do sistema

---

## Monitoramento

### Com Docker
```bash
# Ver logs em tempo real
docker compose logs -f

# Ver uso de recursos
docker stats

# Entrar no container
docker compose exec nps-survey sh
```

### Com PM2
```bash
# Dashboard web
pm2 plus

# Logs
pm2 logs nps-survey

# Monitoramento
pm2 monit
```

---

## Troubleshooting

### Verificar se a porta 3000 está aberta:
```bash
sudo ufw allow 3000
sudo ufw status
```

### Verificar se o serviço está rodando:
```bash
# Docker
docker compose ps

# Sem Docker
pm2 status
netstat -tulpn | grep 3000
```

### Reiniciar serviços:
```bash
# Docker
docker compose restart

# PM2
pm2 restart nps-survey

# Nginx
sudo systemctl restart nginx
```
