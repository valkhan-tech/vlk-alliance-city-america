<?php
/**
 * Endpoint do formulário de contato.
 * Recebe os dados via POST (fetch/AJAX), valida, aplica travas anti-spam
 * (honeypot + tempo mínimo de preenchimento) e envia o lead por e-mail via PHPMailer.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/lib/env.php';
require __DIR__ . '/lib/mail_template.php';
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método não permitido.', 405);
}

load_env(__DIR__ . '/.env');

// --- Honeypot: campo invisível que só bots preenchem ---
// Se vier preenchido, respondemos como se tivesse dado certo (falso positivo),
// para não dar pista ao bot de que foi bloqueado, mas não enviamos e-mail nenhum.
$honeypot = trim((string) ($_POST['website'] ?? ''));
if ($honeypot !== '') {
    respond(true, 'Recebemos seus dados! Em breve entraremos em contato.');
}

// --- Tempo mínimo de preenchimento ---
$minSeconds = (int) env('MIN_FILL_SECONDS', 4);
$loadedAt = (int) ($_POST['form_loaded_at'] ?? 0);
$now = time();
if ($loadedAt <= 0 || ($now - $loadedAt) < $minSeconds) {
    // Também tratado como falso positivo: bot recebe "sucesso" mas nada é enviado.
    respond(true, 'Recebemos seus dados! Em breve entraremos em contato.');
}

// --- Validação básica dos campos ---
$nome = trim((string) ($_POST['nome'] ?? ''));
$whatsapp = trim((string) ($_POST['whatsapp'] ?? ''));
$nivel = trim((string) ($_POST['nivel'] ?? ''));
$periodo = trim((string) ($_POST['periodo'] ?? ''));

$niveis = [
    'iniciante' => 'Nunca treinei',
    'intermediario' => 'Já treinei antes',
    'crianca' => 'É para meu filho(a)',
    'particular' => 'Aula particular',
];

$periodos = [
    'manha' => 'Manhã',
    'tarde' => 'Tarde',
    'noite' => 'Noite',
];

$erros = [];

if (mb_strlen($nome) < 2 || mb_strlen($nome) > 100) {
    $erros[] = 'Informe um nome válido.';
}

$whatsappDigits = preg_replace('/\D+/', '', $whatsapp);
if (strlen($whatsappDigits) !== 11) {
    $erros[] = 'Informe um WhatsApp válido com DDD e 11 dígitos.';
}

if (!array_key_exists($nivel, $niveis)) {
    $erros[] = 'Selecione uma opção de interesse válida.';
}

if (!array_key_exists($periodo, $periodos)) {
    $erros[] = 'Selecione um período de preferência válido.';
}

if ($erros) {
    respond(false, implode(' ', $erros), 422);
}

// --- Monta e envia o e-mail ---
$lead = [
    'nome' => $nome,
    'whatsapp' => $whatsapp,
    'whatsapp_digits' => $whatsappDigits,
    'nivel_label' => $niveis[$nivel],
    'periodo_label' => $periodos[$periodo],
    'data' => date('d/m/Y H:i'),
];

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = (string) env('SMTP_HOST');
    $mail->Port = (int) env('SMTP_PORT', 587);
    $mail->SMTPAuth = filter_var(env('SMTP_AUTH', true), FILTER_VALIDATE_BOOLEAN);
    $mail->Username = (string) env('SMTP_USERNAME');
    $mail->Password = (string) env('SMTP_PASSWORD');

    $secure = strtolower((string) env('SMTP_SECURE', 'tls'));
    if ($secure === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($secure === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = false;
        $mail->SMTPAutoTLS = false;
    }

    $mail->CharSet = 'UTF-8';

    $mail->setFrom((string) env('MAIL_FROM'), (string) env('MAIL_FROM_NAME', 'Site'));
    $mail->addReplyTo((string) env('MAIL_FROM'), (string) env('MAIL_FROM_NAME', 'Site'));

    $destinatarios = array_filter(array_map('trim', explode(',', (string) env('MAIL_TO'))));
    foreach ($destinatarios as $destinatario) {
        $mail->addAddress($destinatario, (string) env('MAIL_TO_NAME', ''));
    }

    $logoPath = __DIR__ . '/assets/img/alliance-emblem-stacked.svg';
    $logoCid = 'logo-alliance';
    if (is_file($logoPath)) {
        $mail->addEmbeddedImage($logoPath, $logoCid, 'logo.svg', PHPMailer::ENCODING_BASE64, 'image/svg+xml');
    }

    $mail->isHTML(true);
    $mail->Subject = (string) env('MAIL_SUBJECT', 'Novo lead pelo site');
    $mail->Body = build_lead_email_html($lead, $logoCid);
    $mail->AltBody = sprintf(
        "Novo lead pelo site\nNome: %s\nWhatsApp: %s\nInteresse: %s\nPeríodo de preferência: %s\nRecebido em: %s",
        $lead['nome'],
        $lead['whatsapp'],
        $lead['nivel_label'],
        $lead['periodo_label'],
        $lead['data']
    );

    $mail->send();

    respond(true, 'Recebemos seus dados! Em breve entraremos em contato.');
} catch (PHPMailerException $e) {
    error_log('Falha ao enviar e-mail de contato: ' . $mail->ErrorInfo);
    respond(false, 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.', 500);
}
