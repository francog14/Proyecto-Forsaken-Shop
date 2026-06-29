import { inject, Injectable, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CarritoItem, ComprobanteItem, Prenda, Venta } from '../models/forsaken.models';
import { VentaService } from './venta.service';
import { DetalleVentaService } from './detalle-venta.service';
import { PedidoService } from './pedido.service';
import { PrendaService } from './prenda.service';
import { UsuarioService } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly ventaService = inject(VentaService);
  private readonly detalleVentaService = inject(DetalleVentaService);
  private readonly pedidoService = inject(PedidoService);
  private readonly prendaService = inject(PrendaService);
  private readonly usuarioService = inject(UsuarioService);

  readonly carrito = signal<CarritoItem[]>(this.loadCartFromStorage());
  readonly ultimaVenta = signal<Venta | null>(null);
  readonly comprobante = signal<ComprobanteItem[]>([]);
  readonly error = signal('');
  readonly exito = signal('');
  readonly comprando = signal(false);

  readonly total = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.prenda.precio_prenda * item.cantidad, 0);
  });

  readonly itemsCount = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.cantidad, 0);
  });

  private loadCartFromStorage(): CarritoItem[] {
    try {
      const raw = localStorage.getItem('forsaken_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(items: CarritoItem[]) {
    localStorage.setItem('forsaken_cart', JSON.stringify(items));
  }

  agregar(prenda: Prenda) {
    this.error.set('');
    this.exito.set('');

    if (prenda.stock_prenda <= 0) {
      this.error.set('Esta prenda no tiene stock disponible.');
      return;
    }

    const actual = this.carrito();
    const existente = actual.find((item) => item.prenda.id_prenda === prenda.id_prenda);

    let nuevoCarrito: CarritoItem[];
    if (existente) {
      if (existente.cantidad >= prenda.stock_prenda) {
        this.error.set('No hay más stock disponible para esta prenda.');
        return;
      }
      nuevoCarrito = actual.map((item) =>
        item.prenda.id_prenda === prenda.id_prenda ? { ...item, cantidad: item.cantidad + 1 } : item
      );
    } else {
      nuevoCarrito = [...actual, { prenda, cantidad: 1 }];
    }

    this.carrito.set(nuevoCarrito);
    this.saveCartToStorage(nuevoCarrito);
    this.exito.set(`Añadido "${prenda.nombre_prenda}" al carrito.`);
  }

  cambiarCantidad(idPrenda: number, cantidad: number) {
    const normalizada = Math.max(1, Number(cantidad));
    const nuevoCarrito = this.carrito().map((item) => {
      if (item.prenda.id_prenda !== idPrenda) {
        return item;
      }
      return { ...item, cantidad: Math.min(normalizada, item.prenda.stock_prenda) };
    });
    this.carrito.set(nuevoCarrito);
    this.saveCartToStorage(nuevoCarrito);
  }

  quitar(idPrenda: number) {
    const nuevoCarrito = this.carrito().filter((item) => item.prenda.id_prenda !== idPrenda);
    this.carrito.set(nuevoCarrito);
    this.saveCartToStorage(nuevoCarrito);
  }

  limpiar() {
    this.carrito.set([]);
    localStorage.removeItem('forsaken_cart');
  }

  comprar(usuarioSeleccionadoId: number, onComplete?: () => void) {
    this.error.set('');
    this.exito.set('');

    if (!usuarioSeleccionadoId) {
      this.error.set('No hay un usuario disponible para registrar la compra.');
      return;
    }

    if (!this.carrito().length) {
      this.error.set('Agrega al menos una prenda al carrito.');
      return;
    }

    this.comprando.set(true);
    const comp = this.carrito().map((item) => ({
      nombre: item.prenda.nombre_prenda,
      cantidad: item.cantidad,
      precio: item.prenda.precio_prenda,
    }));

    this.ventaService.crear({
      fecha: new Date().toISOString().slice(0, 10),
      total: this.total(),
      id_usuario: Number(usuarioSeleccionadoId),
    }).subscribe({
      next: (venta) => {
        const detalles = this.carrito().map((item) => this.detalleVentaService.crear({
          id_venta: venta.id_venta,
          id_prenda: item.prenda.id_prenda,
          cantidad: item.cantidad,
          precio_unitario: item.prenda.precio_prenda,
        }));

        forkJoin(detalles).subscribe({
          next: () => {
            const updates = this.carrito().map((item) => {
              const updatedPrenda: Prenda = {
                ...item.prenda,
                stock_prenda: item.prenda.stock_prenda - item.cantidad,
              };
              return this.prendaService.actualizar(updatedPrenda);
            });

            forkJoin(updates).subscribe({
              next: () => {
                this.crearPedidoParaVenta(venta, comp, onComplete);
              },
              error: () => {
                console.error('Failed to update garment stocks');
                // Proceed anyway
                this.crearPedidoParaVenta(venta, comp, onComplete);
              },
            });
          },
          error: () => {
            this.error.set('La venta se creó, pero falló al registrar un detalle.');
            this.comprando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo registrar la compra.');
        this.comprando.set(false);
      },
    });
  }

  private crearPedidoParaVenta(venta: Venta, comp: ComprobanteItem[], onComplete?: () => void) {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find((u) => u.id_usuario === venta.id_usuario);
        this.pedidoService.crear({
          id_usuario: venta.id_usuario,
          id_venta: venta.id_venta,
          rut_cliente: usuario?.run ?? '',
          estado: 'PAGADO',
          fecha_pedido: new Date().toISOString().slice(0, 10),
        }).subscribe({
          next: () => {
            this.ultimaVenta.set(venta);
            this.comprobante.set(comp);
            this.limpiar();
            this.exito.set('Compra y pedido registrados correctamente.');
            this.comprando.set(false);
            if (onComplete) onComplete();
          },
          error: () => {
            this.ultimaVenta.set(venta);
            this.comprobante.set(comp);
            this.limpiar();
            this.error.set('La compra se registró, pero no se pudo crear el pedido.');
            this.comprando.set(false);
            if (onComplete) onComplete();
          },
        });
      },
      error: () => {
        this.comprando.set(false);
      }
    });
  }
}
