import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mobile-layout-container',
  templateUrl: './mobile-layout-container.component.html',
  styleUrls: ['./mobile-layout-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutContainerComponent {
  constructor() {}
}
