import MemoryUnit from "./MemoryUnit";

export default class MemoryUsage {
  public readonly memoryTotal: number;

  public readonly memoryUsed: number;

  public readonly memoryFree: number;

  public readonly swapTotal: number;

  public readonly swapUsed: number;

  public readonly swapFree: number;

  public readonly memoryUnit: MemoryUnit;

  constructor(memoryTotal: number, memoryUsed: number, memoryFree: number, swapTotal: number, swapUsed: number, swapFree: number, memoryUnit: MemoryUnit) {
    this.memoryTotal = memoryTotal;
    this.memoryUsed = memoryUsed;
    this.memoryFree = memoryFree;
    this.swapTotal = swapTotal;
    this.swapUsed = swapUsed;
    this.swapFree = swapFree;
    this.memoryUnit = memoryUnit;
  }
}
