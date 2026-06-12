#!/bin/bash

# Script de Deploy - Disponibilidade Aulas Práticas
# Execute este script no servidor Hetzner

set -e  # Para na primeira falha

echo "🚀 Iniciando deploy da aplicação Disponibilidade Aulas Práticas..."

# Verificar se estamos no diretório correto (onde está o docker-compose.yml)
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erro: docker-compose.yml não encontrado no diretório atual"
    echo "💡 Execute este script no diretório onde está seu docker-compose.yml principal"
    exit 1
fi

# 1. Clone ou update do repositório
echo "📥 Atualizando código..."
if [ -d "disponibilidade-aulas-praticas" ]; then
    echo "   - Pasta existe, fazendo git pull..."
    cd disponibilidade-aulas-praticas
    git pull origin main
    cd ..
else
    echo "   - Clonando repositório..."
    git clone https://github.com/marcoscdoni/disponibilidade-aulas-praticas.git
fi

# 2. Verificar .env
echo "🔧 Verificando configurações..."
if ! grep -q "DISP_SURVEY_WEBHOOK_URL" .env 2>/dev/null; then
    echo "⚠️  Variáveis de ambiente não encontradas em .env"
    echo "💡 Adicione estas variáveis no seu .env:"
    echo ""
    echo "DISP_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/SalvarDisponibilidade"
    echo "DISP_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetDadosProcesso"
    echo "DISP_INSTRUCTORS_ENDPOINT=https://n8n.vempramodelo.com/webhook/link-aluno/GetInstrutroes"
    echo "DISP_API_KEY=WnILyK16zL8WH6hi3vSL587QvC3TyaUR"
    echo "DISP_API_KEY_HEADER=x-api-key"
    echo ""
    read -p "Pressione Enter após adicionar as variáveis..."
fi

# 3. Build da nova imagem
echo "🏗️  Fazendo build da imagem..."
docker compose build disponibilidade-aulas

# 4. Para container antigo (se existir)
echo "🛑 Parando container anterior..."
docker compose down disponibilidade-aulas 2>/dev/null || echo "   - Nenhum container anterior encontrado"

# 5. Inicia novo container
echo "🚀 Iniciando novo container..."
docker compose up -d disponibilidade-aulas

# 6. Aguarda container estar rodando
echo "⏳ Aguardando container inicializar..."
sleep 5

# 7. Verificar status
echo "✅ Verificando status..."
if docker compose ps disponibilidade-aulas | grep -q "Up"; then
    echo "🎉 Deploy realizado com sucesso!"
    echo ""
    echo "🌐 Aplicação disponível em: https://disponibilidade.vempramodelo.com"
    echo "📊 Logs: docker compose logs -f disponibilidade-aulas"
    echo ""
    
    # Mostrar últimas linhas do log
    echo "📋 Últimas linhas do log:"
    docker compose logs --tail=10 disponibilidade-aulas
    
else
    echo "❌ Erro: Container não está rodando"
    echo "📋 Logs do container:"
    docker compose logs disponibilidade-aulas
    exit 1
fi

echo ""
echo "✨ Deploy concluído!"