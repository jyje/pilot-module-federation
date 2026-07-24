import type { DeploymentContext } from '@pilot/contracts';
type __VLS_Props = {
    context: DeploymentContext;
    loading?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "deployment-selected": (id: string) => any;
    "alert-acknowledged": (id: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onDeployment-selected"?: ((id: string) => any) | undefined;
    "onAlert-acknowledged"?: ((id: string) => any) | undefined;
}>, {
    loading: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
