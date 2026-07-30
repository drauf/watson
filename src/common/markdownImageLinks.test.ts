import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)]+)\)/g;

const findRootMarkdownFiles = (): string[] => fs.readdirSync(REPO_ROOT)
  .filter((file) => file.endsWith('.md'))
  .map((file) => path.join(REPO_ROOT, file));

const extractImagePaths = (markdownContent: string): string[] => [...markdownContent.matchAll(MARKDOWN_IMAGE_PATTERN)]
  .map((match) => match[1])
  .filter((imagePath): imagePath is string => imagePath !== undefined && !/^https?:\/\//.test(imagePath));

describe('markdown image links', () => {
  it.each(findRootMarkdownFiles())('every image referenced in %s exists on disk', (markdownFile) => {
    const content = fs.readFileSync(markdownFile, 'utf-8');
    const referencedImagePaths = extractImagePaths(content);

    const missingImagePaths = referencedImagePaths.filter(
      (imagePath) => !fs.existsSync(path.join(REPO_ROOT, imagePath)),
    );

    expect(missingImagePaths).toEqual([]);
  });
});
