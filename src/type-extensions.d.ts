import '@nomiclabs/buidler/types';
declare module '@nomiclabs/buidler/types' {
  export type LinePreprocessor = (line: string) => string;

  export interface BuidlerConfig {
    preprocess?: {
      eachLine: (
        bre: BuidlerRuntimeEnvironment
      ) => LinePreprocessor | Promise<LinePreprocessor | undefined> | undefined;
    };
  }
}
