import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.js";

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column()
  adminId!: number;

  @OneToOne(() => User)
  @JoinColumn({ "name": "adminId" })
  admin?: import("./user.js").User;

  @OneToMany(() => User, usr => usr.groups)
  members?: import("./user.js").User[];
}

@Entity()
export class UserGroup extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, usr => usr.groups)
  @JoinColumn({ "name": "userId" })
  user?: import("./user.js").User;

  @Column()
  groupId!: number;

  @ManyToOne(() => Group, group => group.members)
  @JoinColumn({ "name": "groupId" })
  group?: Group;
}
