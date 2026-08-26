import {
  GetAllUserResponse,
  GetUserById,
  GetUserResponse,
  ListQueryRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  User,
} from '../../model/user.model'
import { WebResponse } from '../../model/web.model'

export abstract class IUserRepository {
  abstract updateUser(
    request: UpdateUserRequest,
  ): Promise<WebResponse<UpdateUserResponse>>
  abstract getAllUser(
    Query: ListQueryRequest,
  ): Promise<WebResponse<GetAllUserResponse>>
  abstract getUserById(
    request: GetUserById,
  ): Promise<WebResponse<GetUserResponse>>
  abstract me(req: User): Promise<WebResponse<GetUserResponse>>
}
