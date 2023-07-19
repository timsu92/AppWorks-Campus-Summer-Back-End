import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.js";

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ "type": "datetime", "nullable": false, "default": "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ "type": "varchar", "nullable": false, "length": 1000 })
  context!: string;

  @Column({ "type": "varchar", "nullable": true, "length": 255 })
  summary?: string;

  @Column({ "type": "bigint", "nullable": false, "unsigned": false })
  posterId!: number;

  @ManyToOne(() => User, usr => usr.posts, { "onDelete": "CASCADE" })
  @JoinColumn({ "name": "posterId" })
  poster?: import('./user.js').User;

  @OneToMany(() => PostLikes, postLike => postLike.posts)
  likers?: PostLikes[];

  @OneToMany(() => PostComment, cmt => cmt.post)
  comments?: PostComment[];

  @Column({"type": "bigint", "nullable": false, "unsigned": true, "default": 0})
  commentCount!: number;
}

@Entity()
export class PostLikes extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ "type": "bigint", "nullable": false, "unsigned": true })
  likerId!: number

  @ManyToOne(() => User, usr => usr.likedPosts, { "onDelete": "CASCADE" })
  @JoinColumn({ "name": "likerId" })
  likers?: import("./user.js").User[];

  @Column({ "type": "bigint", "nullable": false, "unsigned": true })
  postId!: number;

  @ManyToOne(() => Post, { "onDelete": "CASCADE" })
  @JoinColumn({ "name": "postId" })
  posts?: Post[];
}

@Entity()
export class PostComment extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({"type": "bigint", "nullable": false, "unsigned": true})
  posterId!: number;

  @ManyToOne(() => User)
  poster?: import("./user.js").User;

  @Column({"type": "bigint", "nullable": false, "unsigned": true})
  postId!: number;

  @ManyToOne(() => Post, post => post.comments)
  post?: Post;

  @Column({"type": "datetime", "nullable": false, "default": "CURRENT_TIMESTAMP"})
  createdAt!: Date;

  @Column({"type": "varchar", "nullable": false, "length": 500})
  content!: string;
}
