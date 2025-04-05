import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {RoomService} from './room.service';
import {UserService} from '../user/user.service';
import {User} from '../user/user.interface';
import {Room} from './room';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading: boolean = false;
  user: User | null = null;

  constructor(
    private roomService: RoomService,
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (!this.user) {
      alert('Please log in');
      void this.router.navigate(['/login']);
      return;
    }
    console.log('User:', this.user);
    void this.getRooms();
  }

  async getRooms(): Promise<void> {
    this.isLoading = true;
    try {
      const rooms = await this.roomService.getRooms();
      this.rooms = rooms.map(room => ({
        ...room
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Failed to load rooms. Please try again later.');
    } finally {
      this.isLoading = false;
    }
  }

  async createRoom(): Promise<void> {
    if (!this.user?.id) {
      alert('Please log in to create a room.');
      await this.router.navigate(['/login']);
      return;
    }

    const roomName = prompt('Enter room name:');
    if (!roomName || !roomName.trim()) return;
    this.isLoading = true;

    try {
      this.user = await this.roomService.create(this.user.id, roomName.trim());
      await this.router.navigate(['/messages', this.user.roomId]);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  enterRoom(roomId: string): void {
    if (!this.user?.id) return;
    this.isLoading = true;
    this.roomService.enterRoom(this.user.id, roomId).subscribe({
      next: () => this.router.navigate(['/messages', roomId]),
      error: (error) => {
        console.error(`Failed to enter room ${roomId}:`, error);
        alert('Unable to join the room.');
        this.isLoading = false;
        void this.getRooms();
      },
      complete: () => this.isLoading = false
    });
  }
}
