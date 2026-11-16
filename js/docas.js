'use strict';

(() => {
  const agenda = window.DocaNexoAgenda;
  const dateField = document.getElementById('dock-date');
  const dockFilter = document.getElementById('dock-filter');
  const summary = document.getElementById('dock-summary');
  const grid = document.getElementById('dock-grid');
  const docks = Array.from(dockFilter.options).slice(1).map(option => option.value);
  const slots = agenda.slots;

  dateField.min = agenda.today();
  dateField.value = agenda.firstDateWithBookings(agenda.read(), dateField.min) || dateField.min;

  function render() {
    grid.replaceChildren();
    if (!dateField.validity.valid) {
      summary.textContent = 'Selecione uma data válida a partir de hoje.';
      return;
    }

    const date = dateField.value;
    const bookings = agenda.read();
    const selectedDocks = dockFilter.value ? [dockFilter.value] : docks;
    let available = 0;

    for (const dock of selectedDocks) {
      const card = document.createElement('section');
      card.className = 'ops-card dock-card';
      const title = document.createElement('h2');
      title.textContent = 'Doca ' + dock;
      const list = document.createElement('ul');
      list.className = 'dock-slots';

      for (const time of slots) {
        const conflict = agenda.findConflict(bookings, date, dock, time, 60);
        const occupied = Boolean(conflict);
        const item = document.createElement('li');
        const slot = document.createElement(occupied ? 'span' : 'a');
        slot.className = 'dock-slot' + (occupied ? ' dock-slot-occupied' : '');
        const label = document.createElement('strong');
        label.textContent = time;
        const status = document.createElement('span');
        status.textContent = occupied ? 'Ocupada · ' + conflict.code : 'Livre';
        slot.append(label, status);

        if (!occupied) {
          available++;
          const query = new URLSearchParams({view: 'agenda', date, dock, time});
          slot.href = 'agendamentos.html?' + query;
          slot.setAttribute('aria-label', 'Agendar doca ' + dock + ' às ' + time);
        }
        item.append(slot);
        list.append(item);
      }

      card.append(title, list);
      grid.append(card);
    }
    const total = selectedDocks.length * slots.length;
    const occupied = total - available;
    summary.textContent = available + (available === 1 ? ' livre' : ' livres') +
      ' · ' + occupied + (occupied === 1 ? ' ocupada' : ' ocupadas') + ' em ' + agenda.formatDate(date);
  }

  dateField.addEventListener('change', render);
  dockFilter.addEventListener('change', render);
  window.addEventListener('pageshow', render);
  window.addEventListener('storage', render);
  document.addEventListener('bookings-updated', render);
  render();
})();
