import { formatCurrency, formatDate } from './format';

/**
 * Exporta uma Ordem de Serviço como PDF via janela de impressão do browser.
 * Não requer dependências externas — usa HTML/CSS puro.
 *
 * @param {object} ordem   - Objeto da OS (com clientes join)
 * @param {number} numero  - Número sequencial da OS (1, 2, 3...)
 */
export function exportarOSPDF(ordem, numero) {
  const numFormatado = `OS-${String(numero).padStart(3, '0')}`;

  // ── Dados do cliente ─────────────────────────────────────────────────
  const nomeCliente   = ordem.clientes?.nome     || '—';
  const emailCliente  = ordem.clientes?.email    || '—';
  const telCliente    = ordem.clientes?.telefone || '—';

  // ── Dados da OS ───────────────────────────────────────────────────────
  const descricao     = ordem.descricao   || '—';
  const equipamento   = ordem.tipo_equipamento || '—';
  const valor         = formatCurrency(ordem.valor);
  const dataCriacao   = formatDate(ordem.created_at);

  // ── Gera HTML do documento ────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${numFormatado} – Ordem de Serviço</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 36px 48px;
    }

    /* ── Cabeçalho ─── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #00d4ff;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .header-brand { font-size: 22px; font-weight: 800; color: #00d4ff; letter-spacing: -0.04em; }
    .header-brand span { color: #1a1a2e; }
    .header-sub { font-size: 10px; color: #666; margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }
    .os-number {
      text-align: right;
      font-size: 26px;
      font-weight: 900;
      color: #1a1a2e;
      letter-spacing: -0.03em;
    }
    .os-number .label { font-size: 10px; color: #888; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 2px; }
    .os-date { font-size: 11px; color: #666; text-align: right; margin-top: 4px; }

    /* ── Seções ─── */
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #00a8cc;
      border-bottom: 1px solid #e8f4f8;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }

    /* ── Grid de campos ─── */
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; }
    .fields-grid.three { grid-template-columns: 1fr 1fr 1fr; }
    .field { }
    .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; margin-bottom: 3px; }
    .field-value { font-size: 13px; font-weight: 500; color: #1a1a2e; word-break: break-word; }
    .field-value.big { font-size: 20px; font-weight: 800; color: #009963; }

    /* ── Descrição / Histórico ─── */
    .descricao-box {
      background: #f7fbfe;
      border: 1px solid #d0e8f2;
      border-radius: 8px;
      padding: 14px 18px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 13px;
      line-height: 1.7;
      color: #1a1a2e;
    }


    /* ── Rodapé ─── */
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #aaa;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 20px 32px; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>

  <!-- Cabeçalho -->
  <div class="header">
    <div>
      <div class="header-brand">Tec<span>Fix</span> ERP</div>
      <div class="header-sub">Sistema de Gestão de Ordens de Serviço</div>
    </div>
    <div>
      <div class="os-number">
        <span class="label">Número da OS</span>
        ${numFormatado}
      </div>
      <div class="os-date">Emitida em ${dataCriacao}</div>
    </div>
  </div>

  <!-- Dados do Cliente -->
  <div class="section">
    <div class="section-title">Dados do Cliente</div>
    <div class="fields-grid three">
      <div class="field">
        <div class="field-label">Nome</div>
        <div class="field-value">${nomeCliente}</div>
      </div>
      <div class="field">
        <div class="field-label">E-mail</div>
        <div class="field-value">${emailCliente}</div>
      </div>
      <div class="field">
        <div class="field-label">Telefone</div>
        <div class="field-value">${telCliente}</div>
      </div>
    </div>
  </div>

  <!-- Dados do Equipamento -->
  <div class="section">
    <div class="section-title">Equipamento</div>
    <div class="fields-grid">
      <div class="field">
        <div class="field-label">Tipo de Equipamento</div>
        <div class="field-value">${equipamento}</div>
      </div>
    </div>
  </div>

  <!-- Descrição / Histórico -->
  <div class="section">
    <div class="section-title">Descrição / Histórico do Serviço</div>
    <div class="descricao-box">${escapeHtml(descricao)}</div>
  </div>

  <!-- Valor do Serviço -->
  <div class="section">
    <div class="section-title">Financeiro</div>
    <div class="fields-grid">
      <div class="field">
        <div class="field-label">Valor do Serviço</div>
        <div class="field-value big">${valor}</div>
      </div>
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer">
    <span>TecFix ERP – Documento gerado automaticamente</span>
    <span>${numFormatado} · ${new Date().toLocaleString('pt-BR')}</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  // Abre em nova aba e dispara o diálogo de impressão / salvar PDF
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up bloqueado pelo navegador. Permita pop-ups para este site e tente novamente.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

/** Escapa HTML para evitar XSS no conteúdo livre (descrição) */
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
