import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rol, Usuario } from '../../models/forsaken.models';
import { RolService } from '../../services/rol.service';
import { UsuarioService } from '../../services/usuario.service';

type UsuarioFormulario = Omit<Usuario, 'id_usuario'> & { id_usuario?: number };

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly error = signal('');
  readonly exito = signal('');

  formulario: UsuarioFormulario = this.formularioVacio();

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');
    this.usuarioService.listar().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.error.set('No se pudieron cargar los usuarios.'),
    });

    this.rolService.listar().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles.'),
    });
  }

  guardar() {
    this.error.set('');
    this.exito.set('');

    if (this.formulario.id_usuario) {
      this.usuarioService.actualizar(this.formulario as Usuario).subscribe({
        next: () => this.finalizar('Usuario actualizado.'),
        error: () => this.error.set('No se pudo actualizar el usuario.'),
      });
      return;
    }

    const { id_usuario, ...nuevoUsuario } = this.formulario;
    this.usuarioService.crear(nuevoUsuario).subscribe({
      next: () => this.finalizar('Usuario creado.'),
      error: () => this.error.set('No se pudo crear el usuario. Revisa el rol.'),
    });
  }

  editar(usuario: Usuario) {
    this.formulario = { ...usuario };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number) {
    this.usuarioService.eliminar(id).subscribe({
      next: () => this.finalizar('Usuario eliminado.'),
      error: () => this.error.set('No se pudo eliminar el usuario.'),
    });
  }

  limpiar() {
    this.formulario = this.formularioVacio();
  }

  nombreRol(id: number) {
    return this.roles().find((rol) => rol.id_rol === id)?.nombre_rol ?? `Rol ${id}`;
  }

  private finalizar(mensaje: string) {
    this.exito.set(mensaje);
    this.limpiar();
    this.cargarDatos();
  }

  private formularioVacio(): UsuarioFormulario {
    return {
      run: '',
      nombre: '',
      email: '',
      id_rol: 0,
    };
  }
}
