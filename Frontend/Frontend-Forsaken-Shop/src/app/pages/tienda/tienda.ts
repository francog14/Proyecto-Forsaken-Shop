import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Categoria, DetalleVenta, Pedido, Prenda, Usuario, Venta } from '../../models/forsaken.models';
import { CategoriaService } from '../../services/categoria.service';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { PrendaService } from '../../services/prenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

interface CarritoItem {
  prenda: Prenda;
  cantidad: number;
}

interface ComprobanteItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

@Component({
  selector: 'app-tienda',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss',
})
export class TiendaComponent implements OnInit {
  private readonly prendaService = inject(PrendaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly ventaService = inject(VentaService);
  private readonly detalleVentaService = inject(DetalleVentaService);
  private readonly pedidoService = inject(PedidoService);
  private readonly authService = inject(AuthService);

  readonly prendas = signal<Prenda[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly ventas = signal<Venta[]>([]);
  readonly detalles = signal<DetalleVenta[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly carrito = signal<CarritoItem[]>([]);
  readonly ultimaVenta = signal<Venta | null>(null);
  readonly comprobante = signal<ComprobanteItem[]>([]);
  readonly error = signal('');
  readonly exito = signal('');
  readonly comprando = signal(false);

  usuarioSeleccionado = 0;

  ngOnInit() {
    this.cargarTienda();
  }

  cargarTienda() {
    this.error.set('');
    this.exito.set('');

    this.prendaService.listar().subscribe({
      next: (prendas) => this.prendas.set(prendas),
      error: () => this.error.set('No se pudieron cargar las prendas.'),
    });

    this.categoriaService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.error.set('No se pudieron cargar las categorias.'),
    });

    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        const emailSesion = this.authService.session()?.email;
        const usuarioSesion = usuarios.find((usuario) => usuario.email === emailSesion);
        if (usuarioSesion) {
          this.usuarioSeleccionado = usuarioSesion.id_usuario;
        } else if (!this.usuarioSeleccionado && usuarios.length) {
          this.usuarioSeleccionado = usuarios[0].id_usuario;
        }
      },
      error: () => this.error.set('No se pudieron cargar los usuarios para comprar.'),
    });

    this.ventaService.listar().subscribe({
      next: (ventas) => this.ventas.set(ventas),
      error: () => this.error.set('No se pudieron cargar tus compras.'),
    });

    this.detalleVentaService.listar().subscribe({
      next: (detalles) => this.detalles.set(detalles),
      error: () => this.error.set('No se pudieron cargar los detalles de compra.'),
    });

    this.pedidoService.listar().subscribe({
      next: (pedidos) => this.pedidos.set(pedidos),
      error: () => this.error.set('No se pudieron cargar los pedidos.'),
    });
  }

  agregar(prenda: Prenda) {
    if (prenda.stock_prenda <= 0) {
      this.error.set('Esta prenda no tiene stock disponible.');
      return;
    }

    const actual = this.carrito();
    const existente = actual.find((item) => item.prenda.id_prenda === prenda.id_prenda);

    if (existente) {
      if (existente.cantidad >= prenda.stock_prenda) {
        this.error.set('No hay mas stock disponible para esta prenda.');
        return;
      }

      this.carrito.set(actual.map((item) =>
        item.prenda.id_prenda === prenda.id_prenda ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
      return;
    }

    this.carrito.set([...actual, { prenda, cantidad: 1 }]);
  }

  cambiarCantidad(idPrenda: number, cantidad: number) {
    const normalizada = Math.max(1, Number(cantidad));
    this.carrito.set(this.carrito().map((item) => {
      if (item.prenda.id_prenda !== idPrenda) {
        return item;
      }

      return { ...item, cantidad: Math.min(normalizada, item.prenda.stock_prenda) };
    }));
  }

  quitar(idPrenda: number) {
    this.carrito.set(this.carrito().filter((item) => item.prenda.id_prenda !== idPrenda));
  }

  total() {
    return this.carrito().reduce((acc, item) => acc + item.prenda.precio_prenda * item.cantidad, 0);
  }

  stockTotal() {
    return this.prendas().reduce((acc, prenda) => acc + prenda.stock_prenda, 0);
  }

  productosDestacados() {
    return this.prendas()
      .filter((prenda) => prenda.stock_prenda > 0)
      .slice(0, 3);
  }

  categoriasDestacadas() {
    return this.categorias().slice(0, 4);
  }

  cantidadPorCategoria(idCategoria: number) {
    return this.prendas().filter((prenda) => prenda.id_categoria === idCategoria).length;
  }

  estadoPrenda(prenda: Prenda) {
    if (prenda.stock_prenda <= 0) {
      return 'agotado';
    }

    if (prenda.stock_prenda <= 3) {
      return 'poco-stock';
    }

    return 'disponible';
  }

  textoEstadoPrenda(prenda: Prenda) {
    const estado = this.estadoPrenda(prenda);

    if (estado === 'agotado') {
      return 'Sin stock';
    }

    if (estado === 'poco-stock') {
      return 'Poco stock';
    }

    return 'Disponible';
  }

  comprar() {
    this.error.set('');
    this.exito.set('');

    if (!this.usuarioSeleccionado) {
      this.error.set('No hay un usuario disponible para registrar la compra.');
      return;
    }

    if (!this.carrito().length) {
      this.error.set('Agrega al menos una prenda al carrito.');
      return;
    }

    this.comprando.set(true);
    const comprobante = this.carrito().map((item) => ({
      nombre: item.prenda.nombre_prenda,
      cantidad: item.cantidad,
      precio: item.prenda.precio_prenda,
    }));

    this.ventaService.crear({
      fecha: new Date().toISOString().slice(0, 10),
      total: this.total(),
      id_usuario: Number(this.usuarioSeleccionado),
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
            this.crearPedidoParaVenta(venta, comprobante);
          },
          error: () => {
            this.error.set('La venta se creo, pero fallo al registrar un detalle.');
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

  nombreCategoria(id: number) {
    return this.categorias().find((categoria) => categoria.id_categoria === id)?.nombre_categoria ?? 'Sin categoria';
  }

  misCompras() {
    return this.ventas()
      .filter((venta) => venta.id_usuario === Number(this.usuarioSeleccionado))
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

  usuarioCompra() {
    return this.usuarios().find((usuario) => usuario.id_usuario === Number(this.usuarioSeleccionado));
  }

  private crearPedidoParaVenta(venta: Venta, comprobante: ComprobanteItem[]) {
    const usuario = this.usuarioCompra();
    this.pedidoService.crear({
      id_usuario: venta.id_usuario,
      id_venta: venta.id_venta,
      rut_cliente: usuario?.run ?? '',
      estado: 'PAGADO',
      fecha_pedido: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: () => {
        this.ultimaVenta.set(venta);
        this.comprobante.set(comprobante);
        this.carrito.set([]);
        this.exito.set('Compra y pedido registrados correctamente.');
        this.comprando.set(false);
        this.cargarTienda();
      },
      error: () => {
        this.ultimaVenta.set(venta);
        this.comprobante.set(comprobante);
        this.carrito.set([]);
        this.error.set('La compra se registro, pero no se pudo crear el pedido.');
        this.comprando.set(false);
        this.cargarTienda();
      },
    });
  }
}
