declare namespace Canchu {
  namespace Cache {
    type IUserDetailObject = Pick<Canchu.IUserDetailObject, 'id' | 'name' | 'picture' | 'introduction' | 'tags'>
  }
}
