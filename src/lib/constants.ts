export const KNOCKOUT_STAGES = new Set([
  "Dieciseisavos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinales",
  "Final",
  "Tercer Puesto"
]);

export const TEAM_TRANSLATIONS: Record<string, string> = {
  Mexico: "México", "South Africa": "Sudáfrica", "South Korea": "Corea del Sur", "Czech Republic": "Chequia",
  Canada: "Canadá", "Bosnia and Herzegovina": "Bosnia y Herzegovina", USA: "EE.UU.", "United States": "EE.UU.",
  Paraguay: "Paraguay", Qatar: "Catar", Switzerland: "Suiza", Brazil: "Brasil", Morocco: "Marruecos",
  Haiti: "Haití", Scotland: "Escocia", Australia: "Australia", Turkey: "Turquía", Türkiye: "Turquía", Germany: "Alemania",
  Curacao: "Curazao", Curaçao: "Curazao", Netherlands: "Países Bajos", Japan: "Japón", "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador", Sweden: "Suecia", Tunisia: "Túnez", Spain: "España", "Cape Verde": "Cabo Verde",
  Belgium: "Bélgica", Egypt: "Egipto", "Saudi Arabia": "Arabia Saudita", Uruguay: "Uruguay", Iran: "Irán",
  "New Zealand": "Nueva Zelanda", France: "Francia", Senegal: "Senegal", Iraq: "Irak", Norway: "Noruega",
  Argentina: "Argentina", Algeria: "Argelia", Austria: "Austria", Jordan: "Jordania", Portugal: "Portugal",
  "DR Congo": "RD Congo", "Democratic Republic of the Congo": "RD Congo", England: "Inglaterra", Croatia: "Croacia",
  Ghana: "Ghana", Panama: "Panamá", Colombia: "Colombia", Uzbekistan: "Uzbekistán"
};

export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
export const DOCUMENT_REGEX = /^[A-Za-z0-9]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,12}$/;
