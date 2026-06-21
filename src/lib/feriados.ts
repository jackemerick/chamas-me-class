// Retorna Set de strings "YYYY-MM-DD" com os feriados nacionais do Brasil para o ano dado
export function getFeriadosBrasil(year: number): Set<string> {
  const feriados: string[] = [];

  const add = (m: number, d: number) =>
    feriados.push(`${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

  // Feriados fixos
  add(1, 1);   // Confraternização Universal
  add(4, 21);  // Tiradentes
  add(5, 1);   // Dia do Trabalho
  add(9, 7);   // Independência do Brasil
  add(10, 12); // Nossa Sra. Aparecida
  add(11, 2);  // Finados
  add(11, 15); // Proclamação da República
  add(11, 20); // Consciência Negra (lei federal 14.759/2023)
  add(12, 25); // Natal

  // Feriados móveis baseados na Páscoa (algoritmo de Meeus/Jones/Butcher)
  const easter = calcEaster(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);

  const carnaval2 = addDays(easterDate, -47);   // Segunda de Carnaval
  const carnaval3 = addDays(easterDate, -48);   // Terça de Carnaval (Brasil celebra os dois)
  const sextaSanta = addDays(easterDate, -2);   // Sexta-feira Santa
  const corpusChristi = addDays(easterDate, 60); // Corpus Christi

  feriados.push(fmt(carnaval2));
  feriados.push(fmt(carnaval3));
  feriados.push(fmt(easterDate)); // Páscoa
  feriados.push(fmt(sextaSanta));
  feriados.push(fmt(corpusChristi));

  return new Set(feriados);
}

function calcEaster(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
