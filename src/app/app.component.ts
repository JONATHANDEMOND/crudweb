import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// CORRECCIÓN: 'b' minúscula en el nombre de la clase
import { NavbarComponent } from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // CORRECCIÓN: 'b' minúscula aquí también
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'crudweb';
}
