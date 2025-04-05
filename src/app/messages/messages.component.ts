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

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scroll') scrollContainer: ElementRef;

  messages: Message[] = [];
  messageControl = new FormControl<string>('', {nonNullable: true});
  websocketClient: Client;
  protected roomId: string | null = null;
  room: Room | null = null;
  user: User | null = null;

  private hasLeftRoom: boolean = false;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (!this.user) {
      alert('Please log in');
      void this.router.navigate(['/login']);
      return;
    }

    this.roomId = this.route.snapshot.paramMap.get('roomId');
    if (!this.roomId) {
      console.error('No room ID provided');
      void this.router.navigate(['/rooms']);
      return;
    }

    this.roomService.getRoomById(this.roomId).then(room => {
      this.room = room;
    });

    this.loadMessages().then(() => console.log('Messages loaded'));
    this.connect();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  @HostListener('window:beforeunload')
  async ngOnDestroy() {
    if (!this.hasLeftRoom) {
      await this.leaveRoom();
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      console.log('Loading messages for room', this.roomId);
      const messages = await this.messageService.getMessagesByRoomId(this.roomId!);
      this.messages = messages.map(msg => ({
        ...msg,
        createdDate: new Date(msg.createdDate)
      }));
      console.log('Messages loaded:', this.messages);
      this.scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  private connect(): void {
    if (!this.roomId) return;

    this.websocketClient = new Client({
      brokerURL: environment.webSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('WebSocket Debug:', str),
      onConnect: () => {
        console.log('WebSocket connected to room:', this.roomId);
        this.websocketClient.subscribe(`/chat/${this.roomId}`, (frame) => {
          console.log('New message received:', frame.body);
          const message: Message = JSON.parse(frame.body);
          this.messages.push({
            ...message,
            createdDate: new Date(message.createdDate)
          });
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        if (!this.hasLeftRoom) {
          void this.leaveRoom();
        }
      }
    });
    this.websocketClient.activate();
  }

  private disconnect(): void {
    this.websocketClient?.deactivate()
      .then(() => console.log(`Disconnected from room ${this.roomId}`))
      .catch(error => console.error('Disconnect error:', error));
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
      .catch(error => console.error('Send message error:', error));
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

  async leaveRoom(): Promise<void> {
    if (!this.user?.id || !this.roomId) return;

    try {
      this.hasLeftRoom = true;
      await this.messageService.leaveRoom(this.user.id, this.roomId);
      this.disconnect();
    } catch (error) {
      console.error('Error leaving room:', error);
      this.disconnect();
    } finally {
      void this.router.navigate(['/rooms']);
    }
  }
}
