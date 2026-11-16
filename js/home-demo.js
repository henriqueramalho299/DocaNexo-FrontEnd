'use strict';

(() => {
  const agenda = window.DocaNexoAgenda;
  const rows = document.getElementById('home-bookings');

  function render() {
    const bookings = agenda.read().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    rows.replaceChildren();
    if (!bookings.length) {
      const cell = rows.insertRow().insertCell();
      cell.colSpan = 4;
      cell.textContent = 'Nenhuma reserva registrada.';
    }
    for (const {code, date, time, dock, duration} of bookings.slice(0, 4)) {
      const row = rows.insertRow();
      [code, agenda.formatDate(date), time + '–' + agenda.endTime(time, duration), dock]
        .forEach(value => { row.insertCell().textContent = value; });
    }
  }

  const controls = document.querySelectorAll('[data-demo-time]');
  controls.forEach(control => control.addEventListener('click', () => {
    const time = control.dataset.demoTime;
    const {score, category} = window.calcularImpacto(8, 4, time === '07:00' ? 30 : 0, 0);
    document.getElementById('journey-window').textContent = time + '–' + agenda.endTime(time, 60);
    document.getElementById('journey-time').textContent = time;
    document.getElementById('journey-score').textContent = score;
    document.getElementById('journey-level').textContent = category;
    document.getElementById('journey-comparison').textContent = time === '07:00'
      ? 'Às 10:00, o mesmo cenário cai para 24 (Baixo).'
      : 'Às 07:00, o mesmo cenário sobe para 54 (Moderado).';
    const meter = document.querySelector('.journey-meter');
    meter.value = score;
    meter.textContent = score + ' de 100';
    controls.forEach(button => button.setAttribute('aria-pressed', String(button === control)));
  }));

  window.addEventListener('pageshow', render);
  window.addEventListener('storage', render);
  render();
})();
