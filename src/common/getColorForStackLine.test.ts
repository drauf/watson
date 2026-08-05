import { token } from '@atlaskit/tokens';
import getColorForStackLine, {
  buildPackageColorTrie,
  findColorGroup,
  packageColorRules,
} from './getColorForStackLine';

const packageColorTrie = buildPackageColorTrie(packageColorRules);

describe('getColorForStackLine', () => {
  it('keeps package rules alphabetically sorted', () => {
    const packageNames = packageColorRules.map((rule) => rule.packageName);

    expect(packageNames).toEqual([...packageNames].sort());
  });

  it.each([
    ['com.atlassian.jira.issue.IssueManager.getIssue', 'product'],
    ['com.atlassian.crowd.directory.DirectoryManager.findUser', 'dataAndSearch'],
    ['com.atlassian.jira.search.opensearch.OpenSearchQueryExecutor.execute', 'dataAndSearch'],
    ['org.apache.lucene.search.IndexSearcher.search', 'dataAndSearch'],
    ['org.opensearch.client.opensearch.OpenSearchClient.search', 'dataAndSearch'],
    ['java.lang.Thread.run', 'platform'],
    ['org.apache.commons.lang3.StringUtils.isBlank', 'platform'],
    ['com.example.plugin.CustomAction.execute', 'extension'],
  ])('classifies %s as %s', (line, expectedColorGroup) => {
    expect(findColorGroup(line, packageColorTrie)).toBe(expectedColorGroup);
  });

  it('uses the deepest package match regardless of registration order', () => {
    const genericFirst = buildPackageColorTrie([
      { packageName: 'org.apache', colorGroup: 'platform' },
      { packageName: 'org.apache.lucene', colorGroup: 'dataAndSearch' },
    ]);
    const specificFirst = buildPackageColorTrie([
      { packageName: 'org.apache.lucene', colorGroup: 'dataAndSearch' },
      { packageName: 'org.apache', colorGroup: 'platform' },
    ]);

    expect(findColorGroup('org.apache.lucene.search.IndexSearcher.search', genericFirst)).toBe('dataAndSearch');
    expect(findColorGroup('org.apache.lucene.search.IndexSearcher.search', specificFirst)).toBe('dataAndSearch');
  });

  it('falls back to the closest configured ancestor when a deeper package is unknown', () => {
    expect(findColorGroup('com.atlassian.crowdfunding.FundingService.create', packageColorTrie)).toBe('product');
  });

  it.each([
    'com.not_in_trie.Something.execute',
    'UnqualifiedClass.run',
  ])('returns extension for an unknown package: %s', (line) => {
    expect(findColorGroup(line, packageColorTrie)).toBe('extension');
  });

  it.each([
    ['com.atlassian.jira.issue.IssueManager.getIssue', false, token('color.background.accent.blue.subtler')],
    ['com.atlassian.crowd.directory.DirectoryManager.findUser', true, token('color.background.accent.yellow.subtler.pressed')],
    ['java.lang.Thread.run', false, token('color.background.accent.gray.subtler')],
    ['com.example.plugin.CustomAction.execute', true, token('color.background.accent.green.subtler.hovered')],
  ])('maps %s to its expected semantic color token', (line, fade, expectedColor) => {
    expect(getColorForStackLine(line, fade)).toBe(expectedColor);
  });
});
