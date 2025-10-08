import { matchesRegexFilters, matchesNameFilter, matchesStackFilter } from './regexFiltering';
import Thread from '../types/Thread';
import ThreadStatus from '../types/ThreadStatus';

describe('regexFiltering', () => {
  const createMockThread = (
    name: string,
    stackTrace: string[],
  ): Thread => {
    const thread = new Thread(Math.floor(Math.random() * 10000), name);
    thread.status = ThreadStatus.RUNNABLE;
    thread.stackTrace.push(...stackTrace);
    thread.cpuUsage = '0.00';
    return thread;
  };

  describe('matchesNameFilter', () => {
    const thread = createMockThread('http-nio-8080-exec-1', []);

    it('returns true when no filter is provided', () => {
      expect(matchesNameFilter(thread, '')).toBe(true);
      expect(matchesNameFilter(thread, null as any)).toBe(true);
      expect(matchesNameFilter(thread, undefined as any)).toBe(true);
    });

    it('matches thread names with case insensitive regex', () => {
      expect(matchesNameFilter(thread, 'http')).toBe(true);
      expect(matchesNameFilter(thread, 'HTTP')).toBe(true);
      expect(matchesNameFilter(thread, 'exec')).toBe(true);
      expect(matchesNameFilter(thread, 'EXEC')).toBe(true);
    });

    it('supports regex patterns for thread names', () => {
      expect(matchesNameFilter(thread, '^http-nio')).toBe(true);
      expect(matchesNameFilter(thread, 'exec-\\d+$')).toBe(true);
      expect(matchesNameFilter(thread, 'nio.*exec')).toBe(true);
      expect(matchesNameFilter(thread, '8080')).toBe(true);
    });

    it('returns false when pattern does not match', () => {
      expect(matchesNameFilter(thread, 'database')).toBe(false);
      expect(matchesNameFilter(thread, '^exec')).toBe(false);
      expect(matchesNameFilter(thread, 'http$')).toBe(false);
      expect(matchesNameFilter(thread, '9090')).toBe(false);
    });

    it('handles invalid regex gracefully', () => {
      expect(matchesNameFilter(thread, '[')).toBe(true);
      expect(matchesNameFilter(thread, '(')).toBe(true);
      expect(matchesNameFilter(thread, '**')).toBe(true);
      expect(matchesNameFilter(thread, '+++')).toBe(true);
    });

    it('works with special thread names', () => {
      const specialThread = createMockThread('RMI TCP Connection(idle)-127.0.0.1', []);
      expect(matchesNameFilter(specialThread, 'RMI')).toBe(true);
      expect(matchesNameFilter(specialThread, 'TCP')).toBe(true);
      expect(matchesNameFilter(specialThread, 'idle')).toBe(true);
      expect(matchesNameFilter(specialThread, '127\\.0\\.0\\.1')).toBe(true);

      const poolThread = createMockThread('pool-2-thread-1', []);
      expect(matchesNameFilter(poolThread, 'pool.*thread')).toBe(true);
      expect(matchesNameFilter(poolThread, '^pool-\\d+-thread-\\d+$')).toBe(true);
    });
  });

  describe('matchesStackFilter', () => {
    const thread = createMockThread('test-thread', [
      'java.io.FileInputStream.read(FileInputStream.java:255)',
      'com.atlassian.jira.util.FileUtils.readFile(FileUtils.java:123)',
      'java.util.concurrent.locks.ReentrantLock.lock(ReentrantLock.java:267)',
      'org.apache.tomcat.util.net.SocketProcessor.run(SocketProcessor.java:49)',
    ]);

    it('returns true when no filter is provided', () => {
      expect(matchesStackFilter(thread, '')).toBe(true);
      expect(matchesStackFilter(thread, null as any)).toBe(true);
      expect(matchesStackFilter(thread, undefined as any)).toBe(true);
    });

    it('matches stack trace lines with case insensitive regex', () => {
      expect(matchesStackFilter(thread, 'java.io')).toBe(true);
      expect(matchesStackFilter(thread, 'JAVA.IO')).toBe(true);
      expect(matchesStackFilter(thread, 'atlassian')).toBe(true);
      expect(matchesStackFilter(thread, 'ATLASSIAN')).toBe(true);
    });

    it('supports regex patterns for stack traces', () => {
      expect(matchesStackFilter(thread, 'java\\.io\\.')).toBe(true);
      expect(matchesStackFilter(thread, 'com\\.atlassian')).toBe(true);
      expect(matchesStackFilter(thread, 'locks.*Lock')).toBe(true);
      expect(matchesStackFilter(thread, '\\.read\\(')).toBe(true);
      expect(matchesStackFilter(thread, ':\\d+')).toBe(true);
    });

    it('returns false when pattern does not match any line', () => {
      expect(matchesStackFilter(thread, 'SQLException')).toBe(false);
      expect(matchesStackFilter(thread, 'database')).toBe(false);
      expect(matchesStackFilter(thread, 'spring')).toBe(false);
      expect(matchesStackFilter(thread, 'elasticsearch')).toBe(false);
    });

    it('handles invalid regex gracefully', () => {
      expect(matchesStackFilter(thread, '[')).toBe(true);
      expect(matchesStackFilter(thread, '(')).toBe(true);
      expect(matchesStackFilter(thread, '**')).toBe(true);
      expect(matchesStackFilter(thread, '+++')).toBe(true);
    });

    it('works with empty stack traces', () => {
      const emptyThread = createMockThread('empty-thread', []);
      expect(matchesStackFilter(emptyThread, '')).toBe(true);
      expect(matchesStackFilter(emptyThread, 'java')).toBe(false);
    });

    it('matches specific business logic patterns', () => {
      const businessThread = createMockThread('business-thread', [
        'com.atlassian.jira.issue.IssueManager.getIssue(IssueManager.java:456)',
        'com.atlassian.jira.workflow.WorkflowTransition.execute(WorkflowTransition.java:89)',
        'java.sql.PreparedStatement.executeQuery(PreparedStatement.java:194)',
      ]);

      expect(matchesStackFilter(businessThread, 'IssueManager')).toBe(true);
      expect(matchesStackFilter(businessThread, 'workflow')).toBe(true);
      expect(matchesStackFilter(businessThread, 'PreparedStatement')).toBe(true);
      expect(matchesStackFilter(businessThread, 'sql')).toBe(true);
    });
  });

  describe('matchesRegexFilters', () => {
    const thread = createMockThread('http-nio-8080-exec-1', [
      'java.io.FileInputStream.read(FileInputStream.java:255)',
      'com.atlassian.jira.util.FileUtils.readFile(FileUtils.java:123)',
    ]);

    it('returns true when both name and stack filters match', () => {
      expect(matchesRegexFilters(thread, 'http', 'java.io')).toBe(true);
      expect(matchesRegexFilters(thread, 'exec', 'atlassian')).toBe(true);
      expect(matchesRegexFilters(thread, '8080', 'FileUtils')).toBe(true);
    });

    it('returns false when name filter does not match', () => {
      expect(matchesRegexFilters(thread, 'database', 'java.io')).toBe(false);
      expect(matchesRegexFilters(thread, 'pool', 'atlassian')).toBe(false);
    });

    it('returns false when stack filter does not match', () => {
      expect(matchesRegexFilters(thread, 'http', 'SQLException')).toBe(false);
      expect(matchesRegexFilters(thread, 'exec', 'database')).toBe(false);
    });

    it('returns true when only name filter is provided and matches', () => {
      expect(matchesRegexFilters(thread, 'http', '')).toBe(true);
      expect(matchesRegexFilters(thread, 'exec', null as any)).toBe(true);
      expect(matchesRegexFilters(thread, '8080', undefined as any)).toBe(true);
    });

    it('returns true when only stack filter is provided and matches', () => {
      expect(matchesRegexFilters(thread, '', 'java.io')).toBe(true);
      expect(matchesRegexFilters(thread, null as any, 'atlassian')).toBe(true);
      expect(matchesRegexFilters(thread, undefined as any, 'FileUtils')).toBe(true);
    });

    it('returns true when both filters are empty', () => {
      expect(matchesRegexFilters(thread, '', '')).toBe(true);
      expect(matchesRegexFilters(thread, null as any, null as any)).toBe(true);
      expect(matchesRegexFilters(thread, undefined as any, undefined as any)).toBe(true);
    });

    it('handles invalid regex in both filters gracefully', () => {
      expect(matchesRegexFilters(thread, '[', '(')).toBe(true);
      expect(matchesRegexFilters(thread, '**', '+++')).toBe(true);
      expect(matchesRegexFilters(thread, '', '[')).toBe(true);
      expect(matchesRegexFilters(thread, '[', '')).toBe(true);
    });

    it('works with real-world filtering scenarios', () => {
      // Database thread
      const dbThread = createMockThread('db-pool-worker-1', [
        'java.sql.PreparedStatement.executeQuery(PreparedStatement.java:194)',
        'com.atlassian.jira.dao.IssueDAO.findIssue(IssueDAO.java:567)',
      ]);

      expect(matchesRegexFilters(dbThread, 'db-pool', 'sql')).toBe(true);
      expect(matchesRegexFilters(dbThread, 'pool.*worker', 'PreparedStatement')).toBe(true);
      expect(matchesRegexFilters(dbThread, 'database', 'sql')).toBe(false);

      // Webhook thread
      const webhookThread = createMockThread('webhook-processor-5', [
        'com.atlassian.webhook.WebhookProcessor.process(WebhookProcessor.java:89)',
        'org.apache.http.impl.client.HttpClient.execute(HttpClient.java:234)',
      ]);

      expect(matchesRegexFilters(webhookThread, 'webhook', 'WebhookProcessor')).toBe(true);
      expect(matchesRegexFilters(webhookThread, 'processor', 'http')).toBe(true);
      expect(matchesRegexFilters(webhookThread, 'email', 'webhook')).toBe(false);
    });
  });
});
