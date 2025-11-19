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

### 2. Configuração do backend integrado

Este projeto junta o frontend e o backend em um único servidor Node.js. Configure o `.env` para que o servidor saiba para onde encaminhar `/api/pesquisa` e `/api/validate-token` no n8n, mantendo a chave API em segredo.

```bash
NPS_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/nps-modelo/EnviarPesquisa
NPS_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/nps-modelo/GetDadosProcesso
NPS_API_KEY=chave-secreta
NPS_API_KEY_HEADER=x-api-key
```

O frontend continuará chamando `/api/pesquisa` e `/api/validate-token`; o servidor cuidará de repassar as requisições para os webhooks do n8n com os cabeçalhos corretos.

### Tokens

- O token usado para abrir a pesquisa deve vir da URL (query string `?token=...` ou o último segmento). Isso garante que cada aluno use o token exclusivo recebido pela autoescola.
- O fallback em `NPS_DEFAULT_TOKEN` existe apenas para testes manuais locais e deve ficar em branco em prod. Evite colocar um valor real aí em commits ou builds públicos.

## ⚠️ Erros comuns

- `NPS_VALIDATION_WEBHOOK_URL ausente no servidor`: significa que o `.env` está faltando `NPS_VALIDATION_WEBHOOK_URL`. Adicione esse valor para que o servidor saiba para qual webhook n8n encaminhar a validação.
- `NPS_SURVEY_WEBHOOK_URL ausente no servidor`: informe a URL de envio (`/EnviarPesquisa`).

### 3. Executar o projeto

```bash
# Modo de desenvolvimento (frontend + backend juntos)
npm run dev

# Gerar a build (usa Vite normalmente)
npm run build

# Executar o servidor integrado com a build gerada
npm run start
```

A aplicação estará disponível em `http://localhost:3000` (ou na porta definida por `PORT`).

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

O servidor Node integrado expõe `/api/pesquisa` e `/api/validate-token` e encaminha todas as requisições para os webhooks do n8n, adicionando o cabeçalho `x-api-key` apropriado e garantindo que o token e outros metadados sejam enviados no corpo da requisição.

### Fluxo recomendado

```
Frontend → Backend proxy protegido → Webhook n8n
```

No n8n, o workflow pode ser o mesmo de antes:

1. Webhook (POST) para `/webhook/survey`
2. JSON Parser (opcional)
3. Processamento (banco de dados, planilhas, notificações, etc.)

O backend é responsável por traduzir o JSON recebido do frontend para o payload esperado pelo n8n e por repassar o `token` na carga útil para que o webhook possa marcar a pesquisa como enviada.

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