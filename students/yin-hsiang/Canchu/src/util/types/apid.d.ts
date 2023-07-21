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
  interface IEventObject {
    id: number,
    type: "friend_request",
    image: string,
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
    picture: string;
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
    picture: string;
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
    picture: string,
    name: string
  }
}
