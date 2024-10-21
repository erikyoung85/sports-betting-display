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
import { MatExpansionModule } from '@angular/material/expansion';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActiveEntriesComponent } from './components/active-entries/active-entries.component';
import { UnderdogFantasyService } from './services/underdog-fantasy/underdog-fantasy.service';

@NgModule({
  declarations: [AppComponent, ActiveEntriesComponent],
  imports: [BrowserModule, AppRoutingModule, CommonModule, MatExpansionModule],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    UnderdogFantasyService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
