// Roda uma vez, no processo principal, antes dos workers: eles herdam este fuso.
// Fortaleza (UTC-3, sem horário de verão) reproduz o bug clássico de toISOString() no Brasil.
export default function setup() {
  process.env.TZ = "America/Fortaleza";
}
