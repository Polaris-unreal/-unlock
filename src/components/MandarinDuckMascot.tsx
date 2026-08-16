import React from "react";

interface MascotProps {
  variant?: "couple" | "single" | "avatar" | "waving_mascot" | "celebrate";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const MandarinDuckMascot: React.FC<MascotProps> = ({
  variant = "couple",
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-40 h-40",
    xl: "w-56 h-56",
  }[size];

  if (variant === "waving_mascot") {
    return (
      <div className={`relative inline-flex items-center justify-center ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Background pastel glow */}
          <circle cx="100" cy="100" r="90" fill="#FEE2E2" fillOpacity="0.6" />
          <circle cx="100" cy="100" r="76" fill="#FFF1F2" />
          
          {/* Soft body */}
          <ellipse cx="100" cy="115" rx="55" ry="50" fill="#A7F3D0" />
          <ellipse cx="100" cy="118" rx="42" ry="38" fill="#FBCFE8" />
          
          {/* Heart on chest */}
          <path
            d="M 100,126 C 96,120 86,120 86,128 C 86,136 100,146 100,146 C 100,146 114,136 114,128 C 114,120 104,120 100,126 Z"
            fill="#FB7185"
          />

          {/* Ears */}
          <ellipse cx="65" cy="65" rx="14" ry="18" fill="#6EE7B7" transform="rotate(-20 65 65)" />
          <ellipse cx="65" cy="65" rx="8" ry="11" fill="#F472B6" transform="rotate(-20 65 65)" />
          <ellipse cx="135" cy="65" rx="14" ry="18" fill="#6EE7B7" transform="rotate(20 135 65)" />
          <ellipse cx="135" cy="65" rx="8" ry="11" fill="#F472B6" transform="rotate(20 135 65)" />

          {/* Head */}
          <circle cx="100" cy="85" r="48" fill="#A7F3D0" />
          
          {/* Cheeks */}
          <circle cx="76" cy="94" r="8" fill="#FDA4AF" fillOpacity="0.8" />
          <circle cx="124" cy="94" r="8" fill="#FDA4AF" fillOpacity="0.8" />

          {/* Eyes */}
          <circle cx="82" cy="82" r="5" fill="#1E293B" />
          <circle cx="84" cy="80" r="1.5" fill="#FFFFFF" />
          <circle cx="118" cy="82" r="5" fill="#1E293B" />
          <circle cx="120" cy="80" r="1.5" fill="#FFFFFF" />

          {/* Smile */}
          <path d="M 94,92 Q 100,98 106,92" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Waving Arm Right */}
          <path
            d="M 140,105 Q 165,85 160,70 Q 150,65 142,85"
            fill="#6EE7B7"
            stroke="#10B981"
            strokeWidth="2"
          />
          {/* Small Heart above hand */}
          <path
            d="M 165,65 C 163,60 155,60 155,67 C 155,73 165,80 165,80 C 165,80 175,73 175,67 C 175,60 167,60 165,65 Z"
            fill="#F43F5E"
          />

          {/* Left Hand holding chest */}
          <ellipse cx="60" cy="115" rx="10" ry="8" fill="#6EE7B7" transform="rotate(20 60 115)" />
        </svg>
      </div>
    );
  }

  if (variant === "single") {
    return (
      <div className={`relative inline-flex items-center justify-center ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Subtle background shadow circle */}
          <circle cx="100" cy="100" r="90" fill="#FFF7ED" />
          
          {/* Duck body */}
          <path
            d="M 60,110 C 60,70 110,60 140,90 C 160,110 160,150 120,160 C 80,170 50,150 60,110 Z"
            fill="#FB923C"
          />
          {/* Duck breast light cream */}
          <path
            d="M 90,120 C 90,145 110,160 130,155 C 115,140 100,120 90,120 Z"
            fill="#FED7AA"
          />
          {/* Duck head with crest */}
          <path
            d="M 120,80 C 130,55 105,45 85,55 C 75,60 70,75 80,90 C 90,105 115,95 120,80 Z"
            fill="#F97316"
          />
          {/* Teal crest highlight */}
          <path
            d="M 90,52 C 105,42 125,50 125,65 C 115,62 100,58 90,52 Z"
            fill="#2DD4BF"
          />
          {/* Beak */}
          <path
            d="M 125,75 L 150,82 L 126,88 Z"
            fill="#E11D48"
          />
          {/* Eye */}
          <circle cx="105" cy="72" r="5" fill="#1E293B" />
          <circle cx="107" cy="70" r="1.5" fill="#FFFFFF" />

          {/* Heart on wing */}
          <path
            d="M 95,115 C 90,105 75,105 75,118 C 75,130 95,145 95,145 C 95,145 115,130 115,118 C 115,105 100,105 95,115 Z"
            fill="#E11D48"
          />
          {/* Wing plumage teal & gold */}
          <path
            d="M 65,120 C 50,115 45,135 60,145 C 65,140 70,130 65,120 Z"
            fill="#0D9488"
          />
        </svg>
      </div>
    );
  }

  // Default: Mandarin Duck Couple forming Heart (원앙 커플)
  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 280 240" className="w-full h-full overflow-visible">
        {/* Soft Warm Halo Background */}
        <ellipse cx="140" cy="120" rx="125" ry="105" fill="#FFF1F2" fillOpacity="0.85" />
        <ellipse cx="140" cy="115" rx="105" ry="85" fill="#FFE4E6" fillOpacity="0.5" />

        {/* Heart shaped floral backdrop */}
        <path
          d="M 140,55 C 130,25 90,25 75,55 C 55,95 140,150 140,150 C 140,150 225,95 205,55 C 190,25 150,25 140,55 Z"
          fill="#FECDD3"
          fillOpacity="0.45"
        />

        {/* Floating Mini Hearts */}
        <path
          d="M 140,25 C 137,18 128,18 128,26 C 128,34 140,42 140,42 C 140,42 152,34 152,26 C 152,18 143,18 140,25 Z"
          fill="#E11D48"
          className="animate-pulse"
        />
        <circle cx="65" cy="55" r="3" fill="#F43F5E" fillOpacity="0.6" />
        <circle cx="215" cy="55" r="3" fill="#F43F5E" fillOpacity="0.6" />
        <circle cx="140" cy="8" r="2" fill="#FB7185" />

        {/* LEFT DUCK (Male Mandarin - Colorful Vibrant) */}
        <g id="male-duck">
          {/* Body */}
          <path
            d="M 70,140 C 60,110 95,95 125,120 C 135,130 140,165 110,180 C 80,185 65,165 70,140 Z"
            fill="#FB923C"
          />
          {/* Belly blue */}
          <path
            d="M 75,150 C 70,170 95,185 115,175 C 105,160 85,150 75,150 Z"
            fill="#38BDF8"
          />
          {/* Fan feathers / sail feathers (Orange & Teal) */}
          <path
            d="M 50,135 C 35,115 55,95 75,115 C 65,125 55,130 50,135 Z"
            fill="#F97316"
          />
          <path
            d="M 60,145 C 45,135 55,125 70,135 Z"
            fill="#0D9488"
          />
          {/* Neck orange crest */}
          <path
            d="M 95,95 C 105,80 120,85 130,105 C 120,115 105,110 95,95 Z"
            fill="#EA580C"
          />
          {/* Head & Crown Teal */}
          <path
            d="M 105,80 C 100,60 125,50 135,68 C 140,78 135,90 120,88 Z"
            fill="#0284C7"
          />
          {/* Crown feather stripe */}
          <path
            d="M 95,68 C 108,55 128,62 130,72 C 115,68 105,68 95,68 Z"
            fill="#F43F5E"
          />
          {/* Eye - smiling happy curve */}
          <path d="M 120,74 Q 125,68 130,74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheerful rosy cheek */}
          <circle cx="127" cy="83" r="5" fill="#FDA4AF" />
          {/* Beak touching right beak */}
          <path
            d="M 135,76 L 143,80 L 134,84 Z"
            fill="#E11D48"
          />
        </g>

        {/* RIGHT DUCK (Female Mandarin - Elegant Soft Tones) */}
        <g id="female-duck">
          {/* Body */}
          <path
            d="M 210,140 C 220,110 185,95 155,120 C 145,130 140,165 170,180 C 200,185 215,165 210,140 Z"
            fill="#D97706"
          />
          {/* Belly soft cream */}
          <path
            d="M 205,150 C 210,170 185,185 165,175 C 175,160 195,150 205,150 Z"
            fill="#FEF3C7"
          />
          {/* Wing spotted pattern */}
          <path
            d="M 230,135 C 245,115 225,95 205,115 C 215,125 225,130 230,135 Z"
            fill="#B45309"
          />
          <circle cx="215" cy="130" r="2.5" fill="#FEF3C7" />
          <circle cx="222" cy="122" r="2" fill="#FEF3C7" />
          <circle cx="205" cy="140" r="2.5" fill="#FEF3C7" />

          {/* Neck */}
          <path
            d="M 185,95 C 175,80 160,85 150,105 C 160,115 175,110 185,95 Z"
            fill="#92400E"
          />
          {/* Head */}
          <path
            d="M 175,80 C 180,60 155,50 145,68 C 140,78 145,90 160,88 Z"
            fill="#78716C"
          />
          {/* Crown feather stripe */}
          <path
            d="M 185,68 C 172,55 152,62 150,72 C 165,68 175,68 185,68 Z"
            fill="#A8A29E"
          />
          {/* Eye - smiling happy curve */}
          <path d="M 160,74 Q 155,68 150,74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheerful rosy cheek */}
          <circle cx="153" cy="83" r="5" fill="#FDA4AF" />
          {/* Beak touching left beak */}
          <path
            d="M 145,76 L 137,80 L 146,84 Z"
            fill="#E11D48"
          />
        </g>

        {/* Small sparkling heart between beaks */}
        <path
          d="M 140,71 C 138,66 132,66 132,72 C 132,77 140,82 140,82 C 140,82 148,77 148,72 C 148,66 142,66 140,71 Z"
          fill="#BE123C"
        />

        {/* Green Leaf Wreath around bottom */}
        <path
          d="M 80,185 Q 140,205 200,185"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="100" cy="192" rx="7" ry="3.5" fill="#34D399" transform="rotate(-15 100 192)" />
        <ellipse cx="140" cy="198" rx="8" ry="4" fill="#34D399" />
        <ellipse cx="180" cy="192" rx="7" ry="3.5" fill="#34D399" transform="rotate(15 180 192)" />
      </svg>
    </div>
  );
};
