import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
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
    let params = new HttpParams().set("userId", userId).set("roomName", roomName);
    return lastValueFrom(this.http.post<User>(`${this.server}/rooms`, null, {params}));
  }

  enterRoom(userId: string, roomId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId).set('roomId', roomId);
    return this.http.put<void>(`${this.server}/users/${userId}/rooms/${roomId}`, null, {params});
  }
}
