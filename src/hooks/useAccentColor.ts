'use client';

/**
 * useAccentColor — applies the user's brand colour to the app's CSS variables.
 *
 * Shadcn components all read from --primary and --ring CSS variables defined in
 * globals.css. By overriding them on <html> at runtime, the user's chosen colour
 * instantly propagates to buttons, links, focus rings, and invoice accents.
 *
 * Call this hook inside any component that has access to the profile.
 */
import { useEffect } from 'react';

/** Convert a hex colour string (#rrggbb) to the HSL format used by the CSS variables. */
function hexToHslString(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

/**
 * Apply a hex accent colour to the CSS variables that drive the UI.
 * The foreground colour auto-adjusts to white or dark depending on luminance.
 */
export function useAccentColor(hexColor: string | undefined) {
  useEffect(() => {
    const hex = hexColor || '#3b82f6';
    const hsl = hexToHslString(hex);
    if (!hsl) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);

    // Choose white or dark foreground based on lightness for readability
    const lightness = parseInt(hsl.split('%')[0].split(' ')[2]);
    const fgLight = lightness < 55 ? '210 40% 98%' : '222.2 84% 4.9%';
    root.style.setProperty('--primary-foreground', fgLight);

    // Cleanup: restore default when the component unmounts (e.g. sign-out)
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--primary-foreground');
    };
  }, [hexColor]);
}
