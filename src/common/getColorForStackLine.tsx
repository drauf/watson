export default function getColorForStackLine(line: string): string {
  // anything Atlassian
  if (line.startsWith('com.atlassian')) {
    return '#DEEBFF';
  }

  // database and Lucene
  if (line.startsWith('com.microsoft.sqlserver')
    || line.startsWith('com.mysql.jdbc')
    || line.startsWith('oracle.jdbc')
    || line.startsWith('org.apache.lucene')
    || line.startsWith('org.ofbiz')
    || line.startsWith('org.postgresql')) {
    return '#FFFAE6';
  }

  // "Boring" third parties
  if (line.startsWith('com.google')
    || line.startsWith('com.sun')
    || line.startsWith('io.atlassian')
    || line.startsWith('java.')
    || line.startsWith('javax.')
    || line.startsWith('net.java')
    || line.startsWith('org.apache')
    || line.startsWith('org.codehaus')
    || line.startsWith('org.eclipse')
    || line.startsWith('org.mozilla')
    || line.startsWith('org.springframework')
    || line.startsWith('sun.')
    || line.startsWith('webwork')) {
    return '#DFE1E6';
  }

  // most likely 3rd party apps
  return '#E3FCEF';
}
