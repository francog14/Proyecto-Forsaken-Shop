import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DetalleVenta, Pedido, Prenda, Usuario, Venta } from '../../models/forsaken.models';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { PedidoService } from '../../services/pedido.service';
import { PrendaService } from '../../services/prenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

interface PosItem {
  prenda: Prenda;
  cantidad: number;
}

@Component({
  selector: 'app-vendedor',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './vendedor.html',
  styleUrl: './vendedor.scss',
})
export class VendedorComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly detalleService = inject(DetalleVentaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly prendaService = inject(PrendaService);
  private readonly pedidoService = inject(PedidoService);

  readonly ventas = signal<Venta[]>([]);
  readonly detalles = signal<DetalleVenta[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly prendas = signal<Prenda[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly error = signal('');
  readonly exito = signal('');
  readonly registrando = signal(false);

  // POS state
  readonly posItems = signal<PosItem[]>([]);
  busquedaProducto = '';
  busquedaCliente = '';
  clienteSeleccionado = 0;
  metodoPago: 'EFECTIVO' | 'TARJETA' = 'EFECTIVO';

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

    this.prendaService.listar().subscribe({
      next: (prendas) => this.prendas.set(prendas),
      error: () => this.error.set('No se pudieron cargar las prendas.'),
    });

    this.pedidoService.listar().subscribe({
      next: (pedidos) => this.pedidos.set(pedidos),
      error: () => this.error.set('No se pudieron cargar los pedidos.'),
    });
  }

  productosFiltrados() {
    if (!this.busquedaProducto.trim()) return this.prendas().filter(p => p.stock_prenda > 0).slice(0, 8);
    const q = this.busquedaProducto.toLowerCase();
    return this.prendas().filter(p => p.nombre_prenda.toLowerCase().includes(q) && p.stock_prenda > 0);
  }

  clientesFiltrados() {
    if (!this.busquedaCliente.trim()) return this.usuarios();
    const q = this.busquedaCliente.toLowerCase();
    return this.usuarios().filter(u => u.nombre.toLowerCase().includes(q) || u.run.includes(q));
  }

  agregarAlPos(prenda: Prenda) {
    const items = this.posItems();
    const existente = items.find(i => i.prenda.id_prenda === prenda.id_prenda);
    if (existente) {
      if (existente.cantidad >= prenda.stock_prenda) return;
      this.posItems.set(items.map(i =>
        i.prenda.id_prenda === prenda.id_prenda ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      this.posItems.set([...items, { prenda, cantidad: 1 }]);
    }
  }

  cambiarCantidadPos(idPrenda: number, cantidad: number) {
    const cant = Math.max(1, Number(cantidad));
    this.posItems.set(this.posItems().map(i =>
      i.prenda.id_prenda === idPrenda
        ? { ...i, cantidad: Math.min(cant, i.prenda.stock_prenda) }
        : i
    ));
  }

  quitarDelPos(idPrenda: number) {
    this.posItems.set(this.posItems().filter(i => i.prenda.id_prenda !== idPrenda));
  }

  subtotal() {
    return this.posItems().reduce((acc, i) => acc + i.prenda.precio_prenda * i.cantidad, 0);
  }

  iva() {
    return Math.round(this.subtotal() * 0.19);
  }

  totalPos() {
    return this.subtotal() + this.iva();
  }

  seleccionarCliente(id: number) {
    this.clienteSeleccionado = id;
  }

  clienteActual() {
    return this.usuarios().find(u => u.id_usuario === this.clienteSeleccionado);
  }

  confirmarVenta() {
    this.error.set('');
    this.exito.set('');

    if (!this.clienteSeleccionado) {
      this.error.set('Selecciona un cliente para registrar la venta.');
      return;
    }
    if (!this.posItems().length) {
      this.error.set('Agrega productos a la venta.');
      return;
    }

    this.registrando.set(true);

    this.ventaService.crear({
      fecha: new Date().toISOString().slice(0, 10),
      total: this.totalPos(),
      id_usuario: this.clienteSeleccionado,
    }).subscribe({
      next: (venta) => {
        const detalles = this.posItems().map(item => this.detalleService.crear({
          id_venta: venta.id_venta,
          id_prenda: item.prenda.id_prenda,
          cantidad: item.cantidad,
          precio_unitario: item.prenda.precio_prenda,
        }));

        forkJoin(detalles).subscribe({
          next: () => {
            const updates = this.posItems().map((item) => {
              const updatedPrenda: Prenda = {
                ...item.prenda,
                stock_prenda: item.prenda.stock_prenda - item.cantidad,
              };
              return this.prendaService.actualizar(updatedPrenda);
            });

            forkJoin(updates).subscribe({
              next: () => {
                const cliente = this.clienteActual();
                this.pedidoService.crear({
                  id_usuario: venta.id_usuario,
                  id_venta: venta.id_venta,
                  rut_cliente: cliente?.run ?? '',
                  estado: 'PAGADO',
                  fecha_pedido: new Date().toISOString().slice(0, 10),
                }).subscribe({
                  next: () => {
                    this.exito.set(`Venta #${venta.id_venta} registrada correctamente.`);
                    this.posItems.set([]);
                    this.registrando.set(false);
                    this.cargarDatos();
                  },
                  error: () => {
                    this.exito.set(`Venta #${venta.id_venta} registrada (pedido pendiente).`);
                    this.posItems.set([]);
                    this.registrando.set(false);
                    this.cargarDatos();
                  }
                });
              },
              error: () => {
                console.error('Failed to update garment stocks in POS');
                // Fallback: Proceed to order creation anyway
                const cliente = this.clienteActual();
                this.pedidoService.crear({
                  id_usuario: venta.id_usuario,
                  id_venta: venta.id_venta,
                  rut_cliente: cliente?.run ?? '',
                  estado: 'PAGADO',
                  fecha_pedido: new Date().toISOString().slice(0, 10),
                }).subscribe({
                  next: () => {
                    this.exito.set(`Venta #${venta.id_venta} registrada correctamente.`);
                    this.posItems.set([]);
                    this.registrando.set(false);
                    this.cargarDatos();
                  },
                  error: () => {
                    this.exito.set(`Venta #${venta.id_venta} registrada (pedido pendiente).`);
                    this.posItems.set([]);
                    this.registrando.set(false);
                    this.cargarDatos();
                  }
                });
              }
            });
          },
          error: () => {
            this.error.set('La venta se creó pero falló al registrar detalles.');
            this.registrando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo registrar la venta.');
        this.registrando.set(false);
      },
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

  pedidosPorSurtir() {
    return this.pedidos()
      .filter(p => p.estado !== 'ENTREGADO')
      .sort((a, b) => b.id_pedido - a.id_pedido)
      .slice(0, 6);
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
