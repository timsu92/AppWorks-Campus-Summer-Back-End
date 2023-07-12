var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.js";
export let Friendship = class Friendship extends BaseEntity {
    id;
    status;
    requesterId;
    receiverId;
    requester;
    receiver;
};
__decorate([
    PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], Friendship.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Friendship.prototype, "status", void 0);
__decorate([
    Column("bigint"),
    __metadata("design:type", Number)
], Friendship.prototype, "requesterId", void 0);
__decorate([
    Column("bigint"),
    __metadata("design:type", Number)
], Friendship.prototype, "receiverId", void 0);
__decorate([
    ManyToOne(() => User, user => user.requested),
    JoinColumn({ "name": "requesterId", "foreignKeyConstraintName": "fk_requesterId" }),
    __metadata("design:type", Object)
], Friendship.prototype, "requester", void 0);
__decorate([
    ManyToOne(() => User, user => user.received),
    JoinColumn({ "name": "receiverId", "foreignKeyConstraintName": "fk_receiverId" }),
    __metadata("design:type", Object)
], Friendship.prototype, "receiver", void 0);
Friendship = __decorate([
    Entity(),
    Unique("uc_requester_receiver", ['requesterId', 'receiverId'])
], Friendship);
//# sourceMappingURL=friendship.js.map