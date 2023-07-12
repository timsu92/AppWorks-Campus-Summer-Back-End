declare namespace Canchu {
  interface IUserObject {
    id: number,
    provider: string,
    email: string,
    name: string,
    picture: string,
  }
  interface IFriendshipObject {
    id: number,
    status: "pending" | "requested" | "friend"
  }
  interface IUserDetailObject {
    id: number,
    name: string,
    picture: string,
    friend_count: number,
    introduction: string,
    tags: string,
    friendship: IFriendshipObject | null
  }
  interface IUserSearchObject {
    id: number,
    name: string,
    picture: string,
    friendship: IFriendshipObject | null
  }
}
