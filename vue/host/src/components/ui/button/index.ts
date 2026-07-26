import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'platform-button',
  {
    variants: {
      variant: {
        default: '',
        outline: 'platform-button--outline',
        secondary: 'platform-button--outline',
        ghost: 'platform-button--ghost',
        destructive: 'platform-button--danger',
        link: 'platform-button--ghost',
      },
      size: {
        'default': '',
        'xs': 'platform-button--sm',
        'sm': 'platform-button--sm',
        'lg': '',
        'icon': '',
        'icon-xs': 'platform-button--sm',
        'icon-sm': 'platform-button--sm',
        'icon-lg': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
