import Thread from '../types/Thread';
import { getRepresentativeStackLine, getStackCategories } from './stackCategories';

const threadWithStack = (stackTrace: string[]): Thread => ({ stackTrace } as Thread);

describe('getStackCategories', () => {
  it('identifies database and Lucene stack content', () => {
    expect(getStackCategories([
      threadWithStack(['at org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:1)']),
      threadWithStack(['at java.sql.PreparedStatement.execute(PreparedStatement.java:1)']),
    ])).toEqual(['Database', 'Lucene']);
  });

  it('returns the first representative stack frame', () => {
    expect(getRepresentativeStackLine([
      threadWithStack([]),
      threadWithStack(['at com.example.Work.run(Work.java:1)']),
    ])).toBe('at com.example.Work.run(Work.java:1)');
  });

  it('does not add tags for unrelated stacks', () => {
    expect(getStackCategories([
      threadWithStack(['at com.atlassian.jira.issue.IssueManager.getIssueObject(IssueManager.java:1)']),
    ])).toEqual([]);
  });
});
