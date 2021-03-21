import { UserEntity } from '../user/user.entity';

export interface AuthPayload {
  readonly fullName: string;
}

export interface SapAuthPayload {
  readonly isSap: boolean;
  readonly clientId: string;
}

export interface AuthResponse extends Partial<UserEntity> {
  readonly token: string;
}

export interface ResponseSuccess {
  readonly result: string;
}

export interface SapJwtResponse {
  readonly token: string;
}
