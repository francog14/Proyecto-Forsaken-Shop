import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Actor } from '../../models/forsaken.models';
import { ActorService } from '../../services/actor.service';
import { AuthService } from '../../services/auth.service';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  actores: Actor[];
  children?: { path: string; label: string }[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly actorService = inject(ActorService);
  private readonly authService = inject(AuthService);

  readonly closeMobile = output<void>();
  readonly actor = this.actorService.actor;
  readonly session = this.authService.session;

  expandedMenus: Set<string> = new Set();

  private readonly links: SidebarLink[] = [
    { path: '/admin', label: 'Panel', icon: 'dashboard', actores: ['admin'] },
    { path: '/vendedor', label: 'Panel', icon: 'dashboard', actores: ['vendedor'] },
    { path: '/bodega', label: 'Panel', icon: 'dashboard', actores: ['bodeguero'] },
    {
      path: '/catalogo', label: 'Inventario', icon: 'inventory', actores: ['bodeguero', 'admin'],
      children: [
        { path: '/catalogo', label: 'Prendas' },
        { path: '/categorias', label: 'Categorías' },
      ]
    },
    { path: '/ventas', label: 'Ventas', icon: 'sales', actores: ['vendedor', 'admin'] },
    { path: '/usuarios', label: 'Usuarios & Roles', icon: 'users', actores: ['admin', 'vendedor'] },
    { path: '/pedidos', label: 'Pedidos', icon: 'orders', actores: ['vendedor', 'bodeguero', 'admin'] },
    { path: '/mensajes', label: 'Mensajería', icon: 'messages', actores: ['admin', 'vendedor'] },
  ];

  readonly linksVisibles = computed(() =>
    this.links.filter((link) => link.actores.includes(this.actor()))
  );

  toggleMenu(label: string) {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isExpanded(label: string) {
    return this.expandedMenus.has(label);
  }

  onLinkClick() {
    this.closeMobile.emit();
  }
}
