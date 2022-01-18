export default function getColorForStackLine(line: string, fade = false): string {
  // anything Atlassian
  if (line.startsWith('com.atlassian')) {
    return fade ? '#C8D4E6' : '#DEEBFF';
  }

  // database and Lucene
  if (line.startsWith('com.microsoft.sqlserver')
    || line.startsWith('com.mysql.jdbc')
    || line.startsWith('oracle.jdbc')
    || line.startsWith('org.apache.lucene')
    || line.startsWith('org.ofbiz')
    || line.startsWith('org.postgresql')) {
    return fade ? '#E6E2CF' : '#FFFAE6';
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
    return fade ? '#C7C8CD' : '#DFE1E6';
  }

  // most likely 3rd party apps
  return fade ? '#CDE4D8' : '#E3FCEF';
}
