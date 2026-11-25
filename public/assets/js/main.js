(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // localStorage pode falhar (modo privado, file://) — nunca quebrar a página por isso
  function ler(store, chave) { try { return window[store].getItem(chave); } catch (e) { return null; } }
  function gravar(store, chave, valor) { try { window[store].setItem(chave, valor); } catch (e) { /* ignora */ } }

  /* ---------- cabeçalho com sombra ao rolar ---------- */
  var topo = $('topo');
  function aoRolar() { topo.classList.toggle('rolou', window.scrollY > 10); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------- menu ---------- */
  var menu = $('menu');
  var abrir = $('abrir-menu');
  function alternarMenu(aberto) {
    menu.classList.toggle('aberto', aberto);
    menu.setAttribute('aria-hidden', String(!aberto));
    abrir.setAttribute('aria-expanded', String(aberto));
    document.body.style.overflow = aberto ? 'hidden' : '';
  }
  abrir.addEventListener('click', function () { alternarMenu(true); });
  $('fechar-menu').addEventListener('click', function () { alternarMenu(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('li a')) alternarMenu(false); });

  /* ---------- aviso de cookies ---------- */
  var cookie = $('cookie');
  if (cookie && !ler('localStorage', 'cookies-aceitos')) {
    cookie.hidden = false;
    $('aceitar-cookie').addEventListener('click', function () {
      gravar('localStorage', 'cookies-aceitos', '1');
      cookie.hidden = true;
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') alternarMenu(false);
  });

  /* ---------- entrada suave das seções ---------- */
  var alvos = document.querySelectorAll('.sec .container > *, .cta-grid > *, .citacao h2, .faixa .container');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (item.isIntersecting) { item.target.classList.add('visivel'); obs.unobserve(item.target); }
      });
    }, { threshold: 0.08 });
    alvos.forEach(function (el) { el.classList.add('revelar'); obs.observe(el); });
  }

  /* ---------- formulário de contato ---------- */
  var form = $('form-contato');
  if (form) {
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      var campos = form.querySelectorAll('[required]');
      var ok = true;
      campos.forEach(function (c) {
        var vazio = !c.value.trim();
        c.classList.toggle('erro', vazio);
        if (vazio) ok = false;
      });
      if (!ok) {
        e.preventDefault();
        msg.textContent = 'Preencha os campos obrigatórios.';
        msg.className = 'form-msg falha';
        return;
      }
      // Com "formulario.action" definido em dados.json, o envio segue normalmente para esse endereço.
      if (form.getAttribute('action')) return;

      // Sem serviço de envio configurado: abre o programa de e-mail do visitante com a mensagem pronta.
      e.preventDefault();
      var v = function (n) { return form.elements[n].value.trim(); };
      var corpo = [
        'Nome da Empresa: ' + v('empresa'),
        'CNPJ: ' + v('cnpj'),
        'Nome do Contato: ' + v('contato'),
        'Telefone: ' + v('telefone'),
        '',
        'Objeto da consulta:',
        v('objeto'),
        '',
        'Como conheceu o escritório: ' + v('origem')
      ].join('\n');
      window.location.href = 'mailto:' + form.dataset.email +
        '?subject=' + encodeURIComponent('Contato pelo site - ' + v('empresa')) +
        '&body=' + encodeURIComponent(corpo);
      msg.textContent = 'Abrimos o seu programa de e-mail com a mensagem pronta para envio.';
      msg.className = 'form-msg';
    });
  }
})();
