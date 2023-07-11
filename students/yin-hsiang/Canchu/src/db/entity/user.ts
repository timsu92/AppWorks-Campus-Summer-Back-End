import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
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
