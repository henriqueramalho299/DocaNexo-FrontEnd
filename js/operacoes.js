'use strict';

(() => {
  const agenda = window.DocaNexoAgenda;
  const byId = id => document.getElementById(id);
  const form = byId('bookingForm');
  const dateField = byId('bookingDate');
  const codeField = byId('vehicleCode');
  const timeField = byId('bookingTime');
  const dockField = byId('bookingDock');
  const feedback = byId('bookingFeedback');
  const status = byId('bookings-status');
  const sections = document.querySelectorAll('.ops-view');
  const tabs = document.querySelectorAll('[data-view]');
  const views = {
    dashboard: ['Visão geral', 'Reservas deste navegador, ordenadas por data e horário.'],
    agenda: ['Novo agendamento', 'Informe o caminhão, a doca e o horário. A Central bloqueia sobreposições na mesma doca.'],
    docas: ['Disponibilidade de docas', 'Consulte janelas de 60 minutos por data e doca.']
  };
  let bookings = agenda.read();

  function show(view, updateUrl = true) {
    sections.forEach(section => section.classList.toggle('active', section.id === 'view-' + view));
    tabs.forEach(tab => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    [byId('viewTitle').textContent, byId('viewSubtitle').textContent] = views[view];
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.search = view === 'dashboard' ? '' : '?view=' + view;
      try {
        history.replaceState(history.state, '', url);
      } catch {
        // A aba continua acessível ao abrir o arquivo diretamente.
      }
    }
  }

  function render() {
    const rows = byId('bookingsRows');
    rows.replaceChildren();
    bookings.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    for (const booking of bookings) {
      const {code, type, date, time, dock, duration} = booking;
      const row = rows.insertRow();
      const values = [code, type, agenda.formatDate(date), time + '–' + agenda.endTime(time, duration), 'Doca ' + dock];
      const labels = ['Veículo', 'Operação', 'Data', 'Horário', 'Doca'];
      values.forEach((value, index) => {
        const cell = row.insertCell();
        cell.dataset.label = labels[index];
        cell.textContent = value;
      });

      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'button button-outline button-small';
      cancel.textContent = 'Cancelar';
      cancel.setAttribute('aria-label', `Cancelar agendamento ${code} em ${agenda.formatDate(date)} às ${time}`);
      cancel.addEventListener('click', () => {
        bookings = bookings.filter(item => item.code !== code || item.date !== date || item.time !== time || item.dock !== dock);
        persist();
        status.textContent = code + ' cancelado.';
        byId('restoreExamples').focus();
      });
      row.insertCell().append(cancel);
    }

    const now = new Date();
    const today = agenda.today();
    const currentTime = [now.getHours(), now.getMinutes()].map(value => String(value).padStart(2, '0')).join(':');
    const next = bookings.find(item => item.date > today || (item.date === today && item.time >= currentTime));
    byId('emptyBookings').hidden = bookings.length > 0;
    byId('totalBookings').textContent = String(bookings.length).padStart(2, '0');
    byId('nextArrival').textContent = next ? agenda.formatDate(next.date).slice(0, 5) + ' · ' + next.time : '—';
    byId('nextArrivalDetail').textContent = next ? next.code + ' · Doca ' + next.dock : 'nenhuma reserva futura';
  }

  function persist() {
    agenda.save(bookings);
    render();
    document.dispatchEvent(new Event('bookings-updated'));
  }

  function clearInvalid() {
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function showError(message, field) {
    feedback.textContent = message;
    feedback.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => show(tab.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => show(button.dataset.go)));
  byId('restoreExamples').addEventListener('click', () => {
    bookings = agenda.restore();
    render();
    document.dispatchEvent(new Event('bookings-updated'));
    status.textContent = 'Exemplos restaurados.';
  });

  dateField.min = agenda.today();
  dateField.value = dateField.min;
  const query = new URLSearchParams(location.search);
  if (query.get('view') === 'agenda') {
    show('agenda', false);
    dateField.value = query.get('date') || dateField.min;
    const validDate = dateField.validity.valid;
    if (!validDate) dateField.value = dateField.min;
    const dock = query.get('dock');
    const time = query.get('time');
    const validDock = Array.from(dockField.options).some(option => option.value === dock);
    const validTime = agenda.slots.includes(time);
    if (validDock) dockField.value = dock;
    if (validTime) timeField.value = time;
    if (query.has('date') && validDate && validDock && validTime) {
      feedback.textContent = `Horário preenchido a partir da consulta: Doca ${dock}, ${agenda.formatDate(dateField.value)}, ${time}. Informe o caminhão para confirmar.`;
      codeField.focus();
    }
  } else if (query.get('view') === 'docas') {
    show('docas', false);
  }

  form.addEventListener('reset', () => setTimeout(() => {
    dateField.value = dateField.min;
    feedback.textContent = '';
    feedback.classList.remove('error');
    clearInvalid();
  }, 0));

  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
  });
  [timeField, dockField].forEach(field => field.addEventListener('change', () => {
    timeField.removeAttribute('aria-invalid');
    dockField.removeAttribute('aria-invalid');
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearInvalid();
    const code = codeField.value.trim().toUpperCase();
    const date = dateField.value;
    const time = timeField.value;
    const dock = dockField.value;
    const duration = Number(byId('bookingDuration').value);
    if (!/^[A-Z0-9-]{4,12}$/.test(code)) {
      showError('Use de 4 a 12 caracteres: letras, números ou hífen (ex.: ABC1D23).', codeField);
      return;
    }
    if (!dateField.validity.valid) {
      showError('Selecione uma data válida, a partir de hoje.', dateField);
      return;
    }

    const conflict = agenda.findConflict(bookings, date, dock, time, duration);
    if (conflict) {
      const next = agenda.nextFree(bookings, date, dock, time, duration);
      const alternative = next ? `Primeiro horário livre nesta doca: ${next}.` :
        'Não há horário livre restante nesta doca nesta data; tente outra doca.';
      dockField.setAttribute('aria-invalid', 'true');
      showError(`Doca ${dock} indisponível: ${conflict.code} ocupa ${conflict.time}–${agenda.endTime(conflict.time, conflict.duration)} em ${agenda.formatDate(date)}. ${alternative}`, timeField);
      return;
    }

    const vehicleConflict = bookings.find(item => item.code === code && item.dock !== dock &&
      agenda.conflicts([item], date, item.dock, time, duration));
    if (vehicleConflict) {
      showError(`${code} já está reservado em outra doca nesse horário (${vehicleConflict.dock}, ${vehicleConflict.time}–${agenda.endTime(vehicleConflict.time, vehicleConflict.duration)}).`, timeField);
      return;
    }

    bookings.push({code, type: byId('operationType').value, date, time, dock, duration});
    persist();
    feedback.classList.remove('error');
    feedback.textContent = `${code} reservado na Doca ${dock}, ${agenda.formatDate(date)}, das ${time} às ${agenda.endTime(time, duration)}. `;
    const overview = document.createElement('a');
    overview.href = '#';
    overview.id = 'seeOverview';
    overview.textContent = 'Ver na Visão geral';
    overview.addEventListener('click', event => {
      event.preventDefault();
      show('dashboard');
      document.querySelector('[data-view="dashboard"]').focus();
    });
    feedback.append(overview);
    codeField.value = '';
    codeField.focus();
  });

  window.addEventListener('storage', () => {
    bookings = agenda.read();
    render();
  });
  render();
})();
