import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonSearchbar,
  IonSpinner,
  IonSkeletonText,
  IonBadge,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  refreshOutline,
  alertCircleOutline,
  chevronForwardOutline,
  sparklesOutline,
  flashOutline,
} from 'ionicons/icons';

import type { PokemonListItem } from '../../models/pokemon.model';
import { PokeApiService } from '../../services/poke-api';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonSearchbar,
    IonSpinner,
    IonSkeletonText,
    IonBadge,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class HomePage implements OnInit {
  private readonly pokeService = inject(PokeApiService);
  private readonly router = inject(Router);

  // Lista estricta de los primeros 25 Pokémon solicitados
  readonly limit: number = 25;
  pokemonList: PokemonListItem[] = [];
  filteredPokemonList: PokemonListItem[] = [];

  // Estados de carga e interfaz
  isLoading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';

  // Array dummy para skeletons durante la primera carga
  readonly skeletonArray = Array.from({ length: 8 });

  constructor() {
    addIcons({
      searchOutline,
      refreshOutline,
      alertCircleOutline,
      chevronForwardOutline,
      sparklesOutline,
      flashOutline,
    });
  }

  ngOnInit(): void {
    // Si ya tenemos los datos en memoria caché, los mostramos instantáneamente (0ms)
    if (this.pokeService.hasListCache()) {
      this.pokemonList = this.pokeService.getCachedList() || [];
      this.applyFilter();
      this.isLoading = false;
      return;
    }

    this.loadPokemonList();
  }

  /**
   * Carga los 25 Pokémon desde PokéAPI con caché y precarga en segundo plano
   */
  loadPokemonList(forceRefresh: boolean = false): void {
    if (!this.pokeService.hasListCache() || forceRefresh) {
      this.isLoading = true;
    }
    this.errorMessage = null;

    this.pokeService.getPokemonList(this.limit, 0, forceRefresh).subscribe({
      next: (pokemons) => {
        this.pokemonList = pokemons;
        this.applyFilter();
        this.isLoading = false;

        // Precargar detalles en segundo plano para navegación instantánea al hacer tap
        this.pokeService.prefetchDetails(pokemons);
      },
      error: (err) => {
        console.error('Error al cargar la lista de Pokémon:', err);
        this.errorMessage = 'No se pudo conectar con la PokéAPI. Verifica tu conexión a internet.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Manejador de evento "Pull-to-refresh" para forzar la recarga
   */
  handleRefresh(event: any): void {
    this.searchTerm = '';

    this.pokeService.getPokemonList(this.limit, 0, true).subscribe({
      next: (pokemons) => {
        this.pokemonList = pokemons;
        this.applyFilter();
        event.target.complete();
      },
      error: (err) => {
        console.error('Error al refrescar:', err);
        event.target.complete();
      },
    });
  }

  /**
   * Filtra los 25 Pokémon por nombre o ID en tiempo real
   */
  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase().trim() || '';
    this.applyFilter();
  }

  /**
   * Aplica el filtro sobre el conjunto de los 25 Pokémon
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredPokemonList = [...this.pokemonList];
      return;
    }

    this.filteredPokemonList = this.pokemonList.filter((poke) => {
      const matchesName = poke.name.toLowerCase().includes(this.searchTerm);
      const matchesId = poke.id.toString().includes(this.searchTerm);
      const matchesFormattedId = poke.formattedId.toLowerCase().includes(this.searchTerm);
      return matchesName || matchesId || matchesFormattedId;
    });
  }

  /**
   * Navega hacia la pantalla de detalle pasando el ID del Pokémon
   */
  goToDetail(pokemonId: number): void {
    this.router.navigate(['/detail', pokemonId]);
  }

  /**
   * Manejador para fallbacks de imágenes rotas
   */
  onImageError(event: Event, id: number): void {
    const target = event.target as HTMLImageElement;
    target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
