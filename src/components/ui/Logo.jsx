import React from 'react';

export const Logo = ({ className = "w-8 h-8", classNameText="text-xl" }) => {
  return (
    <div className="flex items-center gap-2">
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2Z"
          className="fill-stone-900 stroke-stone-800"
          strokeWidth="1"
        />
        <path
          d="M10 12C10 12 11.5 18 16 18C20.5 18 22 12 22 12"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="1.5" className="fill-stone-950" />
        <path
          d="M16 21V24"
          className="stroke-stone-700"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M22 6L25 9"
          className="stroke-stone-800"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 9L10 6"
          className="stroke-stone-800"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={`font-bold text-white tracking-tight ${classNameText}`}>
        MindNest
      </span>
    </div>
  );
};
