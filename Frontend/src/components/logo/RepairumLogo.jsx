import React from "react";

const RepairumLogo = ({ 
  width = "48", 
  height = "48", 
  className = "", 
  variant = "default" 
}) => {
  const logoColors = {
    default: {
      primary: "#4F46E5", // indigo-600
      secondary: "#6366F1", // indigo-500
      accent: "#818CF8",   // indigo-400
      text: "#1E293B"      // slate-900
    },
    light: {
      primary: "#FFFFFF",
      secondary: "#E2E8F0",
      accent: "#F1F5F9",
      text: "#FFFFFF"
    },
    dark: {
      primary: "#1E293B",
      secondary: "#334155",
      accent: "#475569",
      text: "#FFFFFF"
    }
  };

  const colors = logoColors[variant] || logoColors.default;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill={colors.primary} fillOpacity="0.1"/>
      
      {/* Main repair tool icon - wrench/spanner */}
      <g transform="translate(12, 12)">
        {/* Wrench body */}
        <path
          d="M4 4 L8 8 L10 6 L6 2 C5.5 1.5 4.5 1.5 4 2 L2 4 C1.5 4.5 1.5 5.5 2 6 L6 10 L8 8 L4 4 Z"
          fill={colors.primary}
          stroke={colors.primary}
          strokeWidth="0.5"
        />
        
        {/* Wrench head */}
        <path
          d="M8 2 L10 4 L12 2 L10 0 C9.5 0 8.5 0 8 0.5 L8 2 Z"
          fill={colors.secondary}
        />
        
        {/* Repair spark/circuit lines */}
        <path
          d="M14 6 L16 4 M16 8 L18 6 M18 10 L20 8"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Central gear/cog */}
        <circle cx="10" cy="10" r="3" fill="none" stroke={colors.primary} strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="1" fill={colors.primary}/>
        
        {/* Gear teeth */}
        <path
          d="M10 7 L10 5 M10 15 L10 13 M7 10 L5 10 M15 10 L13 10 M8 8 L6.5 6.5 M12 12 L13.5 13.5 M12 8 L13.5 6.5 M8 12 L6.5 13.5"
          stroke={colors.primary}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      
      {/* "R" letter integration */}
      <text
        x="30"
        y="32"
        font-family="Arial Black, sans-serif"
        font-size="14"
        font-weight="900"
        fill={colors.text}
      >
        R
      </text>
    </svg>
  );
};

export default RepairumLogo;
