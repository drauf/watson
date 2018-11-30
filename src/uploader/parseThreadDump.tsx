import { ThreadDump } from "../types";
import { getDateFromFilename } from "./RegExpUtils";

const THREAD_HEADER_PREFIX: string = '"';

const FILENAME_DATE_PATTERN: RegExp = /\.(\d*)\.txt$/;
const NAME_PATTERN: RegExp = /^\"(.*)\" /;
const NID_PATTERN: RegExp = / nid=([0-9a-fx,]+)/;
const FRAME_PATTERN: RegExp = /^\s+at (.*)/;
const THREAD_STATE_PATTERN: RegExp = /^\s*java.lang.Thread.State: (.*)/;
const SYNCHRONIZATION_STATUS_PATTERN: RegExp = /^\s+- (.*?) +<([x0-9a-f]+)> \(a (.*)\)/;
const LOCKED_OWNABLE_SYNCHRONIZERS_PATTERN: RegExp = /^\s+Locked ownable synchronizers:/;
const NONE_HELD_PATTERN: RegExp = /^\s+- None/;
const HELD_LOCK_PATTERN: RegExp = /^\s+- <([x0-9a-f]+)> \(a (.*)\)/;
const JNI_REFERENCES_PATTERN: RegExp = /^\s?JNI global references: /;

export type ParseThreadDumpCallback = (ThreadDump: ThreadDump) => void;

export function parseThreadDump(file: File, reader: FileReader, callback: ParseThreadDumpCallback) {
    const threadDump: ThreadDump = new ThreadDump();
    threadDump.date = getDateFromFilename(file.name, FILENAME_DATE_PATTERN);

    const lines: string[] = (reader.result as string).split('\n');

    callback(threadDump);
}
