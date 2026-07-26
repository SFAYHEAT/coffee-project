// Returns a seasonal accent that can override colors.ORANGE app-wide.
// Plug this into ThemeContext so every screen using colors.ORANGE
// automatically re-skins for the season — no per-screen edits needed.

export type SeasonalAccent = {
  name: string;
  primary: string;
  secondary: string;
};

export function getSeasonalAccent(date: Date = new Date()): SeasonalAccent {
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  // Christmas
  if ((m === 12 && d >= 18) || (m === 1 && d <= 2)) {
    return { name: "christmas", primary: "#E23744", secondary: "#1E5631" };
  }

  // Halloween
  if (m === 10 && d >= 20) {
    return { name: "halloween", primary: "#8A4FFF", secondary: "#FF7A1A" };
  }

  // Ramadan — approximate window, adjust yearly (lunar calendar shifts ~11 days/yr)
  if ((m === 2 && d >= 20) || m === 3 || (m === 4 && d <= 10)) {
    return { name: "ramadan", primary: "#D4AF37", secondary: "#1A1A2E" };
  }

  // Winter
  if (m === 12 || m === 1 || m === 2) {
    return { name: "winter", primary: "#3E6DBF", secondary: "#1B2A4A" };
  }

  // Summer
  if (m >= 6 && m <= 8) {
    return { name: "summer", primary: "#FF8A3D", secondary: "#FFC15E" };
  }

  // Default (spring/fall) — house orange
  return { name: "default", primary: "#F09240", secondary: "#D97741" };
}
