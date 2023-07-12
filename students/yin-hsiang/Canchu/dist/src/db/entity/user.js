var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { Friendship } from './friendship.js';
export let User = class User extends BaseEntity {
    id;
    provider;
    name;
    email;
    picture;
    password;
    introduction;
    tags;
    requested;
    received;
};
__decorate([
    PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column({ "nullable": false }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    Column({ "length": 255, "nullable": false }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({ "length": 255, "unique": true, "nullable": false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ "length": 255, "nullable": false, "default": "" }),
    __metadata("design:type", String)
], User.prototype, "picture", void 0);
__decorate([
    Column({ "length": 255, "nullable": false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column({ "length": 500, "nullable": false, "default": "" }),
    __metadata("design:type", String)
], User.prototype, "introduction", void 0);
__decorate([
    Column({ "length": 255, "nullable": false, "default": "" }),
    __metadata("design:type", String)
], User.prototype, "tags", void 0);
__decorate([
    OneToMany(() => Friendship, friend => friend.requester),
    __metadata("design:type", Array)
], User.prototype, "requested", void 0);
__decorate([
    OneToMany(() => Friendship, friend => friend.receiver),
    __metadata("design:type", Array)
], User.prototype, "received", void 0);
User = __decorate([
    Entity()
], User);
//# sourceMappingURL=user.js.map