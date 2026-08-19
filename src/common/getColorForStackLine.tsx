import { token } from '@atlaskit/tokens';

export type ColorGroup = 'product' | 'dataAndSearch' | 'platform' | 'extension';

export type StackLineAppearance = Readonly<{
  backgroundColor: string;
  hoverBackgroundColor: string;
  color: string;
}>;

type ColorPair = Readonly<{
  normal: StackLineAppearance;
  faded: StackLineAppearance;
}>;

export type PackageColorRule = Readonly<{
  packageName: string;
  colorGroup: ColorGroup;
}>;

export interface PackageColorTrie {
  colorGroup?: ColorGroup;
  children: Map<string, PackageColorTrie>;
}

const colors: Readonly<Record<ColorGroup, ColorPair>> = {
  // Jira and other Atlassian product code worth distinguishing from supporting libraries
  product: {
    normal: { backgroundColor: token('color.background.accent.blue.subtlest'), hoverBackgroundColor: token('color.background.accent.blue.subtlest.hovered'), color: token('color.text.accent.blue') },
    faded: { backgroundColor: token('color.background.accent.blue.subtlest.pressed'), hoverBackgroundColor: token('color.background.accent.blue.subtlest.hovered'), color: token('color.text.accent.blue.bolder') },
  },
  // Databases, caches, directory lookups, and indexing/search engines
  dataAndSearch: {
    normal: { backgroundColor: token('color.background.accent.orange.subtlest'), hoverBackgroundColor: token('color.background.accent.orange.subtlest.hovered'), color: token('color.text.accent.orange') },
    faded: { backgroundColor: token('color.background.accent.orange.subtlest.pressed'), hoverBackgroundColor: token('color.background.accent.orange.subtlest.hovered'), color: token('color.text.accent.orange.bolder') },
  },
  // JDK, framework, and library plumbing that normally should not draw attention
  platform: {
    normal: { backgroundColor: token('color.background.accent.gray.subtlest'), hoverBackgroundColor: token('color.background.accent.gray.subtlest.hovered'), color: token('color.text.accent.gray') },
    faded: { backgroundColor: token('color.background.accent.gray.subtlest.pressed'), hoverBackgroundColor: token('color.background.accent.gray.subtlest.hovered'), color: token('color.text.accent.gray.bolder') },
  },
  // App and plugin code outside the known product and platform namespaces
  extension: {
    normal: { backgroundColor: token('color.background.accent.green.subtlest'), hoverBackgroundColor: token('color.background.accent.green.subtlest.hovered'), color: token('color.text.accent.green') },
    faded: { backgroundColor: token('color.background.accent.green.subtlest.pressed'), hoverBackgroundColor: token('color.background.accent.green.subtlest.hovered'), color: token('color.text.accent.green.bolder') },
  },
};

export const packageColorRules: readonly PackageColorRule[] = [
  { packageName: 'com.atlassian', colorGroup: 'product' },
  { packageName: 'com.atlassian.crowd', colorGroup: 'dataAndSearch' },
  { packageName: 'com.atlassian.jira.crowd', colorGroup: 'dataAndSearch' },
  { packageName: 'com.atlassian.jira.search', colorGroup: 'dataAndSearch' },
  { packageName: 'com.google', colorGroup: 'platform' },
  { packageName: 'com.microsoft.sqlserver', colorGroup: 'dataAndSearch' },
  { packageName: 'com.mysql', colorGroup: 'dataAndSearch' },
  { packageName: 'com.querydsl', colorGroup: 'dataAndSearch' },
  { packageName: 'com.sun', colorGroup: 'platform' },
  { packageName: 'groovy.lang', colorGroup: 'platform' },
  { packageName: 'io.atlassian', colorGroup: 'platform' },
  { packageName: 'jakarta', colorGroup: 'platform' },
  { packageName: 'java', colorGroup: 'platform' },
  { packageName: 'javax', colorGroup: 'platform' },
  { packageName: 'jdk', colorGroup: 'platform' },
  { packageName: 'net.java', colorGroup: 'platform' },
  { packageName: 'net.sf.ehcache', colorGroup: 'dataAndSearch' },
  { packageName: 'oracle.jdbc', colorGroup: 'dataAndSearch' },
  { packageName: 'org.apache', colorGroup: 'platform' },
  { packageName: 'org.apache.lucene', colorGroup: 'dataAndSearch' },
  { packageName: 'org.codehaus', colorGroup: 'platform' },
  { packageName: 'org.eclipse', colorGroup: 'platform' },
  { packageName: 'org.glassfish', colorGroup: 'platform' },
  { packageName: 'org.hibernate', colorGroup: 'dataAndSearch' },
  { packageName: 'org.jooq', colorGroup: 'dataAndSearch' },
  { packageName: 'org.mozilla', colorGroup: 'platform' },
  { packageName: 'org.ofbiz', colorGroup: 'dataAndSearch' },
  { packageName: 'org.opensearch', colorGroup: 'dataAndSearch' },
  { packageName: 'org.postgresql', colorGroup: 'dataAndSearch' },
  { packageName: 'org.springframework', colorGroup: 'platform' },
  { packageName: 'sun', colorGroup: 'platform' },
  { packageName: 'webwork', colorGroup: 'platform' },
];

const createTrieNode = (): PackageColorTrie => ({ children: new Map() });

export const buildPackageColorTrie = (rules: readonly PackageColorRule[]): PackageColorTrie => {
  const root = createTrieNode();

  for (const { packageName, colorGroup } of rules) {
    let node = root;
    for (const segment of packageName.split('.')) {
      let child = node.children.get(segment);
      if (!child) {
        child = createTrieNode();
        node.children.set(segment, child);
      }
      node = child;
    }
    node.colorGroup = colorGroup;
  }

  return root;
};

// Walk the matching package path and retain its deepest configured group.
// A partial match falls back to its closest ancestor; no match is an extension.
export const findColorGroup = (line: string, root: PackageColorTrie): ColorGroup => {
  let node = root;
  let matchingColorGroup: ColorGroup | undefined;

  for (const segment of line.split('.')) {
    const child = node.children.get(segment);
    if (!child) break;

    node = child;
    matchingColorGroup = child.colorGroup ?? matchingColorGroup;
  }

  return matchingColorGroup ?? 'extension';
};

const packageColorTrie = buildPackageColorTrie(packageColorRules);

export default function getColorForStackLine(line: string, fade = false): StackLineAppearance {
  const color = colors[findColorGroup(line, packageColorTrie)];
  return fade ? color.faded : color.normal;
}
