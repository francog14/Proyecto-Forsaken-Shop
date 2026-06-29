import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/forsaken.models';
import { CartService } from '../../services/cart.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito-page',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: '../tienda/tienda.scss',
})
export class CarritoComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly usuarioService = inject(UsuarioService);
  protected readonly authService = inject(AuthService);

  readonly usuarios = signal<Usuario[]>([]);
  usuarioSeleccionado = 0;

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);

        const emailSesion = this.authService.session()?.email;
        const usuarioSesion = usuarios.find((u) => u.email === emailSesion);
        if (usuarioSesion) {
          this.usuarioSeleccionado = usuarioSesion.id_usuario;
        } else {
          const guardado = localStorage.getItem('forsaken_simulated_user');
          if (guardado) {
            this.usuarioSeleccionado = Number(guardado);
          } else if (usuarios.length) {
            this.usuarioSeleccionado = usuarios[0].id_usuario;
          }
        }
      }
    });
  }

  cambiarUsuarioSimulado(id: number) {
    this.usuarioSeleccionado = Number(id);
    localStorage.setItem('forsaken_simulated_user', String(id));
  }

  comprar() {
    this.cartService.comprar(this.usuarioSeleccionado);
  }
}
