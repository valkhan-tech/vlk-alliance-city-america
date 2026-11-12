# vlk-alliance-city-america

## Fotos e galeria

A galeria em `index.html#galeria` contém 18 fotos selecionadas de `referencia/`,
com legendas e categorias: espaço, Jiu Jitsu infantil, aprendizado e convivência.
As fotos e legendas estão no HTML para funcionar também sem JavaScript. O arquivo
`assets/js/gallery.js` acrescenta filtros e ampliação com setas, Escape e retorno
do foco à foto de origem.

As versões publicadas ficam em `assets/img/photos/`: WebP e JPEG progressivo,
com larguras de até 480, 960 e 1600 px, sem ampliar originais menores. As imagens
usam `picture`, `srcset`, `sizes`, dimensões explícitas e carregamento tardio,
exceto a imagem principal, que recebe prioridade alta. Os originais são preservados;
não é necessário publicar a pasta `referencia/`.

Para regenerar as versões (a partir da raiz do repositório):

```sh
python -m pip install Pillow
python scripts/optimize-images.py
```

O script aplica a orientação EXIF, remove metadados e registra a origem e as
dimensões em `assets/img/photos/manifest.json`. Ao trocar uma foto ou legenda,
atualize também seu texto alternativo e os dados estruturados `ImageGallery` no HTML.
Não há etapa de build nem dependência Python no servidor de produção.

## Formulário de contato (PHP + PHPMailer)

O formulário da seção "Contato" (`#contato`) envia os dados via `fetch` para `contact.php`,
que valida, aplica travas anti-spam e dispara um e-mail estilizado com PHPMailer.

### Instalação no servidor

1. Instale as dependências PHP:
   ```
   composer install --no-dev
   ```
2. Copie `.env.example` para `.env` e preencha com os dados reais de SMTP:
   ```
   cp .env.example .env
   ```
3. Garanta que `.env` e `vendor/` **não** sejam servidos publicamente fora do necessário
   (o `.env` nunca deve ser acessível via URL — no Apache/Nginx, bloqueie arquivos `.env`).

### Proteções anti-spam

- **Honeypot**: campo `website`, oculto via CSS (fora da tela), que só bots preenchem.
  Se vier preenchido, o back-end responde como sucesso (falso positivo) mas não envia e-mail.
- **Tempo mínimo de preenchimento**: `form_loaded_at` guarda o timestamp de quando o formulário
  carregou; envios mais rápidos que `MIN_FILL_SECONDS` (padrão 4s) também recebem falso positivo.
- **Validação básica**: nome e WhatsApp (com DDD) são validados tanto no front-end quanto no PHP.

### E-mail

O template (`lib/mail_template.php`) usa a identidade visual da marca (fundo preto, dourado)
e o emblema da Alliance City América embutido via CID (`assets/img/alliance-emblem-stacked.svg`).
