'use client';

/**
 * Profile Overview Page
 * Read-only view of profile blocks with edit link
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProfileBlocksApi } from '@/lib/hooks/useProfileBlocks';
import { BlockType, VersionBlockDetail } from '@monolenz/types/entities';

export default function ProfilePage() {
  const api = useProfileBlocksApi();
  const [blocks, setBlocks] = useState<VersionBlockDetail[]>([]);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        
        // Load block types for display names
        const types = await api.listBlockTypes();
        setBlockTypes(types);
        
        // For now, we'll need to get the user's latest version
        // This would typically come from a profile endpoint
        // TODO: Add endpoint to get user's latest version ID
        
        // Placeholder: show empty state for now
        setBlocks([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [api]);

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-page__error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-page__header">
        <div className="profile-page__title">
          <h1>My Profile</h1>
          <p className="profile-page__subtitle">
            Your professional identity across all platforms
          </p>
        </div>
        
        <Link href="/dashboard/profile/edit" className="btn btn--primary">
          <EditIcon className="w-4 h-4" />
          Edit Profile
        </Link>
      </header>

      {/* Content */}
      <main className="profile-page__content">
        {blocks.length === 0 ? (
          <EmptyState />
        ) : (
          <BlocksGrid blocks={blocks} />
        )}
      </main>

      <style jsx>{styles}</style>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <ProfileIcon className="w-16 h-16" />
      </div>
      <h2>Your profile is empty</h2>
      <p>Start building your professional identity by adding blocks for your experience, skills, education, and more.</p>
      <Link href="/dashboard/profile/edit" className="btn btn--primary btn--lg">
        Get Started
      </Link>
      
      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          max-width: 480px;
          margin: 0 auto;
        }
        
        .empty-state__icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #4f46e5;
        }
        
        .empty-state h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem;
        }
        
        .empty-state p {
          color: #6b7280;
          margin: 0 0 2rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

interface BlocksGridProps {
  blocks: VersionBlockDetail[];
}

function BlocksGrid({ blocks }: BlocksGridProps) {
  // Group blocks by category
  const byCategory = new Map<string, VersionBlockDetail[]>();
  
  for (const block of blocks) {
    const category = block.block_type_category ?? 'other';
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(block);
  }

  return (
    <div className="blocks-grid">
      {Array.from(byCategory.entries()).map(([category, categoryBlocks]) => (
        <section key={category} className="block-category">
          <h2 className="block-category__title">
            {formatCategoryName(category)}
          </h2>
          
          <div className="block-category__items">
            {categoryBlocks.map((block) => (
              <BlockPreview key={block.block_id} block={block} />
            ))}
          </div>
        </section>
      ))}
      
      <style jsx>{`
        .blocks-grid {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        
        .block-category__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .block-category__items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}

interface BlockPreviewProps {
  block: VersionBlockDetail;
}

function BlockPreview({ block }: BlockPreviewProps) {
  const title = getBlockTitle(block);
  const subtitle = getBlockSubtitle(block);
  const dates = getBlockDates(block);

  return (
    <article className="block-preview">
      <div className="block-preview__header">
        <span className="block-preview__type">{block.block_type_display_name}</span>
        {!block.is_visible && (
          <span className="block-preview__hidden" title="Hidden from public profile">
            <EyeOffIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      
      <h3 className="block-preview__title">{title}</h3>
      
      {subtitle && (
        <p className="block-preview__subtitle">{subtitle}</p>
      )}
      
      {dates && (
        <p className="block-preview__dates">{dates}</p>
      )}
      
      <style jsx>{`
        .block-preview {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        
        .block-preview:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .block-preview__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .block-preview__type {
          font-size: 0.75rem;
          font-weight: 500;
          color: #4f46e5;
          background: #eef2ff;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        
        .block-preview__hidden {
          color: #9ca3af;
        }
        
        .block-preview__title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem;
        }
        
        .block-preview__subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.5rem;
        }
        
        .block-preview__dates {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }
      `}</style>
    </article>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatCategoryName(category: string): string {
  return category
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBlockTitle(block: VersionBlockDetail): string {
  const data = block.data;
  return String(
    data.title || 
    data.name || 
    data.company_name || 
    data.institution || 
    data.organization_name ||
    data.skill_name ||
    block.block_type_display_name
  );
}

function getBlockSubtitle(block: VersionBlockDetail): string | null {
  const data = block.data;
  return (
    data.job_title ||
    data.degree ||
    data.issuing_organization ||
    data.publisher ||
    data.proficiency_level ||
    null
  ) as string | null;
}

function getBlockDates(block: VersionBlockDetail): string | null {
  const data = block.data;
  const start = data.start_date || data.issue_date || data.date_awarded;
  const end = data.end_date;
  const current = data.is_current;
  
  if (!start) return null;
  
  const startStr = formatDate(start as string);
  if (current) return `${startStr} - Present`;
  if (end) return `${startStr} - ${formatDate(end as string)}`;
  return startStr;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// Icons
// ============================================================================

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = `
  .profile-page {
    min-height: 100%;
    background: #f9fafb;
  }
  
  .profile-page__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .profile-page__title h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem;
  }
  
  .profile-page__subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
  
  .profile-page__content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .profile-page__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #6b7280;
  }
  
  .profile-page__loading .spinner {
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
  
  .profile-page__error {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .profile-page__error h2 {
    color: #dc2626;
    margin: 0 0 0.5rem;
  }
  
  .profile-page__error p {
    color: #6b7280;
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
  
  .btn--primary {
    background: #4f46e5;
    color: white;
  }
  
  .btn--primary:hover {
    background: #4338ca;
  }
  
  .btn--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;