import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria, Rol } from '../../models/forsaken.models';
import { CategoriaService } from '../../services/categoria.service';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class CategoriasComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly rolService = inject(RolService);

  readonly categorias = signal<Categoria[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly error = signal('');
  readonly exito = signal('');

  categoria: Categoria = { id_categoria: 0, nombre_categoria: '' };
  rol: Rol = { id_rol: 0, nombre_rol: '' };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');
    this.categoriaService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.error.set('No se pudieron cargar las categorias.'),
    });

    this.rolService.listar().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles.'),
    });
  }

  guardarCategoria() {
    if (this.categoria.id_categoria) {
      this.categoriaService.actualizar(this.categoria).subscribe({
        next: () => this.finalizar('Categoria actualizada.'),
        error: () => this.error.set('No se pudo actualizar la categoria.'),
      });
      return;
    }

    this.categoriaService.crear({ nombre_categoria: this.categoria.nombre_categoria }).subscribe({
      next: () => this.finalizar('Categoria creada.'),
      error: () => this.error.set('No se pudo crear la categoria.'),
    });
  }

  guardarRol() {
    if (this.rol.id_rol) {
      this.rolService.actualizar(this.rol).subscribe({
        next: () => this.finalizar('Rol actualizado.'),
        error: () => this.error.set('No se pudo actualizar el rol.'),
      });
      return;
    }

    this.rolService.crear({ nombre_rol: this.rol.nombre_rol }).subscribe({
      next: () => this.finalizar('Rol creado.'),
      error: () => this.error.set('No se pudo crear el rol.'),
    });
  }

  editarCategoria(categoria: Categoria) {
    this.categoria = { ...categoria };
  }

  editarRol(rol: Rol) {
    this.rol = { ...rol };
  }

  eliminarCategoria(id: number) {
    this.categoriaService.eliminar(id).subscribe({
      next: () => this.finalizar('Categoria eliminada.'),
      error: () => this.error.set('No se pudo eliminar la categoria.'),
    });
  }

  eliminarRol(id: number) {
    this.rolService.eliminar(id).subscribe({
      next: () => this.finalizar('Rol eliminado.'),
      error: () => this.error.set('No se pudo eliminar el rol.'),
    });
  }

  limpiar() {
    this.categoria = { id_categoria: 0, nombre_categoria: '' };
    this.rol = { id_rol: 0, nombre_rol: '' };
  }

  private finalizar(mensaje: string) {
    this.exito.set(mensaje);
    this.limpiar();
    this.cargarDatos();
  }
}
