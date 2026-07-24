
    export type RemoteKeys = 'vue_remote/Monitor';
    type PackageType<T> = T extends 'vue_remote/Monitor' ? typeof import('vue_remote/Monitor') :any;