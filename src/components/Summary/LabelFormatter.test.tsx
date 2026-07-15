import labelFormatter from './LabelFormatter';
import MemoryUnit from '../../types/MemoryUnit';

describe('labelFormatter', () => {
  it('formats KiB values below 1 GiB in MiB', () => {
    // 524288 KiB = 512 MiB
    expect(labelFormatter(524288, MemoryUnit.KiB)).toEqual('512.00 MiB');
  });

  it('formats KiB values above 1 GiB in GiB', () => {
    // 2097152 KiB = 2 GiB
    expect(labelFormatter(2097152, MemoryUnit.KiB)).toEqual('2.00 GiB');
  });

  it('formats MiB values below 1 GiB in MiB', () => {
    expect(labelFormatter(512, MemoryUnit.MiB)).toEqual('512.00 MiB');
  });

  it('formats MiB values above 1 GiB in GiB', () => {
    // 2048 MiB = 2 GiB
    expect(labelFormatter(2048, MemoryUnit.MiB)).toEqual('2.00 GiB');
  });

  it('formats GiB values in GiB', () => {
    expect(labelFormatter(64, MemoryUnit.GiB)).toEqual('64.00 GiB');
  });

  it('formats sub-GiB GiB values in MiB', () => {
    // 0.5 GiB = 512 MiB
    expect(labelFormatter(0.5, MemoryUnit.GiB)).toEqual('512.00 MiB');
  });

  it('formats TiB values in GiB', () => {
    // 2 TiB = 2048 GiB
    expect(labelFormatter(2, MemoryUnit.TiB)).toEqual('2048.00 GiB');
  });

  it('uses binary (1024-based) conversion, not decimal', () => {
    // 2048 MiB is exactly 2 GiB in binary; decimal would give ~2.15
    expect(labelFormatter(2048, MemoryUnit.MiB)).toEqual('2.00 GiB');
  });

  it('rounds to two decimal places', () => {
    // 1536 MiB = 1.5 GiB
    expect(labelFormatter(1536, MemoryUnit.MiB)).toEqual('1.50 GiB');
  });

  it('accepts string input', () => {
    expect(labelFormatter('2048', MemoryUnit.MiB)).toEqual('2.00 GiB');
  });

  it('keeps exactly 1 GiB in MiB (switch requires strictly > 1 GiB)', () => {
    expect(labelFormatter(1024, MemoryUnit.MiB)).toEqual('1024.00 MiB');
    expect(labelFormatter(1025, MemoryUnit.MiB)).toEqual('1.00 GiB');
  });
});
