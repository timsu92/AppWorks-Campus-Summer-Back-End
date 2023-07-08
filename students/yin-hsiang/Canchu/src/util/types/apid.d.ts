declare namespace Canchu {
  interface IUserObject {
    id: number,
    provider: string,
    email: string,
    name: string,
    picture: string,
  }
  interface IFriendshopObject {
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
    friendship: IFriendshopObject | null
  }
}
