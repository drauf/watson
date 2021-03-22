let idGeneratorState = Number.MIN_SAFE_INTEGER;

const generateId = (): number => idGeneratorState++;

export default abstract class TypeWithUniqueId {
  public readonly uniqueId: number;

  constructor() {
    this.uniqueId = generateId();
  }
}
