import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from './user.interface';
import {environment} from '../../environments/environment';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private server = environment.server;

  constructor(private http: HttpClient) {
    console.log('UserService server URL:', this.server);
  }

  getUser(name: string) {
    console.log('Fetching user from:', `${this.server}/users`);
    return this.http.post<User>(`${this.server}/users`, {name});
  }

  setUser(user: User): void {
    this.userSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}
