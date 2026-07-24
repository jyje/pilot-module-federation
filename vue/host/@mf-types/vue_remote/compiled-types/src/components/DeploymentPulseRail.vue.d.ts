import type { ModelDeployment } from '@pilot/contracts';
type __VLS_Props = {
    deployments: readonly ModelDeployment[];
    selectedId: string;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    select: (id: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSelect?: ((id: string) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
