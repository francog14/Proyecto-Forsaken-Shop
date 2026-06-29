import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mensaje, Usuario } from '../../models/forsaken.models';
import { MensajeService } from '../../services/mensaje.service';
import { UsuarioService } from '../../services/usuario.service';

type MensajeFormulario = Omit<Mensaje, 'id_mensaje'> & { id_mensaje?: number };

@Component({
  selector: 'app-mensajes',
  imports: [DatePipe, FormsModule],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.scss',
})
export class MensajesComponent implements OnInit {
  private readonly mensajeService = inject(MensajeService);
  private readonly usuarioService = inject(UsuarioService);

  readonly mensajes = signal<Mensaje[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly error = signal('');
  readonly exito = signal('');

  formulario: MensajeFormulario = this.formularioVacio();

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');
    this.mensajeService.listar().subscribe({
      next: (mensajes) => this.mensajes.set(mensajes),
      error: () => this.error.set('No se pudieron cargar los mensajes.'),
    });

    this.usuarioService.listar().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.error.set('No se pudieron cargar los usuarios.'),
    });
  }

  guardar() {
    this.error.set('');
    this.exito.set('');

    if (!this.formulario.id_usuario || this.formulario.id_usuario <= 0) {
      this.error.set('Debes seleccionar un usuario válido.');
      return;
    }
    if (!this.formulario.asunto || !this.formulario.asunto.trim()) {
      this.error.set('El asunto no puede estar vacío.');
      return;
    }
    if (!this.formulario.contenido || !this.formulario.contenido.trim()) {
      this.error.set('El contenido del mensaje no puede estar vacío.');
      return;
    }

    // Clean values before sending
    this.formulario.asunto = this.formulario.asunto.trim();
    this.formulario.contenido = this.formulario.contenido.trim();

    if (this.formulario.id_mensaje) {
      this.mensajeService.actualizar(this.formulario as Mensaje).subscribe({
        next: () => this.finalizar('Mensaje actualizado.'),
        error: () => this.error.set('No se pudo actualizar el mensaje.'),
      });
      return;
    }

    const { id_mensaje, ...nuevoMensaje } = this.formulario;
    this.mensajeService.crear(nuevoMensaje).subscribe({
      next: () => this.finalizar('Mensaje creado.'),
      error: () => this.error.set('No se pudo crear el mensaje. Revisa el usuario.'),
    });
  }

  editar(mensaje: Mensaje) {
    this.formulario = { ...mensaje, fecha_envio: mensaje.fecha_envio.slice(0, 10) };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number) {
    this.mensajeService.eliminar(id).subscribe({
      next: () => this.finalizar('Mensaje eliminado.'),
      error: () => this.error.set('No se pudo eliminar el mensaje.'),
    });
  }

  limpiar() {
    this.formulario = this.formularioVacio();
  }

  nombreUsuario(id: number) {
    return this.usuarios().find((usuario) => usuario.id_usuario === id)?.nombre ?? `Usuario ${id}`;
  }

  private finalizar(mensaje: string) {
    this.exito.set(mensaje);
    this.limpiar();
    this.cargarDatos();
  }

  private formularioVacio(): MensajeFormulario {
    return {
      id_usuario: 0,
      asunto: '',
      contenido: '',
      fecha_envio: new Date().toISOString().slice(0, 10),
    };
  }
}
