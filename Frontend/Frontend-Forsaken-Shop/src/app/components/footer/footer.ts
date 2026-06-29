import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  private readonly authService = inject(AuthService);
  readonly session = this.authService.session;
  readonly year = new Date().getFullYear();
}
