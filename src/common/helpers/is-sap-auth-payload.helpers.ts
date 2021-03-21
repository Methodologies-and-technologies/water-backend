import { AuthPayload, SapAuthPayload } from '../../modules/auth/auth.interface';

export const isSapAuthPayload = (
  payload: AuthPayload | SapAuthPayload,
): payload is SapAuthPayload => {
  return (payload as SapAuthPayload).isSap !== undefined;
};
