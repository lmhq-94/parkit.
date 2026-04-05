export function valetHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function valetInitials(firstName: string, lastName: string): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  const a = f.charAt(0);
  const b = l.charAt(0);
  const u = (c: string) => c.toLocaleUpperCase();
  if (a && b) return u(a) + u(b);
  if (f.length >= 2) return u(f.charAt(0)) + u(f.charAt(1));
  if (a) return u(a);
  return "?";
}

export function valetAvatarColors(
  id: string,
  isDark: boolean
): { bg: string; fg: string; border: string } {
  const hue = valetHash(id) % 360;
  if (isDark) {
    return {
      bg: `hsla(${hue}, 42%, 30%, 1)`,
      fg: `hsla(${hue}, 40%, 97%, 1)`,
      border: `hsla(${hue}, 55%, 48%, 0.5)`,
    };
  }
  return {
    bg: `hsla(${hue}, 52%, 93%, 1)`,
    fg: `hsla(${hue}, 48%, 28%, 1)`,
    border: `hsla(${hue}, 45%, 78%, 0.9)`,
  };
}
