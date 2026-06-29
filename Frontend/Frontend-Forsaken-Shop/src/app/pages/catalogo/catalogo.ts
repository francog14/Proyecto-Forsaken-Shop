import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria, Prenda } from '../../models/forsaken.models';
import { CategoriaService } from '../../services/categoria.service';
import { PrendaService } from '../../services/prenda.service';

type PrendaFormulario = Omit<Prenda, 'id_prenda'> & { id_prenda?: number };

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class CatalogoComponent implements OnInit {
  private readonly prendaService = inject(PrendaService);
  private readonly categoriaService = inject(CategoriaService);

  readonly prendas = signal<Prenda[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  formulario: PrendaFormulario = this.formularioVacio();

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    this.categoriaService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.error.set('No se pudieron cargar las categorias.'),
    });

    this.prendaService.listar().subscribe({
      next: (prendas) => {
        this.prendas.set(prendas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las prendas.');
        this.cargando.set(false);
      },
    });
  }

  guardar() {
    this.error.set('');
    this.exito.set('');

    if (!this.formulario.nombre_prenda || !this.formulario.nombre_prenda.trim()) {
      this.error.set('El nombre de la prenda no puede estar vacío.');
      return;
    }
    if (this.formulario.precio_prenda === undefined || this.formulario.precio_prenda === null || this.formulario.precio_prenda <= 0) {
      this.error.set('El precio debe ser un valor mayor a 0.');
      return;
    }
    if (!this.formulario.talla || !this.formulario.talla.trim()) {
      this.error.set('La talla no puede estar vacía.');
      return;
    }
    if (!this.formulario.color || !this.formulario.color.trim()) {
      this.error.set('El color no puede estar vacío.');
      return;
    }
    if (this.formulario.stock_prenda === undefined || this.formulario.stock_prenda === null || this.formulario.stock_prenda < 0) {
      this.error.set('El stock debe ser un valor mayor o igual a 0.');
      return;
    }
    if (!this.formulario.id_categoria || this.formulario.id_categoria <= 0) {
      this.error.set('Debes seleccionar una categoría válida.');
      return;
    }

    // Clean values before sending
    this.formulario.nombre_prenda = this.formulario.nombre_prenda.trim();
    this.formulario.talla = this.formulario.talla.trim();
    this.formulario.color = this.formulario.color.trim();

    if (this.formulario.id_prenda) {
      this.prendaService.actualizar(this.formulario as Prenda).subscribe({
        next: () => this.finalizarGuardado('Prenda actualizada.'),
        error: () => this.error.set('No se pudo actualizar la prenda.'),
      });
      return;
    }

    const { id_prenda, ...nuevaPrenda } = this.formulario;
    this.prendaService.crear(nuevaPrenda).subscribe({
      next: () => this.finalizarGuardado('Prenda creada.'),
      error: () => this.error.set('No se pudo crear la prenda. Revisa la categoria.'),
    });
  }

  editar(prenda: Prenda) {
    this.formulario = { ...prenda };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number) {
    this.prendaService.eliminar(id).subscribe({
      next: () => this.finalizarGuardado('Prenda eliminada.'),
      error: () => this.error.set('No se pudo eliminar la prenda.'),
    });
  }

  cancelar() {
    this.formulario = this.formularioVacio();
    this.error.set('');
    this.exito.set('');
  }

  nombreCategoria(id: number) {
    return this.categorias().find((categoria) => categoria.id_categoria === id)?.nombre_categoria ?? `Categoria ${id}`;
  }

  private finalizarGuardado(mensaje: string) {
    this.exito.set(mensaje);
    this.formulario = this.formularioVacio();
    this.cargarDatos();
  }

  private formularioVacio(): PrendaFormulario {
    return {
      nombre_prenda: '',
      precio_prenda: 0,
      talla: '',
      color: '',
      stock_prenda: 0,
      id_categoria: 0,
    };
  }
}
