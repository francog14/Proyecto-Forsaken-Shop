import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { MensajeService } from '../../services/mensaje.service';
import { PrendaService } from '../../services/prenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink],
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

  readonly cargando = signal(true);
  readonly error = signal('');
  readonly stats = signal([
    { label: 'Prendas', value: '0', path: '/catalogo' },
    { label: 'Categorias', value: '0', path: '/categorias' },
    { label: 'Usuarios', value: '0', path: '/usuarios' },
    { label: 'Ventas', value: '0', path: '/ventas' },
  ]);
  readonly totalVentas = signal(0);
  readonly stockTotal = signal(0);
  readonly mensajes = signal(0);
  readonly detalles = signal(0);

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
    }).subscribe({
      next: ({ categorias, prendas, usuarios, ventas, detalles, mensajes }) => {
        this.stats.set([
          { label: 'Prendas', value: String(prendas.length), path: '/catalogo' },
          { label: 'Categorias', value: String(categorias.length), path: '/categorias' },
          { label: 'Usuarios', value: String(usuarios.length), path: '/usuarios' },
          { label: 'Ventas', value: String(ventas.length), path: '/ventas' },
        ]);
        this.totalVentas.set(ventas.reduce((acc, venta) => acc + Number(venta.total), 0));
        this.stockTotal.set(prendas.reduce((acc, prenda) => acc + Number(prenda.stock_prenda), 0));
        this.mensajes.set(mensajes.length);
        this.detalles.set(detalles.length);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen.');
        this.cargando.set(false);
      },
    });
  }
}
