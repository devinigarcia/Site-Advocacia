// Gera as páginas estáticas em ./public a partir de ./src e ./dados.json
// Uso: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(raiz, 'dados.json'), 'utf8'));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const paginas = [
  { arquivo: 'index.html', src: 'home.html', titulo: `${d.nome} - ${d.descricao}`, home: true },
  { arquivo: 'quem-somos.html', src: 'quem-somos.html', titulo: `Quem Somos - ${d.nome}` },
  { arquivo: 'nossas-solucoes.html', src: 'nossas-solucoes.html', titulo: `Nossas Soluções - ${d.nome}` },
  { arquivo: 'profissionais.html', src: 'profissionais.html', titulo: `Nossa Equipe - ${d.nome}` },
  { arquivo: 'contato.html', src: 'contato.html', titulo: `Entre em Contato - ${d.nome}` },
  { arquivo: 'politica-de-privacidade.html', src: 'politica-de-privacidade.html', titulo: `Política de Privacidade - ${d.nome}` },
];

const menu = [
  ['index.html', 'Home'],
  ['quem-somos.html', 'Quem Somos'],
  ['nossas-solucoes.html', 'Nossas Soluções'],
  ['profissionais.html', 'Profissionais'],
  ['contato.html', 'Contato'],
];

/* ---------- ícones de linha (SVG) ---------- */
const tracos = {
  sliders: '<path d="M10 6v10M10 24v18M24 6v22M24 36v6M38 6v6M38 20v22"/><circle cx="10" cy="20" r="4"/><circle cx="24" cy="32" r="4"/><circle cx="38" cy="16" r="4"/>',
  grafico: '<path d="M6 40l10-12 8 6 14-16"/><circle cx="6" cy="40" r="2.5"/><circle cx="16" cy="28" r="2.5"/><circle cx="24" cy="34" r="2.5"/><circle cx="38" cy="18" r="2.5"/><path d="M17 5v15M21 8h-5.5a2.5 2.5 0 000 5h3a2.5 2.5 0 010 5H13"/>',
  documento: '<path d="M12 6h18l8 8v28H12z"/><path d="M30 6v8h8"/><path d="M17 6v17l4-3 4 3V6"/>',
  alvo: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2.5"/><path d="M24 2v6M24 40v6M2 24h6M40 24h6"/>',
  livro: '<path d="M6 10h14a4 4 0 014 4v26a4 4 0 00-4-4H6zM42 10H28a4 4 0 00-4 4v26a4 4 0 014-4h14z"/><path d="M11 17h8M11 23h8M29 17h8M29 23h8"/>',
  aviao: '<path d="M44 4L4 20l14 6 6 14z"/><path d="M44 4L18 26"/>',
  comentario: '<path d="M6 8h36v24H22l-10 8v-8H6z"/><path d="M14 16h20M14 23h12"/>',
  chat: '<path d="M4 8h26v18H16l-7 6v-6H4z"/><path d="M34 16h10v18h-5v6l-7-6H20v-4"/>',
  'pessoa-moeda': '<circle cx="18" cy="12" r="7"/><path d="M4 42v-6a14 14 0 0122-11"/><circle cx="34" cy="34" r="10"/><path d="M34 28v12M37 31h-4.5a2 2 0 000 4h3a2 2 0 010 4H31"/>',
  'pessoa-fala': '<circle cx="16" cy="18" r="7"/><path d="M2 44v-4a14 14 0 0128 0v4"/><path d="M26 4h18v14h-8l-5 5v-5h-5z"/>',
  pin: '<path d="M24 34S12 22 12 14a12 12 0 0124 0c0 8-12 20-12 20z"/><circle cx="24" cy="14" r="4"/><path d="M14 32l-8 12h36l-8-12"/>',
};
const icone = (n) =>
  `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${tracos[n] ?? ''}</svg>`;

const chevron = (cls = '') =>
  `<svg class="chev ${cls}" viewBox="0 0 100 70" aria-hidden="true"><path d="M0 0h72l28 70H78L56 16H6z"/></svg>`;

/* ---------- blocos reutilizados ---------- */
const logo = (cls = '') =>
  d.logo
    ? `<img class="logo-img ${cls}" src="${esc(d.logo)}" alt="${esc(d.nome)}">`
    : `<span class="logo-txt ${cls}" aria-label="${esc(d.nome)}"><b>${esc(d.sigla.toUpperCase())}</b>${d.sufixoLogo ? `<i>${esc(d.sufixoLogo)}</i>` : ''}</span>`;

const whatsappUrl = `https://api.whatsapp.com/send/?phone=${encodeURIComponent(d.whatsapp)}`;

const redes = () => {
  const itens = [
    ['linkedin', 'fa-linkedin-in', 'LinkedIn', d.redes.linkedin],
    ['instagram', 'fa-instagram', 'Instagram', d.redes.instagram],
    ['facebook', 'fa-facebook', 'Facebook', d.redes.facebook],
    ['whatsapp', 'fa-whatsapp', 'WhatsApp', d.whatsapp ? whatsappUrl : ''],
  ];
  return itens
    .filter(([, , , url]) => url)
    .map(([, fa, rot, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${rot}"><i class="fa-brands ${fa}"></i></a>`)
    .join('');
};

const img = (chave) => (d.imagens[chave] ? ` style="--img:url('${esc(d.imagens[chave])}')"` : '');

const cartao = (p, modo) => {
  const cargo = modo === 'oab' ? p.oab : p.titulo;
  const texto = modo === 'bio' ? p.bio : modo === 'curta' ? p.bioCurta ?? p.bio : '';
  return `<article class="membro">
        <div class="foto"><img src="${esc(p.foto)}" alt="${esc(p.nome)}" loading="lazy"></div>
        <h3>${esc(p.nome)}</h3>
        <div class="cargo">${esc(cargo)}</div>${texto ? `\n        <p class="bio">${esc(texto)}</p>` : ''}
      </article>`;
};

const juntar = (nomes) => (nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0] ?? '');

const parciais = {
  banner: (arg) => {
    const [a, b] = arg.split('|');
    return `<section class="banner">
  <div class="container"><h1>${a} <mark>${b}</mark></h1></div>
  ${chevron()}
</section>`;
  },

  // Equipe: "socios-oab" | "lideres" | "socios" | "demais"
  equipe: (arg) => {
    const socios = d.equipe.filter((p) => p.socio);
    if (arg === 'socios-oab') return socios.map((p) => cartao(p, 'oab')).join('\n      ');
    if (arg === 'lideres') return d.equipe.filter((p) => p.lider).map((p) => cartao(p, 'curta')).join('\n      ');
    if (arg === 'socios') return socios.map((p) => cartao(p, 'bio')).join('\n      ');
    return d.equipe.filter((p) => !p.socio).map((p) => cartao(p, 'bio')).join('\n      ');
  },

  enderecos: () =>
    d.enderecos
      .map(
        (e) => `<div class="endereco">
        ${icone('pin')}
        <h3>${esc(e.estado)}</h3>
        <div class="tipo">${esc(e.tipo)}</div>
        <p>${esc(e.linha1)}<br>${esc(e.linha2)}</p>
      </div>`
      )
      .join('\n      '),

  redes: () => redes(),

  contatos: (arg) => `<ul class="contatos">
        <li><i class="fa-solid fa-phone"></i>${esc(d.telefones)}</li>
        <li><i class="fa-solid fa-envelope"></i><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></li>${
          arg === 'sem-endereco' ? '' : `\n        <li><i class="fa-solid fa-location-dot"></i>${esc(d.endereco)}</li>`
        }
      </ul>`,

  mapa: () =>
    d.mapaEmbed
      ? `<div class="mapa"><iframe src="${esc(d.mapaEmbed)}" loading="lazy" title="Mapa" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
      : `<div class="mapa vazio">Mapa do Google (definir "mapaEmbed" em dados.json)</div>`,

  form: () =>
    `<form class="form" id="form-contato" action="${esc(d.formulario.action)}" method="post" data-email="${esc(d.email)}" novalidate>
        <input type="text" name="empresa" placeholder="Nome da Empresa:" aria-label="Nome da Empresa" required>
        <input type="text" name="cnpj" placeholder="CNPJ:" aria-label="CNPJ" inputmode="numeric" required>
        <input type="text" name="contato" placeholder="Nome do Contato:" aria-label="Nome do Contato" required>
        <input type="tel" name="telefone" placeholder="Telefone (DDD):" aria-label="Telefone com DDD" required>
        <textarea name="objeto" placeholder="Objeto da consulta:" aria-label="Objeto da consulta" required></textarea>
        <textarea class="uma-linha" name="origem" rows="1" placeholder="Por qual meio teve conhecimento do nosso trabalho?" aria-label="Por qual meio teve conhecimento do nosso trabalho?"></textarea>
        <button type="submit">Enviar</button>
        <p class="form-msg" role="status" aria-live="polite"></p>
      </form>`,

  // Faixa "Pronto para Superar Desafios?" — "home" usa o título maior e omite o endereço
  cta: (arg) => `<section class="cta${arg === 'home' ? ' cta-home' : ''}">
  <div class="container cta-grid">
    <div class="cta-texto">
      ${chevron('chev-ico')}
      <h2>Pronto para <mark>Superar</mark> Desafios?</h2>
      <h3>Estamos prontos para apoiar sua empresa!</h3>
      <p>Se sua empresa enfrenta desafios, estamos aqui para ajudar. Converse com nossos especialistas e entenda como nossa abordagem estratégica pode abrir novos caminhos para o seu negócio.</p>
    </div>
    <div class="cta-contato">
      <h4>${arg === 'home' ? 'Informações de contato:' : 'Entre em contato:'}</h4>
      ${parciais.contatos(arg === 'home' ? 'sem-endereco' : '')}
      <a class="btn-txt branco" href="contato.html">Fale com um Especialista <i class="fa-solid fa-arrow-right-long"></i></a>
    </div>
  </div>
</section>`,

  citacao: (arg) => `<section class="citacao${arg ? ' ' + arg : ''} com-img"${img('fundoEscuro')}>
  <div class="container"><h2>Não somos apenas advogados. <br>Somos estrategistas, parceiros e <br><mark>solucionadores de problemas.</mark></h2></div>
</section>`,

  chevron: (arg) => chevron(arg),
  logo: (arg) => logo(arg),
  img: (arg) => img(arg),
};

const computados = {
  lideres: juntar(d.equipe.filter((p) => p.lider).map((p) => p.nome)),
  whatsappUrl,
};

const valor = (k) => (k in computados ? computados[k] : k.split('.').reduce((o, p) => (o == null ? o : o[p]), d));

const render = (tpl) =>
  tpl
    .replace(/\{\{>\s*([\w-]+)\s*([^}]*)\}\}/g, (_, n, arg) => (parciais[n] ? parciais[n](arg.trim()) : ''))
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => icone(n))
    .replace(/\{\{([\w.]+)\}\}/g, (_, k) => esc(valor(k)));

/* ---------- moldura comum (cabeçalho, menu, rodapé, avisos) ---------- */
const moldura = (pg, corpo) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pg.titulo)}</title>
  <meta name="description" content="${esc(d.nome)} - ${esc(d.descricao)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body${pg.home ? ' class="home"' : ''}>

<header class="topo" id="topo">
  <div class="topo-in">
    <nav class="redes" aria-label="Redes sociais">${redes()}</nav>
    <a class="topo-logo" href="index.html">${logo()}</a>
    <button class="hamb" id="abrir-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span></button>
  </div>
</header>

<div class="menu" id="menu" aria-hidden="true">
  <div class="menu-topo">
    <a href="index.html">${logo()}</a>
    <button class="fechar" id="fechar-menu" aria-label="Fechar menu"></button>
  </div>
  <ul>
    ${menu.map(([href, rot]) => `<li><a href="${href}"${href === pg.arquivo ? ' aria-current="page"' : ''}>${rot}</a></li>`).join('\n    ')}
  </ul>
</div>

<main>
${corpo}
</main>

<footer class="rodape">
  <div class="container rodape-grid">
    <p>Copyright © ${esc(d.anoCopyright)}<br>${esc(d.nome)}</p>
    <a href="index.html">${logo('grande')}</a>
    <p class="dir">Todos os direitos reservados.${d.desenvolvidoPor ? `<br>Desenvolvido por ${esc(d.desenvolvidoPor)}` : ''}</p>
  </div>
</footer>

${d.whatsapp ? `<a class="zap" href="${esc(whatsappUrl)}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ''}

<div class="cookie" id="cookie" hidden>
  <strong>Política de Privacidade</strong>
  <p>Utilizamos cookies para fornecer a melhor experiência em nosso site. Ao aceitar, você concorda com o uso desses cookies. <a href="politica-de-privacidade.html">Política de Privacidade ${esc(d.nome)}</a></p>
  <button type="button" id="aceitar-cookie">Aceitar</button>
</div>
<script src="assets/js/main.js"></script>
</body>
</html>
`;

const saida = join(raiz, 'public');
mkdirSync(saida, { recursive: true });
for (const pg of paginas) {
  const corpo = render(readFileSync(join(raiz, 'src', pg.src), 'utf8'));
  writeFileSync(join(saida, pg.arquivo), moldura(pg, corpo.trim()), 'utf8');
  console.log('gerado: public/' + pg.arquivo);
}
