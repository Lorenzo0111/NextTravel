export class UnexpectedResponseError extends Error {
  readonly response: string;

  constructor(message: string, response: string) {
    super(message);
    this.response = response;
  }
}
