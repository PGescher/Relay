import React from 'react';
import { syncNow } from '../../data/sync/syncManager';
import { useAuth } from '../../context/AuthContext';

type Props = {
  module?: 'GYM' | 'RUN' | 'BIKE' | 'SWIM' | 'TENNIS' | 'PADEL';
  className?: string;
  onDone?: () => void; // optional: refresh UI after sync
  label?: string;      // default "Sync"
};

const SyncButton: React.FC<Props> = ({ module = 'GYM', className, onDone, label = 'Sync' }) => {
  const { user, token } = useAuth();
  const [syncing, setSyncing] = React.useState(false);

  const disabled = !user?.id || !token || syncing;

  async function handleSync() {
    if (!user?.id || !token) return;
    setSyncing(true);
    try {
      await syncNow({ userId: user.id, token, module });
      onDone?.();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={disabled}
      className={
        className ??
        "bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-full text-xs font-[900] uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--glass-strong)] disabled:opacity-50"
      }
      title={!user?.id || !token ? 'Login required' : undefined}
    >
      {syncing ? 'Syncing…' : label}
    </button>
  );
};

export default SyncButton;
