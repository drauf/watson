import type { JSX } from 'react';
import { FlameGraphNode } from './flameGraphModel';
import FlameGraph from './FlameGraph';

const chartData: FlameGraphNode = {
  name: 'root',
  value: 12,
  children: [
    {
      name: 'IndexSearcher.search @ line 42',
      value: 8,
      children: [],
      parsedStackFrame: {
        rawFrame: 'com.atlassian.jira.issue.search.searchers.transformer.ExtremelyLongQueryExecutionCoordinatorWithNestedOptimizations$ConcurrentRequestExecutionPipeline$ResultAggregationAndPermissionValidationDelegate.search(ExtremelyLongQueryExecutionCoordinatorWithNestedOptimizations.java:42)',
        rawClassName: 'ExtremelyLongQueryExecutionCoordinatorWithNestedOptimizations$ConcurrentRequestExecutionPipeline$ResultAggregationAndPermissionValidationDelegate',
        cleanClassName: 'ExtremelyLongQueryExecutionCoordinatorWithNestedOptimizations$ConcurrentRequestExecutionPipeline$ResultAggregationAndPermissionValidationDelegate',
        rawMethodName: 'search',
        cleanMethodName: 'search',
        packageName: 'org.apache.lucene.search',
        line: 'line 42',
      },
    },
  ],
  parsedStackFrame: {
    rawFrame: 'root',
    rawClassName: '',
    cleanClassName: '',
    rawMethodName: '',
    cleanMethodName: '',
    packageName: '',
    line: '',
  },
};

const Basic = (): JSX.Element => <FlameGraph chartData={chartData} />;

export default Basic;
