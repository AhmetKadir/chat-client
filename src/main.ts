import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {AppComponent} from './app/app.component';
import {LoginComponent} from './app/login/login.component';
import {RoomsComponent} from './app/rooms/rooms.component';
import {MessagesComponent} from './app/messages/messages.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'login', component: LoginComponent},
      {path: 'rooms', component: RoomsComponent},
      {path: 'messages/:roomId', component: MessagesComponent},
      {path: '', redirectTo: 'login', pathMatch: 'full'},
      {path: '**', redirectTo: 'login'}
    ]),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
