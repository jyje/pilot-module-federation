import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompositionControls } from '../components/composition-controls';

function tabs() {
  const all = screen.getAllByRole('tab');
  return { federationTab: all[0]!, iframeTab: all[1]! };
}

describe('CompositionControls', () => {
  it('renders Federation and iframe tabs with the current mode marked active', () => {
    render(<CompositionControls mode="federation" onModeChange={() => {}} />);
    const { federationTab, iframeTab } = tabs();
    expect(federationTab).toHaveTextContent('Federation');
    expect(iframeTab).toHaveTextContent('iframe');
    expect(federationTab).toHaveAttribute('aria-selected', 'true');
    expect(iframeTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onModeChange("iframe") when the iframe tab is activated', async () => {
    const onModeChange = vi.fn();
    render(<CompositionControls mode="federation" onModeChange={onModeChange} />);
    await userEvent.click(tabs().iframeTab);
    expect(onModeChange).toHaveBeenCalledWith('iframe');
  });

  it('calls onModeChange("federation") when the federation tab is activated', async () => {
    const onModeChange = vi.fn();
    render(<CompositionControls mode="iframe" onModeChange={onModeChange} />);
    await userEvent.click(tabs().federationTab);
    expect(onModeChange).toHaveBeenCalledWith('federation');
  });
});
