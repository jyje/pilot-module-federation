import { fileURLToPath } from 'node:url';

export const tokensCssPath = fileURLToPath(new URL('./tokens.css', import.meta.url));
