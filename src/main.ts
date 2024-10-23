import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true,
  })
  .catch((err) => console.error(err));

// document.cookie =
//   '__cf_bm=6kNtxHuc__Pzp3uS.2ygsZ7b6lapYI0S3rg_0fwAIS8-1729644702-1.0.1.1-01r3uAQS44zaMMZKmRyZ1SDxRt.JxpeGCvU80nx.iQc2R1orETZcX44_3CtvtQOUDkHjd5wa.X46zCs.wj514w; path=/; expires=Wed, 23-Oct-24 01:21:42 GMT; domain=.underdogsports.com; HttpOnly; Secure; SameSite=None';

// console.log(document.cookie);
