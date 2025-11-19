# Survey Persistence Feature

## Descrição

Esta funcionalidade permite que o progresso da pesquisa seja salvo automaticamente no navegador do usuário (localStorage). Se o usuário fechar a aba, recarregar a página (F5), ou voltar ao link posteriormente, a pesquisa continuará de onde parou.

## Como Funciona

### Salvamento Automático
O progresso é salvo automaticamente quando:
- O usuário responde uma pergunta (altera `formData`)
- O usuário navega entre passos (altera `currentStep`)
- O usuário marca/desmarca opções "Não Aplicável" (altera `naFlags`)

### Dados Salvos
Para cada token válido, são salvos:
- Passo atual (`currentStep`)
- Respostas do formulário (`formData`)
- Flags "Não Aplicável" (`naFlags`)
- Timestamp do salvamento

### Carregamento
O progresso salvo é carregado automaticamente quando:
- A página é carregada/recarregada
- O token é validado com sucesso
- Existem dados salvos para aquele token no localStorage

### Limpeza de Dados
Os dados são removidos automaticamente quando:
- A pesquisa é enviada com sucesso
- O usuário clica em "Recomeçar" (após erro de envio)
- Os dados têm mais de 30 dias (expiração automática)

## Implementação Técnica

### Chave de Armazenamento
```javascript
const storageKey = `nps_survey_${token}`
```

Cada token tem sua própria chave no localStorage, permitindo múltiplas pesquisas sem conflito.

### Estrutura dos Dados
```json
{
  "currentStep": 3,
  "formData": {
    "npsScore": 9,
    "overallSatisfaction": "satisfied",
    "receptionService": "very_satisfied",
    ...
  },
  "naFlags": {
    "practicalCarClasses": false,
    "practicalMotoClasses": true,
    ...
  },
  "timestamp": 1700000000000
}
```

### Funções Principais

#### `saveProgress()`
Salva o estado atual no localStorage. Chamada automaticamente pelos watchers.

#### `loadProgress()`
Carrega o progresso salvo ao validar o token. Retorna `true` se carregou com sucesso.

#### `clearProgress()`
Remove os dados do localStorage. Chamada após envio bem-sucedido ou reset.

## Segurança e Privacidade

- Os dados ficam apenas no navegador do usuário (localStorage)
- Cada token tem armazenamento isolado
- Dados expiram após 30 dias
- Dados são limpos após envio bem-sucedido
- Apenas funciona com tokens válidos

## Testando

### Teste 1: Recarga de Página (F5)
1. Acesse a pesquisa com um token válido
2. Responda algumas perguntas e avance até o passo 3-4
3. Pressione F5 ou recarregue a página
4. ✅ Deve voltar no mesmo passo com as respostas preenchidas

### Teste 2: Fechar e Reabrir
1. Responda algumas perguntas
2. Feche a aba/navegador
3. Abra novamente o mesmo link (mesmo token)
4. ✅ Deve continuar de onde parou

### Teste 3: Múltiplas Pesquisas
1. Abra duas abas com tokens diferentes
2. Responda diferentes perguntas em cada
3. Recarregue ambas
4. ✅ Cada uma deve manter seu próprio progresso

### Teste 4: Limpeza Após Envio
1. Complete toda a pesquisa
2. Envie com sucesso
3. Volte ao link da pesquisa
4. ✅ Deve começar do zero (dados limpos)

### Teste 5: Token Inválido
1. Use um token inválido
2. ✅ Não deve carregar nem salvar progresso

## Limitações

- Funciona apenas no mesmo navegador/dispositivo
- Dados podem ser perdidos se o usuário limpar o cache/localStorage
- Limitado ao tamanho do localStorage (~5-10MB dependendo do navegador)
- Não sincroniza entre dispositivos diferentes

## Compatibilidade

Funciona em todos os navegadores modernos que suportam:
- `localStorage` API
- ES6+ (já usado no resto da aplicação)

Navegadores suportados:
- Chrome/Edge 4+
- Firefox 3.5+
- Safari 4+
- Opera 10.5+
- iOS Safari 3.2+
- Android Browser 2.1+
