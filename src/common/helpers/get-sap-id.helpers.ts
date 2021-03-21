interface SapResponse {
  readonly response: string;
  readonly responseMessage: string;
}

export const getSapIdByPayload = (payload: SapResponse): string => {
  if (payload.responseMessage.includes('Updated')) {
    return payload.responseMessage;
  }
  const regExp = /[A-Z]\d+/;
  return payload.responseMessage.match(regExp).shift();
};
