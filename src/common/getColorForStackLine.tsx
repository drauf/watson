import { token } from '@atlaskit/tokens';

export default function getColorForStackLine(line: string, fade = false): string {
  // anything Atlassian
  if (line.startsWith('com.atlassian')) {
    return fade ? token('color.background.accent.blue.subtler.hovered') : token('color.background.accent.blue.subtler');
  }

  // database, index, caches
  if (line.startsWith('com.microsoft.sqlserver')
    || line.startsWith('com.mysql')
    || line.startsWith('com.querydsl')
    || line.startsWith('net.sf.ehcache')
    || line.startsWith('oracle.jdbc')
    || line.startsWith('org.apache.lucene')
    || line.startsWith('org.ofbiz')
    || line.startsWith('org.postgresql')) {
    return fade ? token('color.background.accent.yellow.subtler.pressed') : token('color.background.accent.yellow.subtler');
  }

  // "Boring" third parties
  if (line.startsWith('com.google')
    || line.startsWith('com.sun')
    || line.startsWith('io.atlassian')
    || line.startsWith('java.')
    || line.startsWith('javax.')
    || line.startsWith('jdk.')
    || line.startsWith('net.java')
    || line.startsWith('org.apache')
    || line.startsWith('org.codehaus')
    || line.startsWith('org.eclipse')
    || line.startsWith('org.glassfish')
    || line.startsWith('org.mozilla')
    || line.startsWith('org.springframework')
    || line.startsWith('sun.')
    || line.startsWith('webwork')) {
    return fade ? token('color.background.accent.gray.subtler.pressed') : token('color.background.accent.gray.subtler');
  }

  // most likely 3rd party apps
  return fade ? token('color.background.accent.green.subtler.hovered') : token('color.background.accent.green.subtler');
}
