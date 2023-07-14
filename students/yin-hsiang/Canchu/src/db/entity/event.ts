import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity, OneToOne } from 'typeorm';
import { User } from './user.js';
import { Friendship } from './friendship.js';

@Entity("event")
export class Event_ extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ['friend_request'], nullable: false })
  type!: "friend_request";

  @Column({"nullable": false, "default": false})
  isRead!: boolean;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
  
  @Column({ type: 'bigint', nullable: true, unsigned: true })
  participantId?: number;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  ownerId!: number;

  @ManyToOne(() => User, user => user.sentEvents)
  @JoinColumn({"name": "participantId"})
  participant?: import("./user.js").User;

  @ManyToOne(() => User, user => user.receivedEvents)
  @JoinColumn({"name": "ownerId"})
  owner?: import("./user.js").User;

  @Column({type: "bigint", nullable: true, unsigned: true})
  friendshipId?: number;

  @OneToOne(() => Friendship)
  @JoinColumn({"name": "friendshipId"})
  friendship?: Friendship;

  image () {
    if(this.participant === undefined){
      throw new ReferenceError("can't access 'participant' who isn't initialized yet");
    }
    return this.participant.picture;
  }

  summary() {
    switch(this.type){
      case "friend_request":
        if(this.participant === undefined){
          throw new ReferenceError("can't access 'participant' who isn't initialized yet");
        }
        if(this.friendship === undefined){
          throw new ReferenceError("can't access 'friendship' who isn't initialized yet");
        }
        if (this.friendship.requesterId === this.ownerId)
          return `${this.participant.name} has accepted your friend request.` as const;
        else
          return `${this.participant.name} invited you to be friends.` as const;
      default:
        throw new Error("event type not supported");
    }
  }
}
