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

  nombreCategoria(id: number) {
    return this.categorias().find((categoria) => categoria.id_categoria === id)?.nombre_categoria ?? `Categoria ${id}`;
  }
}
