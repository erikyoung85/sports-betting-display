import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagerComponent {
  constructor() {}
}
