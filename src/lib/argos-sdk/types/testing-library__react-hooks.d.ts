declare module "@testing-library/react-hooks" {
  export interface RenderHookResult<TProps, TResult> {
    result: { current: TResult };
    rerender: (props?: TProps) => void;
    unmount: () => void;
    waitFor: (
      callback: () => boolean | void | Promise<boolean | void>,
      options?: { timeout?: number },
    ) => Promise<void>;
    waitForNextUpdate: (options?: { timeout?: number }) => Promise<void>;
    waitForValueToChange: (
      selector: () => unknown,
      options?: { timeout?: number },
    ) => Promise<void>;
  }

  export function renderHook<TProps, TResult>(
    callback: (props: TProps) => TResult,
    options?: {
      initialProps?: TProps;
      wrapper?: React.ComponentType;
    },
  ): RenderHookResult<TProps, TResult>;
}
