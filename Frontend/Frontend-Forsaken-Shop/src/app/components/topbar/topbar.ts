import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Actor } from '../../models/forsaken.models';
import { ActorService } from '../../services/actor.service';
import { AuthService } from '../../services/auth.service';

interface NavLink {
  path: string;
  label: string;
  actores: Actor[];
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class TopbarComponent {
  private readonly actorService = inject(ActorService);
  private readonly authService = inject(AuthService);

  readonly actor = this.actorService.actor;
  readonly session = this.authService.session;
  readonly menuAbierto = signal(false);
  readonly scrolled = signal(false);

  private readonly links: NavLink[] = [
    { path: '/tienda', label: 'Tienda', actores: ['usuario'] },
    { path: '/mensajes', label: 'Soporte', actores: ['usuario', 'vendedor', 'admin'] },
    { path: '/vendedor', label: 'Inicio', actores: ['vendedor'] },
    { path: '/ventas', label: 'Ventas', actores: ['vendedor', 'admin'] },
    { path: '/pedidos', label: 'Pedidos', actores: ['vendedor', 'bodeguero', 'admin'] },
    { path: '/bodega', label: 'Inicio', actores: ['bodeguero'] },
    { path: '/catalogo', label: 'Prendas', actores: ['bodeguero', 'admin'] },
    { path: '/categorias', label: 'Categorias', actores: ['bodeguero', 'admin'] },
    { path: '/admin', label: 'Inicio', actores: ['admin'] },
    { path: '/usuarios', label: 'Usuarios', actores: ['admin', 'vendedor'] },
  ];

  readonly linksVisibles = computed(() =>
    this.links.filter((link) => link.actores.includes(this.actor()))
  );

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  logout() {
    this.authService.logout();
    this.actorService.cambiarActor('usuario');
    this.cerrarMenu();
  }
}
