'use strict';

try {
  if (sessionStorage.getItem('dn-intro')) {
    document.documentElement.classList.add('intro-seen');
  } else {
    sessionStorage.setItem('dn-intro', '1');
  }
} catch {
  // A entrada continua funcionando quando o navegador bloqueia o armazenamento.
}
