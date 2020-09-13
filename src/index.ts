import fsExtra from 'fs-extra';
import {internalTask} from '@nomiclabs/buidler/config';
import {
  TASK_COMPILE_GET_RESOLVED_SOURCES,
  TASK_COMPILE_CHECK_CACHE,
  TASK_COMPILE_GET_DEPENDENCY_GRAPH,
} from '@nomiclabs/buidler/builtin-tasks/task-names';
import {ResolvedFile} from '@nomiclabs/buidler/internal/solidity/resolver';
import {getUserConfigPath} from '@nomiclabs/buidler/internal/core/project-structure';
import {DependencyGraph} from '@nomiclabs/buidler/internal/solidity/dependencyGraph';
import {areArtifactsCached} from '@nomiclabs/buidler/builtin-tasks/utils/cache';
import {BuidlerRuntimeEnvironment, LinePreprocessor} from '@nomiclabs/buidler/types';

// regex copied from https://github.com/ItsNickBarry/buidler-log-remover
const importsRegex = /\n?(\s*)?import\s*['"]@nomiclabs\/buidler\/console.sol['"]\s*;/g;
const callsRegex = /\n?(\s*)?console\s*\.\s*log\s*\([^;]*\)\s*;/g;

export function removeConsoleLog(
  condition?: (bre: BuidlerRuntimeEnvironment) => boolean | Promise<boolean>
): (bre: BuidlerRuntimeEnvironment) => Promise<LinePreprocessor | undefined> {
  const preprocess = (line: string): string => line.replace(importsRegex, '').replace(callsRegex, '');
  return async (bre: BuidlerRuntimeEnvironment): Promise<LinePreprocessor | undefined> => {
    if (typeof condition === 'function') {
      const cond = condition(bre);
      const promise = cond as Promise<boolean>;
      if (typeof cond === 'object' && 'then' in promise) {
        return promise.then((v) => (v ? preprocess : undefined));
      } else if (!cond) {
        return Promise.resolve(undefined);
      }
    }
    return Promise.resolve(preprocess);
  };
}

export default function (): void {
  internalTask(TASK_COMPILE_GET_RESOLVED_SOURCES).setAction(async (args, bre, runSuper) => {
    let linePreProcessor: LinePreprocessor | undefined;
    const getLinePreprocessor = bre.config?.preprocess?.eachLine;
    if (getLinePreprocessor) {
      const linePreProcessorPromise = getLinePreprocessor(bre);
      if (typeof linePreProcessorPromise === 'object' && 'then' in linePreProcessorPromise) {
        linePreProcessor = await linePreProcessorPromise;
      } else {
        linePreProcessor = linePreProcessorPromise;
      }
    }
    const resolvedFiles: ResolvedFile[] = await runSuper(args);
    if (linePreProcessor) {
      const processor = linePreProcessor;
      for (const resolvedFile of resolvedFiles) {
        // bypass readonly for saving content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolvedFile.content as any) = resolvedFile.content
          .split(/\r?\n/)
          .map((line) => {
            const newLine = processor(line);
            if (newLine.split(/\r?\n/).length > 1) {
              // prevent lines generated to create more line, this ensure preservation of line number while debugging
              throw new Error(`Line processor cannot create new lines. This ensures that line numbers are preserved`);
            }
            return newLine;
          })
          .join('\n');
      }
    }
    return resolvedFiles;
  });

  // TODO improve cache handling, for now reimplement TASK_COMPILE_CHECK_CACHE but add buidler.config.[ts|js] as source for timestamp checking
  internalTask(TASK_COMPILE_CHECK_CACHE, async ({force}, {config, run}) => {
    if (force) {
      return false;
    }

    const dependencyGraph: DependencyGraph = await run(TASK_COMPILE_GET_DEPENDENCY_GRAPH);

    const sourceTimestamps = dependencyGraph
      .getResolvedFiles()
      .map((file: {lastModificationDate: Date}) => file.lastModificationDate.getTime());
    const stats = await fsExtra.stat(getUserConfigPath());
    const lastModificationDate = new Date(stats.ctime);
    sourceTimestamps.push(lastModificationDate.getTime());

    return areArtifactsCached(sourceTimestamps, config.solc, config.paths);
  });
}
