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

  @OneToMany(() => GroupPost, post => post.group)
  posts?: GroupPost[];
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

  @Column()
  status!: "member" | "in application"
}

@Entity()
export class GroupPost extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  context!: string;

  @Column({ "type": "datetime", "nullable": false, "default": "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ "type": "bigint", "nullable": false, "unsigned": true })
  posterId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ "name": "posterId" })
  poster?: import('./user.js').User;

  @Column()
  groupId!: number;

  @ManyToOne(() => Group, group => group.posts)
  @JoinColumn({ "name": "groupId" })
  group?: Group;
}
