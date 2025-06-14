import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Message} from './message.interface';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private server = environment.server;

  constructor(private http: HttpClient) {
  }

  // Get all messages (might not be needed anymore with room-based system)
  getMessages(): Promise<Message[]> {
    return lastValueFrom(
      this.http.get<Message[]>(`${this.server}/messages`).pipe(
        map((messages: Message[]) =>
          messages.map(message => ({
            ...message,
            createdDate: new Date(message.createdDate)
          }))
        )
      )
    );
  }

  // Get messages for a specific room
  getMessagesByRoomId(roomId: string): Promise<Message[]> {
    return lastValueFrom(
      this.http.get<Message[]>(`${this.server}/messages/room/${roomId}`).pipe(
        map((messages: Message[]) =>
          messages.map(message => ({
            ...message,
            createdDate: new Date(message.createdDate)
          }))
        )
      )
    );
  }

  send(message: Message): Promise<Message> {
    return lastValueFrom(
      this.http.post<Message>(`${this.server}/messages/new`, message)
    );
  }

  // leave room
  leaveRoom(userId: string, roomId: string): Promise<any> {
    return lastValueFrom(
      this.http.delete(`${this.server}/users/${userId}/rooms/${roomId}`)
    );
  }

  leaveRoomSync(userId: string, roomId: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${this.server}/users/${userId}/rooms/${roomId}`, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ roomId }));
  }

}
