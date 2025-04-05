import {Message} from "../messages/message.interface";

export interface Room {
  id: string;
  name: string;
  messages: Message[];
  numberOfUsers: number;
  createdDate: Date;

  roomCapacity: number;
}
