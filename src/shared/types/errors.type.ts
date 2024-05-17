export class DatabaseRecordNotFound extends Error {
  constructor(message: string) {
    super(message);
  }
}
