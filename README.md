# Albert Taylon — Landing Page

Landing page de captação para a comunidade de trading do Albert Taylon
([@alberttaylon_](https://www.instagram.com/alberttaylon_/)).

HTML, CSS e JavaScript puros. Sem build, sem dependências.

## Rodar localmente

```bash
python3 -m http.server 4173
```

Depois abra <http://localhost:4173>.

## Estrutura

```
index.html      página inteira
styles.css      estilos (paleta navy + dourado)
script.js       ticker, candlesticks de fundo, reveal, eventos do pixel
assets/
  logo.svg      coroa vetorizada, com gradiente dourado
  logo-mono.svg mesma coroa em currentColor
  *.jpg         fotos
```

## Seções

Ticker de cotações → hero → história em 4 atos → 3 pilares do método →
qualificação ("pra quem é / pra quem não é") → CTA → rodapé com aviso de risco.

## Notas de implementação

**Reveal e animações protegidos contra aba oculta.** O Chrome congela
transições e animações CSS em abas em segundo plano. Como tráfego de anúncio
costuma abrir link em aba nova, o CSS só esconde o conteúdo depois que o JS
confirma que consegue animar (`.js-anim` no `<html>`), e revela sem animar
quando `document.visibilityState` não está `visible`. Sem isso a página
apareceria em branco para parte dos visitantes.

**Logo vetorizada do JPG original** por traçado programático (threshold,
crack-following, Douglas-Peucker), com 98,76% de IoU contra a imagem de
origem, e depois simetrizada. A coroa é uma peça contínua: as pontas laterais
se fundem com os braços centrais, por isso é um único path com furo em
`fill-rule="evenodd"`.

**Candlesticks de fundo** gerados por hash determinístico (seno), não por
`Math.random`, para o desenho não mudar a cada carregamento.

## Pendências

- [ ] **Ticker exibe cotações estáticas inventadas.** Ligar numa API de cotação
      (Twelve Data, Finnhub) ou remover a barra. Não deve ir ao ar como está.
- [ ] `+X anos operando` nas estatísticas ainda é placeholder.
- [ ] O ato 03 da história ("perdi dinheiro...") precisa ser confirmado ou
      corrigido pelo Albert. O resto do texto vem da bio pública dele.
- [ ] Fotos: só existem duas, cada uma usada em dois lugares.
- [ ] Uma das fotos tem marca d'água "Meta AI"; o enquadramento esconde, mas o
      ideal é o original limpo.
- [ ] Link do YouTube, se houver canal.

## Meta Pixel

O pixel do navegador (`2235096414006813`) está no `<head>` e dispara `Lead`
nos botões de WhatsApp e `SocialClick` no Instagram.

A Conversions API **não** está implementada. Se for implementar, o token vai em
variável de ambiente num endpoint server-side — nunca no HTML, que é público.
