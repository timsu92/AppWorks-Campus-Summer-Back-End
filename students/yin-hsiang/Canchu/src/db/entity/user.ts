import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { Friendship } from './friendship.js';
import { Event_ } from './event.js';
import { Post, PostLikes } from './post.js';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number

  @Column({ "nullable": false })
  provider!: 'native' | 'facebook'

  @Column({ "length": 255, "nullable": false })
  name!: string

  @Column({ "length": 255, "unique": true, "nullable": false })
  email!: string

  @Column({ "length": 255, "nullable": false, "default": "" })
  picture!: string

  @Column({ "length": 255, "nullable": false })
  password!: string

  @Column({ "length": 500, "nullable": false, "default": "" })
  introduction!: string

  @Column({ "length": 255, "nullable": false, "default": "" })
  tags!: string

  @OneToMany(() => Friendship, friend => friend.requester)
  requested?: import("./friendship.js").Friendship[];

  @OneToMany(() => Friendship, friend => friend.receiver)
  received?: import("./friendship.js").Friendship[];

  @OneToMany(() => Event_, event => event.participant)
  sentEvents?: import("./event.js").Event_[];

  @OneToMany(() => Event_, event => event.owner)
  receivedEvents?: import("./event.js").Event_[];

  @OneToMany(() => Post, post => post.poster)
  posts?: import("./post.js").Post[];

  @OneToMany(() => PostLikes, postlike => postlike.liker)
  likedPosts?: import("./post.js").PostLikes[];
}
