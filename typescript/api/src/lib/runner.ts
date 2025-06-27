export type Runner = () => Promise<() => Promise<unknown>>;

export const createRunner =
  (...runners: Runner[]) =>
  async () => {
    const terminates: (() => Promise<unknown>)[] = [];
    for (const runner of runners) {
      try {
        terminates.unshift(await runner());
      } catch (error) {
        console.error(error);
      }
    }
    return async () => {
      for (const terminate of terminates) {
        try {
          await terminate();
        } catch (error) {
          console.error(error);
        }
      }
    };
  };
