import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../user/user.service';
import {User} from '../user/user.interface';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userName = new FormControl<string>('', {nonNullable: true});
  user: User | null = null;
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
  }

  activateUser(): void {
    const name = this.userName.value.trim();
    if (!name) return;

    this.isLoading = true;
    this.userService.getUser(name).subscribe({
      next: (user) => {
        this.user = user;
        this.userService.setUser(user);
        this.router.navigate(['/rooms']).then(r =>
          console.log('Navigated to rooms:', r));
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to activate user.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
