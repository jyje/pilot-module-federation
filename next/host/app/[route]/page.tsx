import HostPage from '../page';

/**
 * The Host owns platform URLs. This route deliberately reuses the client
 * shell, which reads the current pathname and mounts the matching Remote.
 */
export default function PlatformRoutePage() {
  return <HostPage />;
}
