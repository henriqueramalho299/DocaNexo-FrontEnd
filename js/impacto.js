'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const form = byId('impactForm');
  const result = byId('impactResult');
  const trucks = byId('simTrucks');
  const docks = byId('simDocks');
  const time = byId('simTime');
  const area = byId('simArea');
  const bar = byId('impactBar');
  const save = byId('saveScenario');
  const rows = byId('scenario-rows');
  const status = byId('scenario-status');
  const messages = {
    Baixo: 'Baixo: a demanda cabe nas docas e o horário e a área pesam pouco.',
    Moderado: 'Moderado: teste um horário fora do pico ou mais docas antes de confirmar.',
    Elevado: 'Elevado: distribua parte dos caminhões em outras janelas ou docas e simule de novo.'
  };
  let scenario = null;

  function update() {
    const valid = trucks.validity.valid && docks.validity.valid;
    bar.parentElement.hidden = !valid;
    byId('impactBreakdown').hidden = !valid;
    save.disabled = !valid;
    if (!valid) {
      scenario = null;
      delete result.dataset.level;
      byId('impactScore').textContent = '—';
      byId('impactCategory').textContent = '—';
      byId('impactMessage').textContent = 'Informe de 1 a 30 caminhões e de 1 a 12 docas.';
      return;
    }

    const {pressure, score, category} = window.calcularImpacto(Number(trucks.value), Number(docks.value), Number(time.value), Number(area.value));
    scenario = [trucks.value, docks.value, time.selectedOptions[0].text.split(' — ')[0], area.selectedOptions[0].text, String(score), category];
    result.dataset.level = category.toLowerCase();
    byId('impactScore').textContent = score + '/100';
    byId('impactCategory').textContent = category;
    byId('impactMessage').textContent = messages[category];
    byId('impactPressure').textContent = pressure + ' de 50';
    byId('impactPeak').textContent = time.value + ' de 30';
    byId('impactArea').textContent = area.value + ' de 20';
    bar.style.width = score + '%';
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  save.addEventListener('click', () => {
    if (!scenario) return;
    if (rows.rows.length === 4) {
      status.textContent = 'Limite de 4 cenários. Limpe a comparação para guardar outro.';
      return;
    }
    const row = rows.insertRow();
    scenario.forEach(value => { row.insertCell().textContent = value; });
    status.textContent = 'Cenário guardado (' + rows.rows.length + ' de 4).';
  });
  byId('clearScenarios').addEventListener('click', () => {
    rows.replaceChildren();
    status.textContent = 'Comparação limpa.';
  });
  update();
})();
