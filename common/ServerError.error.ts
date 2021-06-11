export class ServerError extends Error {
  public readonly innerError;
  constructor(err: Error, message: string) {
    super(message);
    this.innerError = err;
  }
}
