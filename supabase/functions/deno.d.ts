declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (
    handler: (req: Request) => Response | Promise<Response>,
  ) => void;
};

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(url: string, key: string): any;
}

declare module "https://deno.land/std@0.168.0/node/crypto.ts" {
  export function createHmac(
    algorithm: string,
    key: string,
  ): {
    update(data: string): { digest(encoding: string): string };
  };
}

declare module "jsr:@supabase/functions-js/edge-runtime.d.ts" {}
