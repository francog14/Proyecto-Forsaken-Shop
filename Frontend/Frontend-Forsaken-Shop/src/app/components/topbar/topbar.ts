import { Component, HostListener, computed, inject, output, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Actor, Pedido, Mensaje } from '../../models/forsaken.models';
import { ActorService } from '../../services/actor.service';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { MensajeService } from '../../services/mensaje.service';
import { CartService } from '../../services/cart.service';

interface NavLink {
  path: string;
  label: string;
  actores: Actor[];
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class TopbarComponent implements OnInit {
  private readonly actorService = inject(ActorService);
  private readonly authService = inject(AuthService);
  private readonly pedidoService = inject(PedidoService);
  private readonly mensajeService = inject(MensajeService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly toggleMobileSidebar = output<void>();
  readonly actor = this.actorService.actor;
  readonly session = this.authService.session;
  readonly menuAbierto = signal(false);
  readonly scrolled = signal(false);
  readonly cartCount = this.cartService.itemsCount;

  // Dropdown States
  readonly showNotifications = signal(false);
  readonly showMessages = signal(false);
  readonly showUserMenu = signal(false);

  // Data signals
  readonly recentPedidos = signal<Pedido[]>([]);
  readonly recentMensajes = signal<Mensaje[]>([]);

  // Computed properties
  readonly pendingPedidosCount = computed(() => {
    return this.recentPedidos().filter(
      (p) => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO'
    ).length;
  });

  readonly hasSidebar = computed(() => {
    const a = this.actor();
    return a === 'admin' || a === 'vendedor' || a === 'bodeguero';
  });

  private readonly links: NavLink[] = [
    { path: '/tienda', label: 'Tienda', actores: ['usuario'] },
    { path: '/productos', label: 'Catálogo', actores: ['usuario'] },
    { path: '/carrito', label: 'Carrito', actores: ['usuario'] },
    { path: '/mi-cuenta', label: 'Mi Cuenta', actores: ['usuario'] },
    { path: '/mensajes', label: 'Soporte', actores: ['usuario'] },
  ];

  readonly linksVisibles = computed(() =>
    this.links.filter((link) => link.actores.includes(this.actor()))
  );

  ngOnInit() {
    this.cargarDatosTop();
  }

  cargarDatosTop() {
    if (this.hasSidebar()) {
      this.pedidoService.listar().subscribe({
        next: (pedidos) => {
          const sorted = [...pedidos].sort((a, b) => b.id_pedido - a.id_pedido);
          this.recentPedidos.set(sorted.slice(0, 4));
        },
        error: () => {},
      });

      this.mensajeService.listar().subscribe({
        next: (mensajes) => {
          const sorted = [...mensajes].sort((a, b) => b.id_mensaje - a.id_mensaje);
          this.recentMensajes.set(sorted.slice(0, 4));
        },
        error: () => {},
      });
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdowns();
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showMessages.set(false);
    this.showUserMenu.set(false);
    this.showNotifications.update((val) => !val);
    if (this.showNotifications()) {
      this.cargarPedidos();
    }
  }

  toggleMessages(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
    this.showMessages.update((val) => !val);
    if (this.showMessages()) {
      this.cargarMensajes();
    }
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications.set(false);
    this.showMessages.set(false);
    this.showUserMenu.update((val) => !val);
  }

  cargarPedidos() {
    this.pedidoService.listar().subscribe({
      next: (pedidos) => {
        const sorted = [...pedidos].sort((a, b) => b.id_pedido - a.id_pedido);
        this.recentPedidos.set(sorted.slice(0, 4));
      },
      error: () => {},
    });
  }

  cargarMensajes() {
    this.mensajeService.listar().subscribe({
      next: (mensajes) => {
        const sorted = [...mensajes].sort((a, b) => b.id_mensaje - a.id_mensaje);
        this.recentMensajes.set(sorted.slice(0, 4));
      },
      error: () => {},
    });
  }

  canAccessMessages() {
    const a = this.actor();
    return a === 'admin' || a === 'vendedor';
  }

  irAPedidos() {
    this.router.navigateByUrl('/pedidos');
    this.closeDropdowns();
  }

  irAMensajes() {
    if (this.canAccessMessages()) {
      this.router.navigateByUrl('/mensajes');
    }
    this.closeDropdowns();
  }

  closeDropdowns() {
    this.showNotifications.set(false);
    this.showMessages.set(false);
    this.showUserMenu.set(false);
  }

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  onHamburgerClick() {
    if (this.hasSidebar()) {
      this.toggleMobileSidebar.emit();
    } else {
      this.alternarMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.actorService.cambiarActor('usuario');
    this.router.navigateByUrl('/login');
    this.cerrarMenu();
  }
}
