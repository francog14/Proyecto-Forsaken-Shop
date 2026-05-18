import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DetalleVenta, Usuario, Venta } from '../../models/forsaken.models';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-vendedor',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './vendedor.html',
  styleUrl: './vendedor.scss',
})
export class VendedorComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly detalleService = inject(DetalleVentaService);
  private readonly usuarioService = inject(UsuarioService);

  readonly ventas = signal<Venta[]>([]);
  readonly detalles = signal<DetalleVenta[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly error = signal('');

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.error.set('');

    this.ventaService.listar().subscribe({
      next: (ventas) => this.ventas.set(ventas),
      error: () => this.error.set('No se pudieron cargar las ventas.'),
    });

    this.detalleService.listar().subscribe({
      next: (detalles) => this.detalles.set(detalles),
      error: () => this.error.set('No se pudieron cargar los detalles.'),
    });

    this.usuarioService.listar().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.error.set('No se pudieron cargar los usuarios.'),
    });
  }

  totalVendido() {
    return this.ventas().reduce((acc, venta) => acc + Number(venta.total), 0);
  }

  prendasVendidas() {
    return this.detalles().reduce((acc, detalle) => acc + Number(detalle.cantidad), 0);
  }

  nombreUsuario(id: number) {
    return this.usuarios().find((usuario) => usuario.id_usuario === id)?.nombre ?? `Usuario ${id}`;
  }
}
