import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DetalleVenta, Pedido, Prenda, Usuario, Venta } from '../../models/forsaken.models';
import { AuthService } from '../../services/auth.service';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { PedidoService } from '../../services/pedido.service';
import { PrendaService } from '../../services/prenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-mi-cuenta',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.scss',
})
export class MiCuentaComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly detalleVentaService = inject(DetalleVentaService);
  private readonly pedidoService = inject(PedidoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly prendaService = inject(PrendaService);
  protected readonly authService = inject(AuthService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly ventas = signal<Venta[]>([]);
  readonly detalles = signal<DetalleVenta[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly prendas = signal<Prenda[]>([]);
  readonly error = signal('');
  readonly exito = signal('');

  usuarioSeleccionado = signal<number>(0);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');
    this.exito.set('');

    forkJoin({
      usuarios: this.usuarioService.listar(),
      ventas: this.ventaService.listar(),
      detalles: this.detalleVentaService.listar(),
      pedidos: this.pedidoService.listar(),
      prendas: this.prendaService.listar(),
    }).subscribe({
      next: ({ usuarios, ventas, detalles, pedidos, prendas }) => {
        this.usuarios.set(usuarios);
        this.ventas.set(ventas);
        this.detalles.set(detalles);
        this.pedidos.set(pedidos);
        this.prendas.set(prendas);

        // Mapear usuario inicial
        const emailSesion = this.authService.session()?.email;
        const usuarioSesion = usuarios.find((u) => u.email === emailSesion);
        if (usuarioSesion) {
          this.usuarioSeleccionado.set(usuarioSesion.id_usuario);
        } else {
          // Fallback a localStorage para simulación o primer usuario
          const guardado = localStorage.getItem('forsaken_simulated_user');
          if (guardado) {
            this.usuarioSeleccionado.set(Number(guardado));
          } else if (usuarios.length) {
            this.usuarioSeleccionado.set(usuarios[0].id_usuario);
          }
        }
      },
      error: () => {
        this.error.set('Error al cargar la información del usuario.');
      }
    });
  }

  cambiarUsuarioSimulado(id: number) {
    this.usuarioSeleccionado.set(id);
    localStorage.setItem('forsaken_simulated_user', String(id));
  }

  usuarioActual() {
    return this.usuarios().find((u) => u.id_usuario === this.usuarioSeleccionado());
  }

  misCompras() {
    return this.ventas()
      .filter((venta) => venta.id_usuario === this.usuarioSeleccionado())
      .sort((a, b) => b.id_venta - a.id_venta);
  }

  detallesDeVenta(idVenta: number) {
    return this.detalles().filter((detalle) => detalle.id_venta === idVenta);
  }

  nombrePrenda(id: number) {
    return this.prendas().find((prenda) => prenda.id_prenda === id)?.nombre_prenda ?? `Prenda ${id}`;
  }

  pedidoDeVenta(idVenta: number) {
    return this.pedidos().find((pedido) => pedido.id_venta === idVenta);
  }
}
