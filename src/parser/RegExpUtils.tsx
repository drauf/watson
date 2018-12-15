export function getDateFromFilename(filename: string, pattern: RegExp): Date | null {
    const epoch = matchOne(filename, pattern);
    return new Date(parseInt(epoch) * 1000);
}

export function matchOne(str: string | undefined, pattern: RegExp): string {
    const execArray: RegExpExecArray | null = pattern.exec(str || "");
    return execArray ? execArray[1] : "";
}

export function matchMultipleGroups(str: string | undefined, pattern: RegExp): string[] {
    const execArray: RegExpExecArray | null = pattern.exec(str || "");
    return execArray != null ? execArray.slice(1) : [];
}

// remember that the RegExp passed here needs to have the 'g' flag, otherwise it'll cause an infinite loop!
export function matchMultipleTimes(str: string | undefined, pattern: RegExp): string[] {
    const matches: string[] = [];

    let execArray: RegExpExecArray | null;
    while ((execArray = pattern.exec(str || "")) != null) {
        matches.push(execArray[1]);
    }

    return matches;
}
