export interface Theme {
  name: string;
  label: string;
}

export const AVAILABLE_THEMES: Theme[] = [
  { name: 'cyberpunk', label: 'Cyberpunk' },
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'synthwave', label: 'Synthwave' },
  { name: 'retro', label: 'Retro' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'luxury', label: 'Luxury' },
  { name: 'business', label: 'Business' },
  { name: 'forest', label: 'Forest' },
  { name: 'aqua', label: 'Aqua' },
  { name: 'lofi', label: 'Lo-Fi' },
  { name: 'pastel', label: 'Pastel' },
  { name: 'fantasy', label: 'Fantasy' },
  { name: 'night', label: 'Night' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'winter', label: 'Winter' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'nord', label: 'Nord' },
];

export const DEFAULT_THEME = 'cyberpunk';