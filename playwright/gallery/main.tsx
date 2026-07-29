import React, { StrictMode } from 'react';
import AppProvider from '@atlaskit/app-provider';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import '../../src/index.css';
import '@atlaskit/css-reset';

type Story = React.ComponentType<Record<string, unknown>>;
type StoryModule = Record<string, Story | undefined>;

interface MountParams {
  story: string;
  props?: Record<string, unknown>;
}

declare global {
  interface Window {
    mount: (params: MountParams) => Promise<void>;
    unmount: () => Promise<void>;
  }
}

const stories = import.meta.glob<StoryModule>('../../src/**/*.story.tsx');

const getStoryPath = (filePath: string): string => filePath
  .replace(/^\.\.\/\.\.\/src\//, '')
  .replace(/\.story\.tsx$/, '');

const resolveStory = async (storyId: string): Promise<Story | undefined> => {
  const separatorIndex = storyId.lastIndexOf('/');
  const storyPath = storyId.slice(0, separatorIndex);
  const exportName = storyId.slice(separatorIndex + 1);
  const filePath = Object.keys(stories).find((candidate) => (
    getStoryPath(candidate) === storyPath || getStoryPath(candidate).endsWith(`/${storyPath}`)
  ));

  if (!filePath) {
    return undefined;
  }

  const storyModule = await stories[filePath]();
  return storyModule[exportName] ?? storyModule['default'];
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Gallery root element not found');
}

let root: Root | undefined;

window.mount = async ({ story, props = {} }: MountParams): Promise<void> => {
  const Story = await resolveStory(story);
  if (!Story) {
    throw new Error(`Unknown story: ${story}`);
  }

  root ??= createRoot(rootElement);
  flushSync(() => {
    root?.render(
      <StrictMode>
        <AppProvider defaultColorMode="auto">
          <Story {...props} />
        </AppProvider>
      </StrictMode>,
    );
  });
};

window.unmount = async (): Promise<void> => {
  root?.unmount();
  root = undefined;
};

document.documentElement.style.setProperty('--watson-navigation-height', '0px');
rootElement.style.height = '100vh';
document.body.classList.add('no-motion');
