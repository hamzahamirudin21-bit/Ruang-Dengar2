import React from 'react';
import { ComicCameraMotion } from './comicIntroData';
import { computeCameraTransformStyle } from './IntroTimeline';

export interface ComicCameraProps {
  motion: ComicCameraMotion;
  beatProgress: number;
  reducedMotion?: boolean;
  children: React.ReactNode;
}

export const ComicCamera: React.FC<ComicCameraProps> = ({
  motion,
  beatProgress,
  reducedMotion = false,
  children,
}) => {
  const style = computeCameraTransformStyle(motion, beatProgress, reducedMotion);
  return (
    <div
      className="comic-intro-camera relative h-full w-full transition-transform duration-150 ease-out will-change-transform"
      style={style}
      data-camera-motion={motion}
    >
      {children}
    </div>
  );
};
