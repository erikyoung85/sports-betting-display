import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mobile-user-manager',
  templateUrl: './mobile-user-manager.component.html',
  styleUrls: ['./mobile-user-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileUserManagerComponent {
  constructor() {}
}
