import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Room} from "./room";
import {User} from "../user/user.interface";

@Injectable({
  providedIn: "root"
})
export class RoomService {

  private server = environment.server;

  constructor(private http: HttpClient) {
  }

  getRooms(): Promise<Room[]> {
    return lastValueFrom(this.http.get<Room[]>(`${this.server}/rooms`)
      .pipe(
        map((rooms: Room[]) => rooms.map(room => ({...room, date: new Date(room.createdDate)})))
      ));
  }

  getRoomById(roomId: string): Promise<Room> {
    return lastValueFrom(this.http.get<Room>(`${this.server}/rooms/${roomId}`));
  }

  create(userId: string, roomName: string): Promise<User> {
    //todo fix this
    const body = {
      roomName: roomName,
      userId: userId
    }

    return lastValueFrom(this.http.post<User>(`${this.server}/rooms`, body));
  }

  enterRoom(userId: string, roomId: string): Observable<void> {
    return this.http.put<void>(`${this.server}/users/${userId}/rooms/${roomId}`, {});
  }
}
