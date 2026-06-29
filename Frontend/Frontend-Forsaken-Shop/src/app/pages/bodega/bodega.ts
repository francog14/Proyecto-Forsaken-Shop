import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria, Prenda } from '../../models/forsaken.models';
import { CategoriaService } from '../../services/categoria.service';
import { PrendaService } from '../../services/prenda.service';

@Component({
  selector: 'app-bodega',
  imports: [RouterLink],
  templateUrl: './bodega.html',
  styleUrl: './bodega.scss',
})
export class BodegaComponent implements OnInit {
  private readonly prendaService = inject(PrendaService);
  private readonly categoriaService = inject(CategoriaService);

  readonly prendas = signal<Prenda[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly error = signal('');

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');

    this.prendaService.listar().subscribe({
      next: (prendas) => this.prendas.set(prendas),
      error: () => this.error.set('No se pudieron cargar las prendas.'),
    });

    this.categoriaService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.error.set('No se pudieron cargar las categorias.'),
    });
  }

  stockTotal() {
    return this.prendas().reduce((acc, prenda) => acc + Number(prenda.stock_prenda), 0);
  }

  bajoStock() {
    return this.prendas().filter((prenda) => prenda.stock_prenda <= 5);
  }

  sinStock() {
    return this.prendas().filter((prenda) => prenda.stock_prenda === 0).length;
  }

  ultimasPrendas() {
    return this.prendas().slice(-6).reverse();
  }

  nombreCategoria(id: number) {
    return this.categorias().find((categoria) => categoria.id_categoria === id)?.nombre_categoria ?? `Categoria ${id}`;
  }

  obtenerImagenPrenda(nombre: string): string {
    const nameLower = nombre.toLowerCase();
    
    if (nameLower.includes('dark angel')) {
      return '/assets/img/03_polera_dark_angel.png';
    }
    if (nameLower.includes('oversize shadow')) {
      return '/assets/img/04_polera_oversize_shadow.png';
    }
    if (nameLower.includes('forsaken logo')) {
      return '/assets/img/02_poleron_forsaken_logo.png';
    }
    if (nameLower.includes('flame')) {
      return '/assets/img/05_poleron_flame.png';
    }
    if (nameLower.includes('gorro forsaken')) {
      return '/assets/img/06_gorro_forsaken.png';
    }
    if (nameLower.includes('forsaken classic')) {
      return '/assets/img/13_polera_forsaken_classic.png';
    }
    if (nameLower.includes('eclipse')) {
      return '/assets/img/14_poleron_eclipse.png';
    }
    if (nameLower.includes('oversize graphic')) {
      return '/assets/img/15_polera_oversize_graphic.png';
    }
    if (nameLower.includes('zip darkness')) {
      return '/assets/img/16_poleron_zip_darkness.png';
    }
    if (nameLower.includes('tribal')) {
      return '/assets/img/17_gorro_tribal.png';
    }
    if (nameLower.includes('vintage')) {
      return '/assets/img/18_polera_vintage.png';
    }
    if (nameLower.includes('back print')) {
      return '/assets/img/19_poleron_back_print.png';
    }
    if (nameLower.includes('neutral')) {
      return '/assets/img/20_polera_neutral.png';
    }

    // Fallbacks
    if (nameLower.includes('poleron') || nameLower.includes('polerón')) {
      return '/assets/img/14_poleron_eclipse.png';
    }
    if (nameLower.includes('polera')) {
      return '/assets/img/13_polera_forsaken_classic.png';
    }
    if (nameLower.includes('gorro')) {
      return '/assets/img/06_gorro_forsaken.png';
    }
    return '';
  }
}
