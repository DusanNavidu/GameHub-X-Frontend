// src/utils/imageUtils.ts (අලුතෙන් හදන ෆයිල් එකක්)

export const getBlurredImageUrl = (url: string): string => {
  if (!url || !url.includes("cloudinary.com")) return url; // Cloudinary ලින්ක් එකක් නොවේ නම් ඒකම යවනවා
  
  // URL එක `/upload/` කියන කෑල්ලෙන් කඩනවා
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  
  // Transformation කෑල්ල මැදට දානවා: blur, quality very low, width small
  const transformation = "/upload/e_blur:800,q_auto:low,w_100,c_scale/";
  return parts[0] + transformation + parts[parts.length-1];
};