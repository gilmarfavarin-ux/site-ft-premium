export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contato') {
      if (request.method === 'OPTIONS') return cors();
      if (request.method === 'POST') return handleForm(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleForm(request, env) {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };

  let data;
  try { data = await request.json(); }
  catch { return Response.json({ ok: false, error: 'Payload inválido.' }, { status: 400, headers }); }

  for (const f of ['nome', 'empresa', 'email', 'telefone']) {
    if (!data[f]?.trim()) {
      return Response.json({ ok: false, error: `Campo obrigatório: ${f}` }, { status: 400, headers });
    }
  }

  const toEmail = env.CONTACT_EMAIL || 'contato@ftconsult.com.br';

  const body = JSON.stringify({
    personalizations: [{ to: [{ email: toEmail, name: 'FT Consult' }] }],
    from: { email: 'noreply@ftconsult.com.br', name: 'Site FT Consult' },
    reply_to: { email: data.email, name: data.nome },
    subject: `Novo lead: ${data.nome} — ${data.empresa}`,
    content: [{
      type: 'text/html',
      value: `<h2>Novo diagnóstico solicitado</h2>
        <p><b>Nome:</b> ${esc(data.nome)}</p>
        <p><b>Empresa:</b> ${esc(data.empresa)}</p>
        <p><b>E-mail:</b> ${esc(data.email)}</p>
        <p><b>Telefone:</b> ${esc(data.telefone)}</p>
        <p><b>Colaboradores:</b> ${esc(data.usuarios || '—')}</p>
        <p><b>Plataforma:</b> ${esc(data.plataforma || '—')}</p>
        <p><b>Desafio:</b> ${esc(data.desafio || '—')}</p>`
    }],
  });

  try {
    const r = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    if (!r.ok && r.status !== 202) throw new Error(r.status);
  } catch (e) {
    return Response.json({ ok: false, error: 'Erro ao enviar e-mail.' }, { status: 500, headers });
  }

  return Response.json({ ok: true }, { headers });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
function cors() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
