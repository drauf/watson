# Screenshots

## Home page
![Home page](e2e/main-page.spec.tsx-snapshots/Main-page-loads-1-chrome-light-linux.png)

## Summary
Displays running processes, memory and swap usage, and load averages, based on top outputs.

![Summary page](e2e/main-page.spec.tsx-snapshots/Main-page-redirects-after-uploading-files-1-chrome-light-linux.png)

## Threads overview
High-level overview of threads' state over time. Includes pre-built filters and allows manual filtering with regular expressions by thread names or stack frames. Very colorful to make it obvious when a thread changes states.

![Threads overview page](e2e/threads-overview.spec.tsx-snapshots/Threads-overview-loads-1-chrome-light-linux.png)

## Thread details
On most pages clicking a thread's name will open a pop-up like below. It includes colored stack frames to make it easier to notice JDK methods, database calls, Atlassian's and 3rd party code.

![Coloring stack traces](e2e/visual/components/thread-details.visual.spec.tsx-snapshots/thread-details-waiting-with-locks-chrome-light-components-linux.png)

## Flame graph
A classical flame graph with the ability to zoom by clicking on a frame

![Flame graph](e2e/flame-graph.spec.tsx-snapshots/Flame-graph-loads-1-chrome-light-linux.png)

## CPU consumers
Allows quickly finding threads that use the most CPU

![CPU consumers page](e2e/cpu-consumers.spec.tsx-snapshots/CPU-consumers-loads-1-chrome-light-linux.png)

## Similar stacks
Groups threads with similar stack traces, often helpful when debugging lock contention issues

![Similar stack traces page](e2e/similar-stacks.spec.tsx-snapshots/Similar-stacks-loads-1-chrome-light-linux.png)

## Stuck threads
Displays threads whose stack traces remained almost the same over time

![Stuck threads](e2e/stuck-threads.spec.tsx-snapshots/Stuck-threads-loads-1-chrome-light-linux.png)

## Monitors
Displays locks ordered by the amount of threads waiting for them

![Monitors page](e2e/monitors.spec.tsx-snapshots/Monitors-loads-1-chrome-light-linux.png)
