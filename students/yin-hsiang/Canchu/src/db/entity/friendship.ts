import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.js";

@Entity()
@Unique("uc_requester_receiver", ['requesterId', 'receiverId'])
export class Friendship extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  status!: "pending" | "requested" | "friend";

  @Column("bigint")
  requesterId!: number;

  @Column("bigint")
  receiverId!: number;

  @ManyToOne(() => User, user => user.requested)
  @JoinColumn({ "name": "requesterId", "foreignKeyConstraintName": "fk_requesterId" })
  requester!: import("./user.js").User;

  @ManyToOne(() => User, user => user.received)
  @JoinColumn({ "name": "receiverId", "foreignKeyConstraintName": "fk_receiverId" })
  receiver!: import("./user.js").User;
}
