import { Component, Input } from '@angular/core';
import { IconDirective } from '../../directives/icon.directive';

@Component({
  selector: 'app-icon-view',
  imports: [IconDirective],
  templateUrl: './icon-view.component.html',
  styleUrl: './icon-view.component.scss'
})
export class IconViewComponent {
  @Input() name: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
  @Input() color: string = ''; 
  @Input() strokeColor: string = '';
}
