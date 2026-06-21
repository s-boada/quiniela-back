export type SeedMatch = {
  id: string;
  apiId: number | null;
  stage: string;
  groupName: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
};

export const INITIAL_MATCHES_FROM_R32: SeedMatch[] = [
  { id: "m73", apiId: 73, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Segundo Grupo A", awayTeam: "Segundo Grupo B", date: "2026-06-28 19:00" },
  { id: "m74", apiId: 76, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo C", awayTeam: "Segundo Grupo F", date: "2026-06-29 17:00" },
  { id: "m75", apiId: 74, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo E", awayTeam: "3ro Grupo A/B/C/D/F", date: "2026-06-29 20:30" },
  { id: "m76", apiId: 75, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo F", awayTeam: "Segundo Grupo C", date: "2026-06-30 01:00" },
  { id: "m77", apiId: 78, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Segundo Grupo E", awayTeam: "Segundo Grupo I", date: "2026-06-30 17:00" },
  { id: "m78", apiId: 77, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo I", awayTeam: "3ro Grupo C/D/F/G/H", date: "2026-06-30 21:00" },
  { id: "m79", apiId: 79, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo A", awayTeam: "3ro Grupo C/E/F/H/I", date: "2026-07-01 01:00" },
  { id: "m80", apiId: 80, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo L", awayTeam: "3ro Grupo E/H/I/J/K", date: "2026-07-01 16:00" },
  { id: "m81", apiId: 82, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo G", awayTeam: "3ro Grupo A/E/H/I/J", date: "2026-07-01 20:00" },
  { id: "m82", apiId: 81, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo D", awayTeam: "3ro Grupo B/E/F/I/J", date: "2026-07-02 00:00" },
  { id: "m83", apiId: 84, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo H", awayTeam: "Segundo Grupo J", date: "2026-07-02 19:00" },
  { id: "m84", apiId: 83, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Segundo Grupo K", awayTeam: "Segundo Grupo L", date: "2026-07-02 23:00" },
  { id: "m85", apiId: 85, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo B", awayTeam: "3ro Grupo E/F/G/I/J", date: "2026-07-03 03:00" },
  { id: "m86", apiId: 88, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Segundo Grupo D", awayTeam: "Segundo Grupo G", date: "2026-07-03 18:00" },
  { id: "m87", apiId: 86, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo J", awayTeam: "Segundo Grupo H", date: "2026-07-03 22:00" },
  { id: "m88", apiId: 87, stage: "Dieciseisavos de Final", groupName: "R32", homeTeam: "Ganador Grupo K", awayTeam: "3ro Grupo D/E/I/J/L", date: "2026-07-04 01:30" },
  { id: "m89", apiId: 90, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 73", awayTeam: "Ganador Partido 75", date: "2026-07-04 17:00" },
  { id: "m90", apiId: 89, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 74", awayTeam: "Ganador Partido 77", date: "2026-07-04 21:00" },
  { id: "m91", apiId: 91, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 76", awayTeam: "Ganador Partido 78", date: "2026-07-05 20:00" },
  { id: "m92", apiId: 92, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 79", awayTeam: "Ganador Partido 80", date: "2026-07-06 00:00" },
  { id: "m93", apiId: 93, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 83", awayTeam: "Ganador Partido 84", date: "2026-07-06 19:00" },
  { id: "m94", apiId: 94, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 81", awayTeam: "Ganador Partido 82", date: "2026-07-07 00:00" },
  { id: "m95", apiId: 95, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 86", awayTeam: "Ganador Partido 88", date: "2026-07-07 16:00" },
  { id: "m96", apiId: 96, stage: "Octavos de Final", groupName: "R16", homeTeam: "Ganador Partido 85", awayTeam: "Ganador Partido 87", date: "2026-07-07 20:00" },
  { id: "m97", apiId: 97, stage: "Cuartos de Final", groupName: "QF", homeTeam: "Ganador Partido 89", awayTeam: "Ganador Partido 90", date: "2026-07-09 20:00" },
  { id: "m98", apiId: 98, stage: "Cuartos de Final", groupName: "QF", homeTeam: "Ganador Partido 93", awayTeam: "Ganador Partido 94", date: "2026-07-10 19:00" },
  { id: "m99", apiId: 99, stage: "Cuartos de Final", groupName: "QF", homeTeam: "Ganador Partido 91", awayTeam: "Ganador Partido 92", date: "2026-07-11 21:00" },
  { id: "m100", apiId: 100, stage: "Cuartos de Final", groupName: "QF", homeTeam: "Ganador Partido 95", awayTeam: "Ganador Partido 96", date: "2026-07-12 01:00" },
  { id: "m101", apiId: 101, stage: "Semifinales", groupName: "SF", homeTeam: "Ganador Partido 97", awayTeam: "Ganador Partido 98", date: "2026-07-14 19:00" },
  { id: "m102", apiId: 102, stage: "Semifinales", groupName: "SF", homeTeam: "Ganador Partido 99", awayTeam: "Ganador Partido 100", date: "2026-07-15 19:00" },
  { id: "m103", apiId: 103, stage: "Tercer Puesto", groupName: "3RD", homeTeam: "Perdedor Partido 101", awayTeam: "Perdedor Partido 102", date: "2026-07-18 21:00" },
  { id: "m104", apiId: 104, stage: "Final", groupName: "FINAL", homeTeam: "Ganador Partido 101", awayTeam: "Ganador Partido 102", date: "2026-07-19 19:00" }
];
