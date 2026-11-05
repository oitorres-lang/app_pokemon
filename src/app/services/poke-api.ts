import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { of, map, tap } from 'rxjs';

import type {
  PokemonListResponse,
  PokemonListItem,
  PokemonDetail,
  PokemonTypeInfo,
  PokemonStatInfo,
  FormattedType,
  FormattedStat,
} from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  // Caché en memoria para carga ultra rápida e instantánea
  private listCache: PokemonListItem[] | null = null;
  private readonly detailCache = new Map<string, PokemonDetail>();

  // Diccionario de traducción de tipos al español
  private readonly typeTranslations: Record<string, string> = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    grass: 'Planta',
    electric: 'Eléctrico',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    steel: 'Acero',
    fairy: 'Hada',
    dark: 'Siniestro',
  };

  // Colores característicos oficiales para cada tipo de Pokémon
  private readonly typeColors: Record<string, string> = {
    normal: '#9FA19F',
    fire: '#FF421C',
    water: '#2C7DFB',
    grass: '#64B53D',
    electric: '#FAC000',
    ice: '#3DCEF3',
    fighting: '#FF8000',
    poison: '#9141CB',
    ground: '#915121',
    rock: '#AFA981',
    bug: '#91A119',
    ghost: '#704170',
    dragon: '#5060E1',
    steel: '#60A1B8',
    psychic: '#EF4179',
    fairy: '#EF70EF',
    dark: '#50413B',
  };

  // Nombres legibles en español y colores para las estadísticas base
  private readonly statConfig: Record<string, { label: string; color: string }> = {
    hp: { label: 'PS (HP)', color: '#4CAF50' },
    attack: { label: 'Ataque', color: '#F44336' },
    defense: { label: 'Defensa', color: '#2196F3' },
    'special-attack': { label: 'Atq. Especial', color: '#9C27B0' },
    'special-defense': { label: 'Def. Especial', color: '#FF9800' },
    speed: { label: 'Velocidad', color: '#00BCD4' },
  };

  /**
   * Obtiene el listado de los primeros Pokémon desde la PokéAPI
   * Utiliza caché en memoria para que las navegaciones subsecuentes sean instantáneas (0ms)
   * @param limit Cantidad de Pokémon a consultar (25 por defecto)
   * @param offset Desplazamiento inicial
   * @param forceRefresh Si es verdadero, omite la caché y consulta la red
   */
  getPokemonList(limit: number = 25, offset: number = 0, forceRefresh: boolean = false): Observable<PokemonListItem[]> {
    if (!forceRefresh && offset === 0 && limit === 25 && this.listCache) {
      return of(this.listCache);
    }

    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<PokemonListResponse>(url).pipe(
      map((response) =>
        response.results.map((item) => {
          const id = this.extractIdFromUrl(item.url);
          return {
            id,
            name: item.name,
            url: item.url,
            // Sprite estándar de ~3KB para visualización instantánea en la lista
            thumbnailUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            // Imagen grande oficial para el detalle o fallback
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            formattedId: this.formatPokemonId(id),
          };
        }),
      ),
      tap((items) => {
        if (offset === 0 && limit === 25) {
          this.listCache = items;
        }
      }),
    );
  }

  /**
   * Verifica si ya existe la lista en memoria caché
   */
  hasListCache(): boolean {
    return this.listCache !== null && this.listCache.length > 0;
  }

  /**
   * Obtiene la lista almacenada en memoria caché
   */
  getCachedList(): PokemonListItem[] | null {
    return this.listCache;
  }

  /**
   * Obtiene la respuesta cruda de la PokéAPI con metadatos de paginación
   */
  getPokemonListResponse(limit: number = 25, offset: number = 0): Observable<PokemonListResponse> {
    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<PokemonListResponse>(url);
  }

  /**
   * Obtiene la información detallada de un Pokémon por su ID o nombre
   * Si ya fue consultado previamente, retorna el resultado de inmediato desde la caché
   * @param idOrName ID numérico o nombre del Pokémon
   * @param forceRefresh Si es verdadero, omite la caché y consulta la red
   */
  getPokemonDetail(idOrName: string | number, forceRefresh: boolean = false): Observable<PokemonDetail> {
    const key = idOrName.toString().trim().toLowerCase();

    if (!forceRefresh && this.detailCache.has(key)) {
      return of(this.detailCache.get(key)!);
    }

    const url = `${this.baseUrl}/pokemon/${key}`;
    return this.http.get<PokemonDetail>(url).pipe(
      tap((detail) => {
        this.detailCache.set(key, detail);
        this.detailCache.set(detail.id.toString(), detail);
        this.detailCache.set(detail.name.toLowerCase(), detail);
      }),
    );
  }

  /**
   * Precarga en segundo plano detalles de los Pokémon para que al hacer clic se abran instantáneamente
   */
  prefetchDetails(items: PokemonListItem[]): void {
    // Precarga silenciosa de los primeros 10 Pokémon en segundo plano
    const toPrefetch = items.slice(0, 10);
    for (const item of toPrefetch) {
      const key = item.id.toString();
      if (!this.detailCache.has(key)) {
        this.getPokemonDetail(item.id).subscribe({
          error: () => {}, // Silenciar fallos de prefetch
        });
      }
    }
  }

  /**
   * Extrae el ID numérico a partir de la URL del recurso PokéAPI
   */
  extractIdFromUrl(url: string): number {
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return Number(lastSegment);
  }

  /**
   * Formatea el ID en formato #001, #025, etc.
   */
  formatPokemonId(id: number): string {
    return `#${id.toString().padStart(3, '0')}`;
  }

  /**
   * Convierte la altura de decímetros (dm) a metros (m)
   */
  convertHeightToMeters(heightInDecimeters: number): number {
    return Number((heightInDecimeters / 10).toFixed(2));
  }

  /**
   * Convierte el peso de hectogramos (hg) a kilogramos (kg)
   */
  convertWeightToKg(weightInHectograms: number): number {
    return Number((weightInHectograms / 10).toFixed(2));
  }

  /**
   * Transforma y decora los tipos del Pokémon con traducciones y colores
   */
  formatTypes(types: PokemonTypeInfo[]): FormattedType[] {
    if (!types) return [];
    return types.map((t) => {
      const name = t.type.name.toLowerCase();
      return {
        name,
        displayName: this.typeTranslations[name] || this.capitalize(name),
        color: this.typeColors[name] || '#607D8B',
        textColor: '#FFFFFF',
      };
    });
  }

  /**
   * Transforma y normaliza las estadísticas base para ion-progress-bar
   * Escala máxima de referencia: 255 (el valor base más alto en Pokémon es Blissey con 255 en HP)
   */
  formatStats(stats: PokemonStatInfo[]): FormattedStat[] {
    if (!stats) return [];
    const MAX_STAT = 255;
    return stats.map((s) => {
      const statKey = s.stat.name.toLowerCase();
      const config = this.statConfig[statKey] || {
        label: this.capitalize(statKey.replace('-', ' ')),
        color: '#3880ff',
      };
      const percentage = Math.min(Math.max(s.base_stat / MAX_STAT, 0.05), 1);

      return {
        name: statKey,
        displayName: config.label,
        value: s.base_stat,
        percentage: Number(percentage.toFixed(2)),
        color: config.color,
      };
    });
  }

  /**
   * Obtiene la imagen oficial grande (official-artwork)
   */
  getOfficialArtwork(detail: PokemonDetail): string {
    return (
      detail.sprites.other?.['official-artwork']?.front_default ||
      detail.sprites.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`
    );
  }

  /**
   * Capitaliza la primera letra de un texto
   */
  capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

// Exportamos alias para compatibilidad
export { PokeApiService as PokeApi };
