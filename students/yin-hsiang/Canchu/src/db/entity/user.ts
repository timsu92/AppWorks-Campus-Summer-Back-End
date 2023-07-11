import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number

  @Column({"nullable": false})
  provider!: 'native' | 'facebook'

  @Column({"length": 255, "nullable": false})
  name!: string

  @Column({"length": 255, "unique": true, "nullable": false})
  email!: string

  @Column({"length": 255, "nullable": false, "default": ""})
  picture!: string

  @Column({"length": 255, "nullable": false})
  password!: string

  @Column({"length": 500, "nullable": false, "default": ""})
  introduction!: string

  @Column({"length": 255, "nullable": false, "default": ""})
  tags!: string
}

@Entity("user")
export class UserObject extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number

  @Column({"nullable": false})
  provider!: 'native' | 'facebook'

  @Column({"length": 255, "unique": true, "nullable": false})
  email!: string

  @Column({"length": 255, "nullable": false})
  name!: string

  @Column({"length": 255, "nullable": false, "default": ""})
  picture!: string
}

@Entity("user")
export class UserObjectPasswd extends UserObject {
  @Column({"length": 255, "nullable": false})
  password!: string
}
