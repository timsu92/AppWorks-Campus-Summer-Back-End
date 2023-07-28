import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.js";


@Entity()
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  senderId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ "name": "senderId" })
  sender?: import("./user.js").User;

  @Column()
  receiverId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ "name": "receiverId" })
  receiver?: import("./user.js").User;

  @Column()
  message!: string;

  @Column({ "type": "datetime", "nullable": false, "default": "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
