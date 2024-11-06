import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActiveEntriesComponent } from './components/active-entries/active-entries.component';
import { AddUserToSlipComponent } from './components/add-user-to-slip/add-user-to-slip.component';
import { ActiveEntryCardComponent } from './components/entry-card/active-entry-card/active-entry-card.component';
import { EntryCardComponent } from './components/entry-card/entry-card.component';
import { EntryTypeChipComponent } from './components/entry-card/entry-type-chip/entry-type-chip.component';
import { SelectionRowComponent } from './components/entry-card/selection-row/selection-row.component';
import { SelectionStatusIconComponent } from './components/entry-card/selection-status-icon/selection-status-icon.component';
import { SettledEntryCardComponent } from './components/entry-card/settled-entry-card/settled-entry-card.component';
import { ShareLinkButtonComponent } from './components/entry-card/share-link-button/share-link-button.component';
import { SlipResultPayoutChipComponent } from './components/entry-card/slip-result-payout-chip/slip-result-payout-chip.component';
import { SlipUserChipsComponent } from './components/entry-card/slip-user-chips/slip-user-chips.component';
import { MobileActiveEntriesComponent } from './components/mobile-layout/mobile-active-entries/mobile-active-entries.component';
import { MobileEntryCardComponent } from './components/mobile-layout/mobile-entry-card/mobile-entry-card.component';
import { MobileSelectionCardComponent } from './components/mobile-layout/mobile-entry-card/mobile-selection-card/mobile-selection-card.component';
import { MobileLayoutContainerComponent } from './components/mobile-layout/mobile-layout-container.component';
import { MobileSettledEntriesComponent } from './components/mobile-layout/mobile-settled-entries/mobile-settled-entries.component';
import { MobileUserManagerComponent } from './components/mobile-layout/mobile-user-manager/mobile-user-manager.component';
import { SettledEntriesComponent } from './components/settled-entries/settled-entries.component';
import { SlipChangeComponent } from './components/slip-change/slip-change.component';
import { UserCardComponent } from './components/user-manager/user-card/user-card.component';
import { ConfirmDeleteUserComponent } from './components/user-manager/user-form/confirm-delete-user/confirm-delete-user.component';
import { UnderdogLoginFormComponent } from './components/user-manager/user-form/underdog-login-form/underdog-login-form.component';
import { UserFormComponent } from './components/user-manager/user-form/user-form.component';
import { UserManagerComponent } from './components/user-manager/user-manager.component';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { UnderdogChangeDetectionService } from './services/underdog-fantasy/underdog-fantasy-change-detection.service';
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
    UnderdogLoginFormComponent,
    SlipChangeComponent,
    ShareLinkButtonComponent,
    ConfirmDeleteUserComponent,
    EntryTypeChipComponent,
    ActiveEntryCardComponent,
    SettledEntryCardComponent,
    EntryCardComponent,
    MobileLayoutContainerComponent,
    MobileSettledEntriesComponent,
    MobileUserManagerComponent,
    MobileActiveEntriesComponent,
    MobileEntryCardComponent,
    MobileSelectionCardComponent,
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
    MatSlideToggleModule,
    OverlayModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    LayoutModule,
    MatToolbarModule,
    MatTabsModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    LocalStorageService,
    UnderdogFantasyService,
    UnderdogChangeDetectionService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
