'use strict';

window.calcularImpacto = (trucks, docks, peak, area) => {
  const pressure = Math.min(50, Math.round(trucks / docks * 12));
  const score = Math.min(100, pressure + peak + area);
  const category = score >= 70 ? 'Elevado' : score >= 40 ? 'Moderado' : 'Baixo';
  return {pressure, score, category};
};
