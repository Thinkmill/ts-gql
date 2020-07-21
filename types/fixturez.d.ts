type Opts = {
  glob?: string | Array<string>;
  root?: string;
  cleanup?: boolean;
};

declare module "fixturez" {
  export default function (
    cwd: string,
    opts?: Opts
  ): {
    find: (fixture: string) => string;
    temp: () => string;
    copy: (fixture: string) => string;
    cleanup: () => void;
  };
}
