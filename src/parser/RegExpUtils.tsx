export function matchOne(pattern: RegExp, str?: string): string {
  const execArray: RegExpExecArray | null = pattern.exec(str || '');
  return execArray ? execArray[1] : '';
}

export function matchMultipleGroups(pattern: RegExp, str?: string): string[] {
  const execArray: RegExpExecArray | null = pattern.exec(str || '');
  return execArray != null ? execArray.slice(1) : [];
}

export function matchMultipleTimes(pattern: RegExp, str?: string): string[] {
  if (!pattern.global || (pattern.global && pattern.sticky)) {
    throw new Error('Only regular expressions with "g" flag are allowed');
  }

  const matches: string[] = [];

  let execArray: RegExpExecArray | null = pattern.exec(str || '');
  while (execArray != null) {
    matches.push(execArray[1]);
    execArray = pattern.exec(str || '');
  }

  return matches;
}
