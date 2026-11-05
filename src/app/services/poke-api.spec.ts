import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { PokeApiService } from './poke-api';

describe('PokeApiService', () => {
  let service: PokeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format pokemon id correctly', () => {
    expect(service.formatPokemonId(1)).toBe('#001');
    expect(service.formatPokemonId(25)).toBe('#025');
    expect(service.formatPokemonId(150)).toBe('#150');
  });

  it('should convert height from decimeters to meters', () => {
    expect(service.convertHeightToMeters(7)).toBe(0.7);
    expect(service.convertHeightToMeters(17)).toBe(1.7);
  });

  it('should convert weight from hectograms to kilograms', () => {
    expect(service.convertWeightToKg(69)).toBe(6.9);
    expect(service.convertWeightToKg(905)).toBe(90.5);
  });

  it('should check list cache state correctly', () => {
    expect(service.hasListCache()).toBe(false);
    expect(service.getCachedList()).toBeNull();
  });
});
