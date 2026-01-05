export class Helper {
  public static formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}