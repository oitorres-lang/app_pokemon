import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonIcon,
  IonSpinner,
  IonButton,
  IonChip,
  IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  resizeOutline,
  scaleOutline,
  fitnessOutline,
  sparklesOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  refreshOutline,
  alertCircleOutline,
} from 'ionicons/icons';

import type { PokemonDetail, FormattedType, FormattedStat } from '../../models/pokemon.model';
import { PokeApiService } from '../../services/poke-api';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonIcon,
    IonSpinner,
    IonButton,
    IonChip,
    IonLabel,
  ],
})
export class DetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly pokeService = inject(PokeApiService);

  // Input binding para el parámetro de la ruta /detail/:id
  @Input() id?: string;

  pokemon: PokemonDetail | null = null;
  formattedTypes: FormattedType[] = [];
  formattedStats: FormattedStat[] = [];
  formattedId: string = '';
  artworkUrl: string = '';
  heightInMeters: number = 0;
  weightInKg: number = 0;
  primaryColor: string = '#3880ff';

  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor() {
    addIcons({
      arrowBackOutline,
      resizeOutline,
      scaleOutline,
      fitnessOutline,
      sparklesOutline,
      shieldCheckmarkOutline,
      speedometerOutline,
      refreshOutline,
      alertCircleOutline,
    });
  }

  ngOnInit(): void {
    const pokemonId = this.id || this.route.snapshot.paramMap.get('id');
    if (pokemonId) {
      this.loadPokemonDetail(pokemonId);
    } else {
      this.errorMessage = 'Identificador de Pokémon no válido.';
      this.isLoading = false;
    }
  }

  /**
   * Consulta el endpoint individual de la PokéAPI (https://pokeapi.co/api/v2/pokemon/{id})
   */
  loadPokemonDetail(idOrName: string, forceRefresh: boolean = false): void {
    this.errorMessage = null;

    this.pokeService.getPokemonDetail(idOrName, forceRefresh).subscribe({
      next: (detail) => {
        this.pokemon = detail;
        this.formattedId = this.pokeService.formatPokemonId(detail.id);
        this.artworkUrl = this.pokeService.getOfficialArtwork(detail);
        this.formattedTypes = this.pokeService.formatTypes(detail.types);
        this.formattedStats = this.pokeService.formatStats(detail.stats);
        this.heightInMeters = this.pokeService.convertHeightToMeters(detail.height);
        this.weightInKg = this.pokeService.convertWeightToKg(detail.weight);

        // Asignar color temático basado en el tipo primario
        if (this.formattedTypes.length > 0) {
          this.primaryColor = this.formattedTypes[0].color;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle del Pokémon:', err);
        this.errorMessage =
          'No se pudo obtener la información de este Pokémon. Verifica la conexión o el ID consultado.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Reintenta la carga del detalle
   */
  retry(): void {
    const pokemonId = this.id || this.route.snapshot.paramMap.get('id');
    if (pokemonId) {
      this.isLoading = true;
      this.loadPokemonDetail(pokemonId, true);
    }
  }

  /**
   * Navega de vuelta a la lista principal
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Fallback de imagen en caso de error
   */
  onArtworkError(event: Event): void {
    if (this.pokemon) {
      const target = event.target as HTMLImageElement;
      target.src =
        this.pokemon.sprites.front_default ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${this.pokemon.id}.png`;
    }
  }
}
