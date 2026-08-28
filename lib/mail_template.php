<?php
/**
 * Monta o corpo HTML do e-mail de notificação de lead,
 * usando a identidade visual da Alliance City América (preto + dourado).
 */

function build_lead_email_html(array $lead, string $logoCid): string
{
    $nome = htmlspecialchars($lead['nome'], ENT_QUOTES, 'UTF-8');
    $whatsapp = htmlspecialchars($lead['whatsapp'], ENT_QUOTES, 'UTF-8');
    $nivel = htmlspecialchars($lead['nivel_label'], ENT_QUOTES, 'UTF-8');
    $data = htmlspecialchars($lead['data'], ENT_QUOTES, 'UTF-8');

    return <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Novo lead - Alliance City América</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0b0c; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0c; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%; background-color:#141416; border-radius:12px; overflow:hidden; border:1px solid #2a2a2d;">
          <tr>
            <td align="center" style="background-color:#0b0b0c; padding:28px 24px;">
              <img src="cid:{$logoCid}" width="180" alt="Alliance City América" style="display:block; max-width:180px; height:auto;">
            </td>
          </tr>
          <tr>
            <td style="height:4px; background: linear-gradient(90deg, #d9a520, #FFC939, #fff6d8, #FFC939, #d9a520); font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <p style="margin:0 0 4px 0; color:#FFC939; font-size:12px; letter-spacing:1px; text-transform:uppercase; font-weight:bold;">Novo contato pelo site</p>
              <h1 style="margin:0 0 20px 0; color:#f4f1ea; font-size:22px; line-height:1.3;">Você recebeu um novo lead</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#b9b6ae; font-size:13px; width:120px;">Nome</td>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#f4f1ea; font-size:15px; font-weight:600;">{$nome}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#b9b6ae; font-size:13px;">WhatsApp</td>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#f4f1ea; font-size:15px; font-weight:600;">{$whatsapp}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#b9b6ae; font-size:13px;">Interesse</td>
                  <td style="padding:12px 0; border-bottom:1px solid #2a2a2d; color:#f4f1ea; font-size:15px; font-weight:600;">{$nivel}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0; color:#b9b6ae; font-size:13px;">Recebido em</td>
                  <td style="padding:12px 0; color:#f4f1ea; font-size:15px;">{$data}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 8px 32px;">
              <a href="https://wa.me/55{$lead['whatsapp_digits']}" style="display:inline-block; background-color:#FFC939; color:#17130a; text-decoration:none; font-weight:bold; font-size:14px; padding:14px 28px; border-radius:8px;">Responder no WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px 32px 32px;">
              <p style="margin:0; color:#6f6c66; font-size:11px; line-height:1.5;">Alliance City América &middot; Av. Anastácio, 1197 &middot; Este e-mail foi gerado automaticamente pelo formulário de contato do site.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}
