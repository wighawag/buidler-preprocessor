import '@nomiclabs/buidler/types';
declare module '@nomiclabs/buidler/types' {
  export type LinePreprocessor = (line: string, sourceInfo: {absolutePath: string}) => string;

  export interface BuidlerConfig {
    preprocess?: {
      eachLine: (
        bre: BuidlerRuntimeEnvironment
      ) => LinePreprocessor | Promise<LinePreprocessor | undefined> | undefined;
    };
  }
}
