import MemoryUnit from '../../types/MemoryUnit';

const round = (value: number): string => value.toFixed(2);

// how many KiB one of each unit represents
const KIB_PER_UNIT: Record<MemoryUnit, number> = {
  [MemoryUnit.KiB]: 1,
  [MemoryUnit.MiB]: 1024,
  [MemoryUnit.GiB]: 1024 * 1024,
  [MemoryUnit.TiB]: 1024 * 1024 * 1024,
};

// perform a "best effort" conversion to GiB, falling back to MiB for small values
export default function labelFormatter(value: string | number | (string | number)[], unit: MemoryUnit): string {
  const valueInKiB = Number(value) * KIB_PER_UNIT[unit];
  const valueInMiB = valueInKiB / 1024;
  const valueInGiB = valueInMiB / 1024;

  if (valueInGiB > 1) {
    return `${round(valueInGiB)} GiB`;
  }
  return `${round(valueInMiB)} MiB`;
}
