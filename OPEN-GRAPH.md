# Open Graph Image

Para o preview funcionar perfeitamente no WhatsApp, crie uma imagem chamada `og-image.jpg` na pasta `public/` com estas características:

## 📐 Especificações da imagem:

- **Tamanho**: 1200x630 pixels (formato landscape)
- **Formato**: JPG ou PNG
- **Peso**: Máximo 300KB
- **Conteúdo sugerido**:
  - Logo da Autoescola Modelo
  - Texto: "Pesquisa de Satisfação"
  - Subtexto: "Sua opinião é importante!"
  - Background com as cores da marca

## 🎨 Exemplo de layout:

```
┌─────────────────────────────────────────┐
│  [LOGO]     AUTOESCOLA MODELO           │
│                                         │
│     📊 PESQUISA DE SATISFAÇÃO           │
│                                         │
│    Sua opinião é muito importante       │
│         para nós!                       │
│                                         │
│    ⏱️ Leva apenas 3 minutos             │
└─────────────────────────────────────────┘
```

## 🚀 Como adicionar:

1. Crie a imagem no Canva, Figma ou Photoshop
2. Salve como `og-image.jpg`
3. Coloque na pasta `public/og-image.jpg`
4. Faça commit e deploy

## 🔧 Alternativa rápida:

Se não tiver imagem agora, remova essas linhas do `index.html`:

```html
<meta property="og:image" content="https://pesquisa.vempramodelo.com/og-image.jpg" />
<meta property="twitter:image" content="https://pesquisa.vempramodelo.com/og-image.jpg" />
```

O preview vai funcionar só com título e descrição.

## ✅ Resultado no WhatsApp:

Depois das alterações, o link vai aparecer assim:

```
📊 Pesquisa de Satisfação - Autoescola Modelo
Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação. Leva apenas 3 minutos.
[IMAGEM se tiver]
pesquisa.vempramodelo.com
```

Muito mais profissional! 🎉