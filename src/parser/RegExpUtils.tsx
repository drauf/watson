export function matchOne(pattern: RegExp, str?: string): string {
  const execArray: RegExpExecArray | null = pattern.exec(str || '');
  return execArray ? execArray[1] : '';
}

export function matchMultipleGroups(pattern: RegExp, str?: string): string[] {
  const execArray: RegExpExecArray | null = pattern.exec(str || '');
  return execArray != null ? execArray.slice(1) : [];
}

// any RegExp passed here needs to have the 'g' flag, otherwise it'll cause an infinite loop!
export function matchMultipleTimes(pattern: RegExp, str?: string): string[] {
  const matches: string[] = [];

  let execArray: RegExpExecArray | null = pattern.exec(str || '');
  while (execArray != null) {
    matches.push(execArray[1]);
    execArray = pattern.exec(str || '');
  }

  return matches;
}
