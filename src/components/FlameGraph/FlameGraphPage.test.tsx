import { shortNameFrom, parseStackFrame, ParsedStackFrame } from './FlameGraphPage';

describe('FlameGraphPage.parseStackFrame', () => {
  describe('basic Java stack frames', () => {
    it('parses standard method call with line number', () => {
      const frame = 'io.atlassian.util.concurrent.SettableFuture.get(SettableFuture.java:95)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'io.atlassian.util.concurrent.SettableFuture.get(SettableFuture.java:95)',
        rawClassName: 'SettableFuture',
        cleanClassName: 'SettableFuture',
        rawMethodName: 'get',
        cleanMethodName: 'get',
        packageName: 'io.atlassian.util.concurrent',
        line: 'line 95',
      });
    });

    it('handles reflection method call', () => {
      const frame = 'java.lang.reflect.Method.invoke(java.base@11.0.11/Method.java:566)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'java.lang.reflect.Method.invoke(java.base@11.0.11/Method.java:566)',
        rawClassName: 'Method',
        cleanClassName: 'Method',
        rawMethodName: 'invoke',
        cleanMethodName: 'invoke',
        packageName: 'java.lang.reflect',
        line: 'line 566',
      });
    });

    it('handles unknown source', () => {
      const frame = 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)',
        rawClassName: '$Proxy21',
        cleanClassName: 'Proxy',
        rawMethodName: 'reIndex',
        cleanMethodName: 'reIndex',
        packageName: 'com.sun.proxy',
        line: 'Unknown line',
      });
    });
  });

  describe('Lambda expressions', () => {
    it('cleans up lambda class names and method references', () => {
      const frame = 'com.atlassian.jira.issue.index.DefaultIndexManager$Lambda$2492/0x0000000802fbe840.await(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.atlassian.jira.issue.index.DefaultIndexManager$Lambda$2492/0x0000000802fbe840.await(Unknown Source)',
        rawClassName: 'DefaultIndexManager$Lambda$2492/0x0000000802fbe840',
        cleanClassName: 'DefaultIndexManager',
        rawMethodName: 'await',
        cleanMethodName: 'await',
        packageName: 'com.atlassian.jira.issue.index',
        line: 'Unknown line',
      });
    });

    it('converts lambda method names to meaningful names', () => {
      const frame = 'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor.lambda$processClaimedItem$4(JiraAutomationQueueExecutor.java:268)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor.lambda$processClaimedItem$4(JiraAutomationQueueExecutor.java:268)',
        rawClassName: 'JiraAutomationQueueExecutor',
        cleanClassName: 'JiraAutomationQueueExecutor',
        rawMethodName: 'lambda$processClaimedItem$4',
        cleanMethodName: 'processClaimedItem',
        packageName: 'com.codebarrel.jira.plugin.automation.queue',
        line: 'line 268',
      });
    });

    it('handles lambda with accept method', () => {
      const frame = 'com.codebarrel.automation.rulecomponent.jira.action.setentityproperty.SetEntityPropertyActionExecutor$Lambda$4721/0x0000000803928840.accept(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.codebarrel.automation.rulecomponent.jira.action.setentityproperty.SetEntityPropertyActionExecutor$Lambda$4721/0x0000000803928840.accept(Unknown Source)',
        rawClassName: 'SetEntityPropertyActionExecutor$Lambda$4721/0x0000000803928840',
        cleanClassName: 'SetEntityPropertyActionExecutor',
        rawMethodName: 'accept',
        cleanMethodName: 'accept',
        packageName: 'com.codebarrel.automation.rulecomponent.jira.action.setentityproperty',
        line: 'Unknown line',
      });
    });

    it('handles lambda run method', () => {
      const frame = 'com.atlassian.event.internal.AsynchronousAbleEventDispatcher$Lambda$610/0x000000080095e840.run(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.atlassian.event.internal.AsynchronousAbleEventDispatcher$Lambda$610/0x000000080095e840.run(Unknown Source)',
        rawClassName: 'AsynchronousAbleEventDispatcher$Lambda$610/0x000000080095e840',
        cleanClassName: 'AsynchronousAbleEventDispatcher',
        rawMethodName: 'run',
        cleanMethodName: 'run',
        packageName: 'com.atlassian.event.internal',
        line: 'Unknown line',
      });
    });
  });

  describe('Proxy classes', () => {
    it('cleans up proxy class names', () => {
      const frame = 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.sun.proxy.$Proxy21.reIndex(Unknown Source)',
        rawClassName: '$Proxy21',
        cleanClassName: 'Proxy',
        rawMethodName: 'reIndex',
        cleanMethodName: 'reIndex',
        packageName: 'com.sun.proxy',
        line: 'Unknown line',
      });
    });

    it('handles proxy with line number', () => {
      const frame = 'com.sun.proxy.$Proxy123.execute(ProxyClass.java:42)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.sun.proxy.$Proxy123.execute(ProxyClass.java:42)',
        rawClassName: '$Proxy123',
        cleanClassName: 'Proxy',
        rawMethodName: 'execute',
        cleanMethodName: 'execute',
        packageName: 'com.sun.proxy',
        line: 'line 42',
      });
    });
  });

  describe('edge cases', () => {
    it('handles frame with no class name', () => {
      const frame = 'methodName(File.java:123)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'methodName(File.java:123)',
        rawClassName: '',
        cleanClassName: '',
        rawMethodName: 'methodName',
        cleanMethodName: 'methodName',
        packageName: '',
        line: 'line 123',
      });
    });

    it('handles frame with single part', () => {
      const frame = 'singleMethod(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'singleMethod(Unknown Source)',
        rawClassName: '',
        cleanClassName: '',
        rawMethodName: 'singleMethod',
        cleanMethodName: 'singleMethod',
        packageName: '',
        line: 'Unknown line',
      });
    });

    it('handles malformed line info', () => {
      const frame = 'com.example.Class.method(File.java:)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.example.Class.method(File.java:)',
        rawClassName: 'Class',
        cleanClassName: 'Class',
        rawMethodName: 'method',
        cleanMethodName: 'method',
        packageName: 'com.example',
        line: 'Unknown line',
      });
    });

    it('handles frame without parentheses', () => {
      const frame = 'com.example.Class.method';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.example.Class.method',
        rawClassName: 'Class',
        cleanClassName: 'Class',
        rawMethodName: 'method',
        cleanMethodName: 'method',
        packageName: 'com.example',
        line: 'Unknown line',
      });
    });

    it('handles complex lambda with multiple dollar signs', () => {
      const frame = 'com.example.service.ComplexService$Lambda$123$456/0x123456.lambda$complexOperation$7(ComplexService.java:789)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.example.service.ComplexService$Lambda$123$456/0x123456.lambda$complexOperation$7(ComplexService.java:789)',
        rawClassName: 'ComplexService$Lambda$123$456/0x123456',
        cleanClassName: 'ComplexService',
        rawMethodName: 'lambda$complexOperation$7',
        cleanMethodName: 'complexOperation',
        packageName: 'com.example.service',
        line: 'line 789',
      });
    });

    it('handles frame with no line number', () => {
      const frame = 'com.example.Class.method(Class.java)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.example.Class.method(Class.java)',
        rawClassName: 'Class',
        cleanClassName: 'Class',
        rawMethodName: 'method',
        cleanMethodName: 'method',
        packageName: 'com.example',
        line: 'Unknown line',
      });
    });

    it('handles frame with nested classes', () => {
      const frame = 'com.example.OuterClass$InnerClass.method(OuterClass.java:123)';
      const result = parseStackFrame(frame);
      expect(result).toEqual({
        rawFrame: 'com.example.OuterClass$InnerClass.method(OuterClass.java:123)',
        rawClassName: 'OuterClass$InnerClass',
        cleanClassName: 'OuterClass$InnerClass',
        rawMethodName: 'method',
        cleanMethodName: 'method',
        packageName: 'com.example',
        line: 'line 123',
      });
    });
  });

  describe('line number extraction', () => {
    it('extracts line number correctly', () => {
      const frame = 'com.example.Class.method(Class.java:123)';
      const result = parseStackFrame(frame);
      expect(result.line).toBe('line 123');
    });

    it('handles line number with extra characters', () => {
      const frame = 'com.example.Class.method(Class.java:123])';
      const result = parseStackFrame(frame);
      expect(result.line).toBe('line 123');
    });

    it('handles unknown source variations', () => {
      const frame = 'com.example.Class.method(Unknown Source)';
      const result = parseStackFrame(frame);
      expect(result.line).toBe('Unknown line');
    });
  });
});

describe('FlameGraphPage.shortNameFrom', () => {
  it('handles frame with line number', () => {
    const parsedFrame: ParsedStackFrame = {
      rawFrame: 'com.example.Class.method(Class.java:123)',
      rawClassName: 'Class',
      cleanClassName: 'Class',
      rawMethodName: 'method',
      cleanMethodName: 'method',
      packageName: 'com.example',
      line: 'line 123',
    };
    const result = shortNameFrom(parsedFrame);
    expect(result).toBe('Class.method @ line 123');
  });

  it('handles frame without line number', () => {
    const parsedFrame: ParsedStackFrame = {
      rawFrame: 'com.example.Class.method(Unknown Source)',
      rawClassName: 'Class',
      cleanClassName: 'Class',
      rawMethodName: 'method',
      cleanMethodName: 'method',
      packageName: 'com.example',
      line: 'Unknown line',
    };
    const result = shortNameFrom(parsedFrame);
    expect(result).toBe('Class.method @ Unknown line');
  });
});
