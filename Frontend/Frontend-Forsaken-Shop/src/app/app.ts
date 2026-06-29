import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { FooterComponent } from './components/footer/footer';
import { ActorService } from './services/actor.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly actorService = inject(ActorService);
  protected readonly title = signal('Forsaken Shop');
  protected readonly sidebarMobileOpen = signal(false);

  protected readonly showSidebar = computed(() => {
    const actor = this.actorService.actor();
    return actor === 'admin' || actor === 'vendedor' || actor === 'bodeguero';
  });

  closeSidebarMobile() {
    this.sidebarMobileOpen.set(false);
  }

  toggleSidebarMobile() {
    this.sidebarMobileOpen.update(v => !v);
  }
}
