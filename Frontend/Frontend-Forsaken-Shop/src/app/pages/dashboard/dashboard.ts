import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Venta, DetalleVenta, Prenda, Usuario } from '../../models/forsaken.models';
import { CategoriaService } from '../../services/categoria.service';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { MensajeService } from '../../services/mensaje.service';
import { PedidoService } from '../../services/pedido.service';
import { PrendaService } from '../../services/prenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

interface TopProduct {
  nombre: string;
  talla: string;
  color: string;
  cantidad: number;
}

interface RecentSale {
  id: number;
  fecha: string;
  cliente: string;
  total: number;
  estado: string;
}

interface ServiceStatus {
  name: string;
  port: string;
  online: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private readonly categoriasService = inject(CategoriaService);
  private readonly prendasService = inject(PrendaService);
  private readonly usuariosService = inject(UsuarioService);
  private readonly ventasService = inject(VentaService);
  private readonly detallesService = inject(DetalleVentaService);
  private readonly mensajesService = inject(MensajeService);
  private readonly pedidosService = inject(PedidoService);

  readonly cargando = signal(true);
  readonly error = signal('');
  readonly stats = signal([
    { label: 'Ventas Totales Mensuales', value: '$0', icon: 'chart', path: '/ventas' },
    { label: 'Nuevos Pedidos', value: '0', icon: 'orders', path: '/pedidos' },
    { label: 'Clientes Registrados', value: '0', icon: 'users', path: '/usuarios' },
    { label: 'Stock Bajo Alertas', value: '0', icon: 'alert', path: '/bodega' },
  ]);
  readonly totalVentas = signal(0);
  readonly stockTotal = signal(0);
  readonly mensajes = signal(0);
  readonly detalles = signal(0);
  readonly recentSales = signal<RecentSale[]>([]);
  readonly topProducts = signal<TopProduct[]>([]);
  readonly pendingOrders = signal(0);
  readonly completedOrders = signal(0);
  readonly bajoStockCount = signal(0);

  readonly services: ServiceStatus[] = [
    { name: 'CATEGORÍA', port: '7070', online: true },
    { name: 'ROL', port: '7075', online: true },
    { name: 'VENTA', port: '7077', online: true },
    { name: 'DETALLE VENTA', port: '7078', online: true },
    { name: 'MENSAJERÍA', port: '7079', online: true },
    { name: 'PEDIDO', port: '7080', online: true },
    { name: 'AUTH', port: '7081', online: true },
    { name: 'USUARIO', port: '7082', online: true },
    { name: 'PRENDA', port: '7580', online: true },
  ];

  ngOnInit() {
    this.cargarResumen();
  }

  cargarResumen() {
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      categorias: this.categoriasService.listar().pipe(catchError(() => of([]))),
      prendas: this.prendasService.listar().pipe(catchError(() => of([]))),
      usuarios: this.usuariosService.listar().pipe(catchError(() => of([]))),
      ventas: this.ventasService.listar().pipe(catchError(() => of([]))),
      detalles: this.detallesService.listar().pipe(catchError(() => of([]))),
      mensajes: this.mensajesService.listar().pipe(catchError(() => of([]))),
      pedidos: this.pedidosService.listar().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ categorias, prendas, usuarios, ventas, detalles, mensajes, pedidos }) => {
        const totalVendido = ventas.reduce((acc, venta) => acc + Number(venta.total), 0);
        const bajoStock = prendas.filter(p => p.stock_prenda <= 5).length;
        const pendientes = pedidos.filter(p => p.estado !== 'PAGADO' && p.estado !== 'ENTREGADO').length;
        const completados = pedidos.filter(p => p.estado === 'PAGADO' || p.estado === 'ENTREGADO').length;

        this.stats.set([
          { label: 'Ventas Totales Mensuales', value: this.formatCurrency(totalVendido), icon: 'chart', path: '/ventas' },
          { label: 'Nuevos Pedidos', value: String(pedidos.length), icon: 'orders', path: '/pedidos' },
          { label: 'Clientes Registrados', value: String(usuarios.length).replace(/\B(?=(\d{3})+(?!\d))/g, ','), icon: 'users', path: '/usuarios' },
          { label: 'Stock Bajo Alertas', value: String(bajoStock), icon: 'alert', path: '/bodega' },
        ]);

        this.totalVentas.set(totalVendido);
        this.stockTotal.set(prendas.reduce((acc, prenda) => acc + Number(prenda.stock_prenda), 0));
        this.mensajes.set(mensajes.length);
        this.detalles.set(detalles.length);
        this.bajoStockCount.set(bajoStock);
        this.pendingOrders.set(pendientes);
        this.completedOrders.set(completados);

        this.buildRecentSales(ventas, usuarios, pedidos);
        this.buildTopProducts(detalles, prendas);

        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen.');
        this.cargando.set(false);
      },
    });
  }

  private formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toString();
  }

  private buildRecentSales(ventas: Venta[], usuarios: Usuario[], pedidos: any[]) {
    const recent = ventas
      .sort((a, b) => b.id_venta - a.id_venta)
      .slice(0, 8)
      .map(venta => {
        const usuario = usuarios.find(u => u.id_usuario === venta.id_usuario);
        const pedido = pedidos.find((p: any) => p.id_venta === venta.id_venta);
        return {
          id: venta.id_venta,
          fecha: venta.fecha,
          cliente: usuario?.nombre ?? `Usuario ${venta.id_usuario}`,
          total: Number(venta.total),
          estado: pedido?.estado ?? 'Pendiente',
        };
      });
    this.recentSales.set(recent);
  }

  private buildTopProducts(detalles: DetalleVenta[], prendas: Prenda[]) {
    const countMap = new Map<number, number>();
    detalles.forEach(d => {
      countMap.set(d.id_prenda, (countMap.get(d.id_prenda) ?? 0) + d.cantidad);
    });

    const top = Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, cantidad]) => {
        const prenda = prendas.find(p => p.id_prenda === id);
        return {
          nombre: prenda?.nombre_prenda ?? `Prenda ${id}`,
          talla: prenda?.talla ?? '-',
          color: prenda?.color ?? '-',
          cantidad,
        };
      });

    this.topProducts.set(top);
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
