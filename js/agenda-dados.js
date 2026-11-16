'use strict';

window.DocaNexoAgenda = (() => {
  const key = 'docanexo-demo-agendamentos-v3';
  const slots = Object.freeze(['07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00']);

  function examples() {
    return [
      {code:'TRK-2041', type:'Descarga', date:today(1), time:'09:00', dock:'02', duration:60},
      {code:'TRK-3812', type:'Carregamento', date:today(1), time:'11:00', dock:'04', duration:120},
      {code:'TRK-1208', type:'Descarga', date:today(2), time:'08:00', dock:'01', duration:60}
    ];
  }

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(saved)) {
        return saved.filter(item => item && typeof item.code === 'string' &&
          typeof item.date === 'string' && /^\d{2}:\d{2}$/.test(item.time) &&
          Number(item.duration) > 0);
      }
    } catch {
      // O painel ainda pode exibir os exemplos quando o armazenamento falha.
    }
    return examples();
  }

  function save(bookings) {
    try {
      localStorage.setItem(key, JSON.stringify(bookings));
    } catch {
      // A Central mantém o agendamento em memória durante a sessão.
    }
  }

  function today(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map(part => String(part).padStart(2, '0')).join('-');
  }

  function minutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function endTime(time, duration) {
    const end = minutes(time) + Number(duration);
    return [Math.floor(end / 60), end % 60].map(value => String(value).padStart(2, '0')).join(':');
  }

  function findConflict(bookings, date, dock, time, duration) {
    const start = minutes(time);
    return bookings.find(booking => {
      if (booking.date !== date || booking.dock !== dock) return false;
      const occupiedFrom = minutes(booking.time);
      return start < occupiedFrom + Number(booking.duration) && start + Number(duration) > occupiedFrom;
    }) ?? null;
  }

  function conflicts(bookings, date, dock, time, duration) {
    return Boolean(findConflict(bookings, date, dock, time, duration));
  }

  function nextFree(bookings, date, dock, time, duration) {
    return slots.find(slot => slot >= time && !conflicts(bookings, date, dock, slot, duration)) ?? null;
  }

  function firstDateWithBookings(bookings, fromDate) {
    return bookings.map(booking => booking.date).filter(date => date >= fromDate).sort()[0] ?? null;
  }

  function formatDate(date) {
    return date.split('-').reverse().join('/');
  }

  function restore() {
    const bookings = examples();
    save(bookings);
    return bookings;
  }

  return {read, save, today, conflicts, slots, endTime, findConflict, nextFree, firstDateWithBookings, formatDate, restore};
})();
