import React, { ComponentType } from 'react';
import { ArgosTracker, ArgosTrackerProps } from './ArgosTracker';

export interface WithImpressionTrackingProps
  extends Omit<ArgosTrackerProps, 'id'> {
  impressionId: string;
}

export function withImpressionTracking<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithImpressionTrackingComponent({
    impressionId,
    type,
    metadata,
    onTrack,
    onError,
    trackOnMount,
    trackOnUpdate,
    ...props
  }: P & WithImpressionTrackingProps) {
    return (
      <>
        <ArgosTracker
          id={impressionId}
          type={type}
          metadata={metadata}
          onTrack={onTrack}
          onError={onError}
          trackOnMount={trackOnMount}
          trackOnUpdate={trackOnUpdate}
        />
        <WrappedComponent {...(props as P)} />
      </>
    );
  };
}
