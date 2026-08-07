import Thread from '../types/Thread';

const getRepresentativeStackLine = (threads: Thread[]): string => (
  threads.flatMap((thread) => thread.stackTrace).find((line) => line.length > 0) ?? 'Stack trace unavailable'
);

export default getRepresentativeStackLine;
