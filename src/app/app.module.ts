import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActiveEntriesComponent } from './components/active-entries/active-entries.component';
import { AddUserToSlipComponent } from './components/add-user-to-slip/add-user-to-slip.component';
import { SelectionRowComponent } from './components/selection-row/selection-row.component';
import { SelectionStatusIconComponent } from './components/selection-status-icon/selection-status-icon.component';
import { SettledEntriesComponent } from './components/settled-entries/settled-entries.component';
import { SlipResultPayoutChipComponent } from './components/slip-result-payout-chip/slip-result-payout-chip.component';
import { SlipUserChipsComponent } from './components/slip-user-chips/slip-user-chips.component';
import { UserCardComponent } from './components/user-manager/user-card/user-card.component';
import { UserFormComponent } from './components/user-manager/user-form/user-form.component';
import { UserManagerComponent } from './components/user-manager/user-manager.component';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { UnderdogFantasyService } from './services/underdog-fantasy/underdog-fantasy.service';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    ActiveEntriesComponent,
    SettledEntriesComponent,
    SelectionStatusIconComponent,
    SlipResultPayoutChipComponent,
    SlipUserChipsComponent,
    SelectionRowComponent,
    UserManagerComponent,
    UserCardComponent,
    UserFormComponent,
    AddUserToSlipComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    SharedModule,
    MatCommonModule,
    MatExpansionModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    LocalStorageService,
    UnderdogFantasyService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
