import { shortNameFrom } from './FlameGraphPage';

describe('FlameGraphPage.shortNameFrom', () => {
  describe('basic Java stack frames', () => {
    it('converts standard method call with line number', () => {
      const frame = 'io.atlassian.util.concurrent.SettableFuture.get(SettableFuture.java:95)';
      const result = shortNameFrom(frame);
      expect(result).toBe('SettableFuture.get @ line 95');
    });

    it('handles reflection method call', () => {
      const frame = 'java.lang.reflect.Method.invoke(java.base@11.0.11/Method.java:566)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Method.invoke @ line 566');
    });

    it('handles unknown source', () => {
      const frame = 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Proxy.reIndex @ Unknown line');
    });
  });

  describe('Lambda expressions', () => {
    it('cleans up lambda class names and method references', () => {
      const frame = 'com.atlassian.jira.issue.index.DefaultIndexManager$$Lambda$2492/0x0000000802fbe840.await(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('DefaultIndexManager.await @ Unknown line');
    });

    it('converts lambda method names to meaningful names', () => {
      const frame = 'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor.lambda$processClaimedItem$4(JiraAutomationQueueExecutor.java:268)';
      const result = shortNameFrom(frame);
      expect(result).toBe('JiraAutomationQueueExecutor.processClaimedItem @ line 268');
    });

    it('handles lambda with accept method', () => {
      const frame = 'com.codebarrel.automation.rulecomponent.jira.action.setentityproperty.SetEntityPropertyActionExecutor$$Lambda$4721/0x0000000803928840.accept(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('SetEntityPropertyActionExecutor.accept @ Unknown line');
    });

    it('handles lambda run method', () => {
      const frame = 'com.atlassian.event.internal.AsynchronousAbleEventDispatcher$$Lambda$610/0x000000080095e840.run(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('AsynchronousAbleEventDispatcher.run @ Unknown line');
    });
  });

  describe('Proxy classes', () => {
    it('cleans up proxy class names', () => {
      const frame = 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Proxy.reIndex @ Unknown line');
    });

    it('handles proxy with line number', () => {
      const frame = 'com.sun.proxy.$Proxy123.execute(ProxyClass.java:42)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Proxy.execute @ line 42');
    });
  });

  describe('edge cases', () => {
    it('handles frame with no class name', () => {
      const frame = 'methodName(File.java:123)';
      const result = shortNameFrom(frame);
      expect(result).toBe('.methodName @ line 123');
    });

    it('handles frame with single part', () => {
      const frame = 'singleMethod(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('.singleMethod @ Unknown line');
    });

    it('handles malformed line info', () => {
      const frame = 'com.example.Class.method(File.java:)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ Unknown line');
    });

    it('handles frame without parentheses', () => {
      const frame = 'com.example.Class.method';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ Unknown line');
    });

    it('handles complex lambda with multiple dollar signs', () => {
      const frame = 'com.example.service.ComplexService$$Lambda$123$456/0x123456.lambda$complexOperation$7(ComplexService.java:789)';
      const result = shortNameFrom(frame);
      expect(result).toBe('ComplexService.complexOperation @ line 789');
    });

    it('handles frame with no line number', () => {
      const frame = 'com.example.Class.method(Class.java)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ Unknown line');
    });

    it('handles frame with nested classes', () => {
      const frame = 'com.example.OuterClass$InnerClass.method(OuterClass.java:123)';
      const result = shortNameFrom(frame);
      expect(result).toBe('OuterClass$InnerClass.method @ line 123');
    });
  });

  describe('line number extraction', () => {
    it('extracts line number correctly', () => {
      const frame = 'com.example.Class.method(Class.java:123)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ line 123');
    });

    it('handles line number with extra characters', () => {
      const frame = 'com.example.Class.method(Class.java:123])';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ line 123');
    });

    it('handles unknown source variations', () => {
      const frame = 'com.example.Class.method(Unknown Source)';
      const result = shortNameFrom(frame);
      expect(result).toBe('Class.method @ Unknown line');
    });
  });
});
