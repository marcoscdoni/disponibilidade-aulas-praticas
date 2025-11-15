# Pesquisa de Satisfação NPS - Vue.js

Uma aplicação web moderna e responsiva para pesquisas de satisfação NPS (Net Promoter Score) desenvolvida em Vue.js 3 com design mobile-first.

## 📋 Características

- **11 questões de satisfação** incluindo escala NPS (0-10)
- **Design responsivo** otimizado para dispositivos móveis
- **Interface moderna** com animações e feedback visual
- **Validação de formulário** em tempo real
- **Integração com n8n** para envio de dados
- **Acessibilidade** com suporte a navegação por teclado
- **Suporte a modo escuro**

## 🚀 Como usar

### 1. Instalação

```bash
# Clone ou faça download dos arquivos
# Navegue até a pasta do projeto
cd nps-modelo

# Instale as dependências
npm install
```

### 2. Configuração do n8n

Edite o arquivo `src/config/n8n.js` para configurar sua integração:

```javascript
export const config = {
  // Substitua pela URL real do seu webhook n8n
  n8nWebhookUrl: 'https://sua-instancia-n8n.com/webhook/survey',
  
  // Cabeçalhos opcionais (ex: autenticação)
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer seu-token-aqui',
  },
  
  // Configurações da autoescola
  autoescola: {
    name: 'Nome da Sua Autoescola', // Altere para o nome da sua autoescola
    showLogo: false,
    logoUrl: '/logo.png'
  }
}
```

### 3. Executar o projeto

```bash
# Modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Estrutura dos dados enviados para o n8n

A aplicação envia um JSON estruturado com os seguintes campos:

```json
{
  "timestamp": "2025-11-14T10:30:00.000Z",
  "autoescola": "Nome da Autoescola",
  "nps_score": 9,
  "overall_satisfaction": "satisfied",
  "reception_service": "totally_satisfied",
  "theory_classes": "satisfied",
  "practical_classes": "satisfied",
  "practical_instructor": "totally_satisfied",
  "vehicle_conditions": "satisfied",
  "infrastructure": "neutral",
  "dislikes": ["Prazo para início das aulas práticas"],
  "likes": ["Qualidade das aulas práticas", "Profissionalismo dos instrutores"],
  "comments": "Comentários opcionais do usuário"
}
```

### Valores possíveis para escalas Likert:
- `totally_dissatisfied`
- `dissatisfied`
- `neutral`
- `satisfied`
- `totally_satisfied`

## 📱 Recursos Mobile

- **Layout responsivo** que se adapta a qualquer tamanho de tela
- **Componentes otimizados para touch** com áreas de toque adequadas
- **Fontes e espaçamentos escaláveis**
- **Navegação fluida** com scroll suave
- **Feedback visual** para todas as interações

## 🎨 Personalização

### Cores e tema
Edite o arquivo `src/style.css` para personalizar:
- Cores principais (variáveis CSS)
- Gradientes de fundo
- Estilos dos componentes

### Logo da empresa
1. Coloque sua logo em `public/logo.png`
2. Ative a exibição no arquivo `src/config/n8n.js`:
```javascript
autoescola: {
  showLogo: true,
  logoUrl: '/logo.png'
}
```

## 🔧 Estrutura do projeto

```
src/
├── components/
│   ├── NPSSurvey.vue      # Componente principal da pesquisa
│   ├── LikertScale.vue    # Escala Likert (1-5)
│   └── MultipleChoice.vue # Seleção múltipla
├── config/
│   └── n8n.js            # Configuração da integração n8n
├── style.css             # Estilos globais
├── App.vue               # Componente raiz
└── main.js               # Ponto de entrada
```

## 🌐 Integração com n8n

Para configurar o webhook no n8n:

1. Crie um novo workflow no n8n
2. Adicione um nó "Webhook" 
3. Configure o método como "POST"
4. Defina o caminho do webhook (ex: `/webhook/survey`)
5. Use a URL gerada no arquivo de configuração
6. Adicione nós para processar os dados recebidos (banco de dados, email, etc.)

### Exemplo de workflow n8n:
```
Webhook → JSON Parser → Database/Spreadsheet → Email Notification
```

## 📋 TODO / Melhorias futuras

- [ ] Adicionar validação de email opcional
- [ ] Implementar modo offline com sync posterior
- [ ] Adicionar analytics de abandono de formulário
- [ ] Suporte a múltiplos idiomas
- [ ] Exportação de dados em CSV
- [ ] Dashboard de resultados
- [ ] Integração com Google Analytics

## 🤝 Contribuição

Sinta-se à vontade para contribuir com melhorias:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para melhorar a experiência do cliente em autoescolas**