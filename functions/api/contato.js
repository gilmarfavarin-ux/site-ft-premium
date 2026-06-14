export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Payload inválido.' }, { status: 400, headers: corsHeaders });
  }

  const required = ['nome', 'empresa', 'email', 'telefone'];
  for (const field of required) {
    if (!data[field]?.trim()) {
      return Response.json({ ok: false, error: `Campo obrigatório: ${field}` }, { status: 400, headers: corsHeaders });
    }
  }

  const toEmail = env.CONTACT_EMAIL || 'contato@ftconsult.com.br';

  const htmlBody = `
    <h2 style="color:#00ABFF">Novo diagnóstico solicitado — FT Consult</h2>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff;width:160px">Nome</td><td style="padding:10px">${esc(data.nome)}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">Empresa</td><td style="padding:10px">${esc(data.empresa)}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">E-mail</td><td style="padding:10px">${esc(data.email)}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">Telefone</td><td style="padding:10px">${esc(data.telefone)}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">Colaboradores</td><td style="padding:10px">${esc(data.usuarios || '—')}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">Plataforma</td><td style="padding:10px">${esc(data.plataforma || '—')}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;background:#f3f8ff">Desafio</td><td style="padding:10px;white-space:pre-wrap">${esc(data.desafio || '—')}</td></tr>
    </table>
  `;

  const emailPayload = {
    personalizations: [{ to: [{ email: toEmail, name: 'FT Consult' }] }],
    from: { email: 'noreply@ftconsult.com.br', name: 'Site FT Consult' },
    reply_to: { email: data.email, name: data.nome },
    subject: `Novo lead: ${data.nome} — ${data.empresa}`,
    content: [{ type: 'text/html', value: htmlBody }],
  };

  try {
    const mailRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!mailRes.ok && mailRes.status !== 202) {
      throw new Error(`MailChannels status: ${mailRes.status}`);
    }
  } catch (err) {
    console.error('Email send error:', err);
    return Response.json(
      { ok: false, error: 'Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.' },
      { status: 500, headers: corsHeaders }
    );
  }

  return Response.json({ ok: true }, { headers: corsHeaders });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
