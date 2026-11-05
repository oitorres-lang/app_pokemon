/**
 * Modelos de datos para el consumo de la PokéAPI pública.
 * Arquitectura limpia - Capa de Modelo (/models).
 */

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  formattedId: string;
}

export interface PokemonTypeInfo {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonStatInfo {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface PokemonAbilityInfo {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface OfficialArtwork {
  front_default: string | null;
  front_shiny?: string | null;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  other: {
    'official-artwork': OfficialArtwork;
    dream_world?: {
      front_default: string | null;
    };
    home?: {
      front_default: string | null;
    };
    [key: string]: unknown;
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number; // En decímetros (dm)
  weight: number; // En hectogramos (hg)
  base_experience: number;
  types: PokemonTypeInfo[];
  stats: PokemonStatInfo[];
  abilities: PokemonAbilityInfo[];
  sprites: PokemonSprites;
}

export interface FormattedStat {
  name: string;
  displayName: string;
  value: number;
  percentage: number; // Normalizado de 0 a 1 para ion-progress-bar
  color: string;
}

export interface FormattedType {
  name: string;
  displayName: string;
  color: string;
  textColor: string;
}
