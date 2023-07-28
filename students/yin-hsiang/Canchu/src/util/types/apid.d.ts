declare namespace Canchu {
  type UserPicture = `https://${number}.${number}.${number}.${number}/images/${string}` | "";

  interface IUserObject {
    id: number,
    provider: string,
    email: string,
    name: string,
    picture: UserPicture,
  }
  interface IFriendshipObject {
    id: number,
    status: "pending" | "requested" | "friend"
  }
  interface IUserDetailObject {
    id: number,
    name: string,
    picture: UserPicture,
    friend_count: number,
    introduction: string,
    tags: string,
    friendship: IFriendshipObject | null
  }
  interface IUserSearchObject {
    id: number,
    name: string,
    picture: UserPicture,
    friendship: IFriendshipObject | null
  }
  interface IEventObject {
    id: number,
    type: "friend_request",
    image: UserPicture,
    summary: string,
    is_read: boolean,
    created_at: string
  }
  interface IPostObject {
    id: number
  }
  interface IUserCommentObject {
    id: number;
    name: string;
    picture: UserPicture;
  }
  interface ICommentObject {
    id: number;
    created_at: string;
    content: string;
    user: IUserCommentObject;
  }
  interface IPostDetailObject {
    id: number;
    user_id: number;
    created_at: string;
    context: string;
    summary: string;
    is_liked: boolean;
    like_count: number;
    comment_count: number;
    picture: UserPicture;
    name: string;
    comments: ICommentObject[];
  }
  interface IPostSearchObject {
    id: number,
    user_id: number,
    created_at: string,
    context: string,
    is_liked: boolean,
    like_count: number,
    comment_count: number,
    picture: UserPicture,
    name: string
  }
  interface IGroupObject {
    "group": { "id": number }
  }
  interface IGroupPending {

  }
}
