import React from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

export default function Field({
  label,
  required,
  tooltip,
  children,
}: FieldProps) {
  return (
    <div className="field">
      <label>
        {label} {required && <span className="required">*</span>}
        {tooltip && (
          <span className="tooltip-wrapper">
            <span className="tooltip-icon">ⓘ</span>
            <span className="tooltip-text">{tooltip}</span>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
