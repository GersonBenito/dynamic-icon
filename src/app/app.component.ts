import { Component } from '@angular/core';
import { IconViewComponent } from "./components/icon-view/icon-view.component";
import { ImgBrokenDirective } from './directives/img-broken.directive';

@Component({
  selector: 'app-root',
  imports: [IconViewComponent, ImgBrokenDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dynamic-icon';
}
