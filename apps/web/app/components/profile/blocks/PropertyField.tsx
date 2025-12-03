'use client';

/**
 * PropertyField - Dynamic input renderer
 * TODO: This component needs to be rewritten for the new typed block system
 *
 * The old system used dynamic BlockProperty types that are no longer available
 * in the new typed, table-per-block approach.
 */

// ============================================================================
// Types
// ============================================================================

interface PropertyFieldProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function PropertyField({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: PropertyFieldProps) {
  return (
    <div className="property-field">
      <div className="property-field__notice">
        <p>This component needs to be rewritten for the new typed block system</p>
      </div>

      <style jsx>{`
        .property-field {
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
        }

        .property-field__notice {
          font-size: 0.875rem;
          color: #dc2626;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
