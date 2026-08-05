import { token } from '@atlaskit/tokens';
import getColorForStackLine from './getColorForStackLine';

describe('getColorForStackLine', () => {
  it('colors Crowd stack frames as data and search frames', () => {
    expect(getColorForStackLine('com.atlassian.crowd.directory.DirectoryManager.findUser')).toBe(
      token('color.background.accent.yellow.subtler'),
    );
    expect(getColorForStackLine('com.atlassian.crowd.directory.DirectoryManager.findUser', true)).toBe(
      token('color.background.accent.yellow.subtler.pressed'),
    );
  });

  it('does not treat similarly named Atlassian packages as Crowd', () => {
    expect(getColorForStackLine('com.atlassian.crowdfunding.FundingService.create')).toBe(
      token('color.background.accent.blue.subtler'),
    );
  });

  it('keeps specific data and search packages ahead of their generic platform prefix', () => {
    expect(getColorForStackLine('org.apache.lucene.search.IndexSearcher.search')).toBe(
      token('color.background.accent.yellow.subtler'),
    );
    expect(getColorForStackLine('org.apache.commons.lang3.StringUtils.isBlank')).toBe(
      token('color.background.accent.gray.subtler'),
    );
  });

  it('colors Jira and upstream OpenSearch frames as data and search', () => {
    expect(getColorForStackLine('com.atlassian.jira.search.opensearch.OpenSearchQueryExecutor.execute')).toBe(
      token('color.background.accent.yellow.subtler'),
    );
    expect(getColorForStackLine('org.opensearch.client.opensearch.OpenSearchClient.search')).toBe(
      token('color.background.accent.yellow.subtler'),
    );
  });

  it('uses green for extension frames', () => {
    expect(getColorForStackLine('com.example.plugin.CustomAction.execute', true)).toBe(
      token('color.background.accent.green.subtler.hovered'),
    );
  });
});
