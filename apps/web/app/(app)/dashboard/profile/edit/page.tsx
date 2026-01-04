'use client';

/**
 * Profile Edit Page
 * Block editor for managing profile content
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlockEditor } from '@/app/components/profile/blocks/BlockEditor';
import { useProfileBlocksApi } from '@/lib/hooks/useProfileBlocks';
import { useHasUnsavedChanges } from '@/lib/stores/profile-editor-store';

export default function ProfileEditPage() {
  const api = useProfileBlocksApi();
  const hasUnsavedChanges = useHasUnsavedChanges();
  const [profileIdentifier, setProfileIdentifier] = useState<string | null>(null);
  const [latestVersionId, setLatestVersionId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load user profile info
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);

        // TODO: Fetch current user's profile identifier and latest version
        // For now, using 'me' as a placeholder - you'll want to:
        // 1. Get the current user's profile from your auth/profile endpoint
        // 2. Get their latest version ID

        // Placeholder values - replace with actual API call
        setProfileIdentifier('me');
        setLatestVersionId(undefined); // Will create first version on save
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className='edit-page'>
        <div className='edit-page__loading'>
          <div className='spinner' />
          <p>Loading editor...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error || !profileIdentifier) {
    return (
      <div className='edit-page'>
        <div className='edit-page__error'>
          <h2>Unable to load editor</h2>
          <p>{error ?? 'Profile not found'}</p>
          <Link href='/dashboard/profile' className='btn btn--secondary'>
            Back to Profile
          </Link>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className='edit-page'>
      {/* Navigation bar */}
      <nav className='edit-page__nav'>
        <Link
          href='/dashboard/profile'
          className='edit-page__back'
          onClick={(e) => {
            if (hasUnsavedChanges) {
              const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
              if (!confirmed) {
                e.preventDefault();
              }
            }
          }}
        >
          <ArrowLeftIcon className='w-4 h-4' />
          Back to Profile
        </Link>

        {hasUnsavedChanges && (
          <span className='edit-page__status'>
            <span className='edit-page__status-dot' />
            Unsaved changes
          </span>
        )}
      </nav>

      {/* Block Editor */}
      <div className='edit-page__editor'>
        <BlockEditor apiClient={api} profileIdentifier={profileIdentifier} initialVersionId={latestVersionId} />
      </div>

      <style>{styles}</style>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
    </svg>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = `
  .edit-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #ffffff;
  }
  
  .edit-page__nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .edit-page__back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    margin: -0.5rem -0.75rem;
    border-radius: 0.375rem;
    transition: color 0.15s ease, background 0.15s ease;
  }
  
  .edit-page__back:hover {
    color: #1f2937;
    background: #e5e7eb;
  }
  
  .edit-page__status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #b45309;
  }
  
  .edit-page__status-dot {
    width: 8px;
    height: 8px;
    background: #f59e0b;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .edit-page__editor {
    flex: 1;
    overflow: hidden;
  }
  
  .edit-page__loading,
  .edit-page__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
  }
  
  .edit-page__loading .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .edit-page__loading p {
    color: #6b7280;
  }
  
  .edit-page__error h2 {
    color: #dc2626;
    margin: 0 0 0.5rem;
  }
  
  .edit-page__error p {
    color: #6b7280;
    margin: 0 0 1.5rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s ease;
  }
  
  .btn--secondary {
    background: #f3f4f6;
    color: #1f2937;
  }
  
  .btn--secondary:hover {
    background: #e5e7eb;
  }
`;
