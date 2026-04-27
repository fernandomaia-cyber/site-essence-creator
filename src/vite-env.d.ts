/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOTGROUP_DOC_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
