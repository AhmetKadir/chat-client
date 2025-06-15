import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from './message.service';
import {UserService} from '../user/user.service';
import {Message} from './message.interface';
import {User} from '../user/user.interface';
import {environment} from '../../environments/environment';
import {Client} from '@stomp/stompjs';
import {CommonModule, DatePipe} from '@angular/common';
import {Room} from "../rooms/room";
import {RoomService} from "../rooms/room.service";
import {NotificationService} from "../notification/notification.service";

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scroll') scrollContainer!: ElementRef;

  messages: Message[] = [];
  messageControl = new FormControl<string>('', {nonNullable: true});
  protected roomId: string | null = null;
  room: Room | null = null;
  user: User | null = null;
  private websocketClient!: Client;

  private hasLeftRoom: boolean = false;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (!this.user) {
      this.notificationService.showNotf('You must be logged in to access messages.');
      void this.router.navigate(['/login']);
      return;
    }

    this.roomId = this.route.snapshot.paramMap.get('roomId');
    if (!this.roomId) {
      this.notificationService.showNotf();
      void this.router.navigate(['/rooms']);
      return;
    }

    this.roomService.getRoomById(this.roomId).then(room => {
      this.room = room;
    });

    void this.loadMessages();
    this.connect();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    alert('You are about to leave the chat.');
    if (this.websocketClient && this.websocketClient.connected) {
      this.disconnect();
    }
    if (!this.hasLeftRoom) {
      this.leaveRoom();
    }
  }

  ngOnDestroy() {
    if (!this.hasLeftRoom) {
      void this.leaveRoom();
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      const messages = await this.messageService.getMessagesByRoomId(this.roomId!);
      this.messages = messages.map(msg => ({
        ...msg,
        createdDate: new Date(msg.createdDate)
      }));
      this.scrollToBottom();
    } catch (error) {

    }
  }

  private connect(): void {
    if (!this.roomId) return;

    this.websocketClient = new Client({
      brokerURL: environment.webSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.websocketClient.subscribe(`/chat/${this.roomId}`, (frame) => {
          const message: Message = JSON.parse(frame.body);
          if (message.userId === 'SYSTEM' && message.text === 'ROOM_DELETED') {
            this.notificationService.showNotf('The room has been deleted.');
            void this.router.navigate(['/rooms']);
            return;
          }
          this.messages.push({
            ...message,
            createdDate: new Date(message.createdDate)
          });
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      },
      onStompError: () => {
        this.notificationService.showNotf();
      },
      onDisconnect: () => {
        if (!this.hasLeftRoom) {
          void this.leaveRoom();
        }
      }
    });
    this.websocketClient.activate();
  }

  private disconnect(): void {
    this.websocketClient?.deactivate()
      .then(() => this.notificationService.showNotf('Disconnected from the chat.'))
      .catch(() => this.notificationService.showNotf());
  }

  send(): void {
    const text = this.messageControl.value.trim();
    if (!text || !this.roomId || !this.user) return;

    const message: Message = {
      id: '',
      text,
      userId: this.user.id,
      userName: this.user.name || 'Anonymous',
      roomId: this.roomId,
      createdDate: new Date()
    };

    this.messageService.send(message)
      .then(() => {
        this.messageControl.reset();
        this.scrollToBottom();
      })
      .catch(() => this.notificationService.showNotf());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.user?.id;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

   leaveRoom() {
    if (!this.user?.id || !this.roomId) return;

    try {
      this.hasLeftRoom = true;
      this.messageService.leaveRoomSync(this.user.id, this.roomId);
    } catch (error) {
      this.notificationService.showNotf();
    } finally {
      this.disconnect();
      void this.router.navigate(['/rooms']);
    }
  }
}
