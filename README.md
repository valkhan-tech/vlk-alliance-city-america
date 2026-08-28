# vlk-alliance-city-america

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