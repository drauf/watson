export default class LoadAverages {
  public readonly oneMinute: number;

  public readonly fiveMinutes: number;

  public readonly fifteenMinutes: number;

  constructor(oneMinute: number, fiveMinutes: number, fifteenMinutes: number) {
    this.oneMinute = oneMinute;
    this.fiveMinutes = fiveMinutes;
    this.fifteenMinutes = fifteenMinutes;
  }
}
