import { token } from '@atlaskit/tokens';

type ColorGroup = 'product' | 'dataAndSearch' | 'platform' | 'extension';

type ColorPair = Readonly<{
  normal: string;
  faded: string;
}>;

type PrefixRule = Readonly<{
  prefix: string;
  colorGroup: ColorGroup;
}>;

const colors: Readonly<Record<ColorGroup, ColorPair>> = {
  // Jira and other Atlassian product code worth distinguishing from supporting libraries
  product: {
    normal: token('color.background.accent.blue.subtler'),
    faded: token('color.background.accent.blue.subtler.hovered'),
  },
  // Databases, caches, directory lookups, and indexing/search engines
  dataAndSearch: {
    normal: token('color.background.accent.yellow.subtler'),
    faded: token('color.background.accent.yellow.subtler.pressed'),
  },
  // JDK, framework, and library plumbing that normally should not draw attention
  platform: {
    normal: token('color.background.accent.gray.subtler'),
    faded: token('color.background.accent.gray.subtler.pressed'),
  },
  // App and plugin code outside the known product and platform namespaces
  extension: {
    normal: token('color.background.accent.green.subtler'),
    faded: token('color.background.accent.green.subtler.hovered'),
  },
};

const rulesByRootPackage: Readonly<Record<string, readonly PrefixRule[]>> = {
  com: [
    { prefix: 'com.atlassian.crowd.', colorGroup: 'dataAndSearch' },
    { prefix: 'com.atlassian.jira.search', colorGroup: 'dataAndSearch' },
    { prefix: 'com.atlassian.', colorGroup: 'product' },
    { prefix: 'com.google.', colorGroup: 'platform' },
    { prefix: 'com.querydsl.', colorGroup: 'dataAndSearch' },
    { prefix: 'com.microsoft.sqlserver.', colorGroup: 'dataAndSearch' },
    { prefix: 'com.mysql.', colorGroup: 'dataAndSearch' },
    { prefix: 'com.sun.', colorGroup: 'platform' },
  ],
  io: [
    { prefix: 'io.atlassian.', colorGroup: 'platform' },
  ],
  jakarta: [
    { prefix: 'jakarta.', colorGroup: 'platform' },
  ],
  java: [
    { prefix: 'java.', colorGroup: 'platform' },
  ],
  javax: [
    { prefix: 'javax.', colorGroup: 'platform' },
  ],
  jdk: [
    { prefix: 'jdk.', colorGroup: 'platform' },
  ],
  net: [
    { prefix: 'net.sf.ehcache.', colorGroup: 'dataAndSearch' },
    { prefix: 'net.java.', colorGroup: 'platform' },
  ],
  oracle: [
    { prefix: 'oracle.jdbc.', colorGroup: 'dataAndSearch' },
  ],
  org: [
    { prefix: 'org.apache.lucene.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.apache.', colorGroup: 'platform' },
    { prefix: 'org.codehaus.', colorGroup: 'platform' },
    { prefix: 'org.eclipse.', colorGroup: 'platform' },
    { prefix: 'org.glassfish.', colorGroup: 'platform' },
    { prefix: 'org.hibernate.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.jooq.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.mozilla.', colorGroup: 'platform' },
    { prefix: 'org.ofbiz.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.opensearch.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.postgresql.', colorGroup: 'dataAndSearch' },
    { prefix: 'org.springframework.', colorGroup: 'platform' },
  ],
  sun: [
    { prefix: 'sun.', colorGroup: 'platform' },
  ],
  webwork: [
    { prefix: 'webwork.', colorGroup: 'platform' },
  ],
};

const getRootPackage = (line: string): string => {
  const firstDot = line.indexOf('.');
  return firstDot === -1 ? line : line.slice(0, firstDot);
};

const getColorGroup = (line: string): ColorGroup => {
  const matchingRule = rulesByRootPackage[getRootPackage(line)]
    ?.find((rule) => line.startsWith(rule.prefix));

  return matchingRule?.colorGroup ?? 'extension';
};

export default function getColorForStackLine(line: string, fade = false): string {
  const color = colors[getColorGroup(line)];
  return fade ? color.faded : color.normal;
}
