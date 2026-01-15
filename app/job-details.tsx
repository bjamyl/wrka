import {
  ArrivedActionsBar,
  BadgeGroup,
  CustomerInfoCard,
  JobDescription,
  JobDetailsError,
  JobDetailsHeader,
  JobDetailsSkeleton,
  LocationInfo,
  LocationMap,
  PendingActionsBar,
  PhotosGallery,
  ScheduledTimeCard,
  TRACKING_STATUSES,
} from "@/components/jobs/job-details";
import JobInProgressCard from "@/components/jobs/JobInProgressCard";
import StartJobSheet from "@/components/jobs/StartJobSheet";
import { HandymanTrackingControls } from "@/components/tracking";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import { useJobDetails } from "@/hooks/useJobDetails";
import { useStartJobStore } from "@/lib/state/jobs";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JobDetails() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const { setShowStartJob, isStarting } = useStartJobStore();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;

  const {
    request,
    isLoading,
    error,
    isProcessing,
    isAccepting,
    isDeclining,
    handleAcceptJob,
    handleDeclineJob,
    handleCancelJob,
    handleJobFinished,
    handleTrackingStatusChange,
  } = useJobDetails(requestId);

  if (isLoading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !request) {
    return <JobDetailsError />;
  }

  const hasValidCoordinates = request.location_lat && request.location_lng;
  const showPendingActions = request.status === "pending";
  const showArrivedActions = request.status === "arrived";
  const showTrackingControls = TRACKING_STATUSES.includes(request.status);
  const isInProgress = request.status === "in_progress";
  const hasBottomBar = showPendingActions || showArrivedActions;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <JobDetailsHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: hasBottomBar ? 120 : 20 }}
      >
        {isInProgress && request.started_at && (
          <View className="pt-6">
            <JobInProgressCard
              requestId={request.id}
              startedAt={request.started_at}
              onJobFinished={handleJobFinished}
            />
          </View>
        )}

        <View className="px-6 pt-6">
          <BadgeGroup
            category={request.category}
            priority={request.priority}
            status={request.status}
          />

          <LocationInfo
            title={request.title}
            locationAddress={request.location_address}
            createdAt={request.created_at}
          />

          {request.scheduled_time && (
            <ScheduledTimeCard scheduledTime={request.scheduled_time} />
          )}

          {request.customer && <CustomerInfoCard customer={request.customer} />}
        </View>

        {request.photos && request.photos.length > 0 && (
          <PhotosGallery
            photos={request.photos}
            onPhotoPress={setSelectedPhotoIndex}
          />
        )}

        <View className="px-6">
          <JobDescription description={request.description} />

          {hasValidCoordinates && (
            <LocationMap
              latitude={request.location_lat}
              longitude={request.location_lng}
              title={request.title}
              address={request.location_address}
            />
          )}

          {showTrackingControls && hasValidCoordinates && (
            <HandymanTrackingControls
              bookingId={request.id}
              status={request.status}
              destinationLat={request.location_lat}
              destinationLng={request.location_lng}
              destinationAddress={request.location_address}
              onStatusChange={handleTrackingStatusChange}
            />
          )}
        </View>
      </ScrollView>

      {showPendingActions && (
        <PendingActionsBar
          onAccept={handleAcceptJob}
          onDecline={handleDeclineJob}
          isProcessing={isProcessing}
          isAccepting={isAccepting}
          isDeclining={isDeclining}
        />
      )}

      {showArrivedActions && (
        <ArrivedActionsBar
          onStartJob={() => setShowStartJob(true)}
          onCancel={handleCancelJob}
          isProcessing={isProcessing}
          isStarting={isStarting}
        />
      )}

      <StartJobSheet requestId={request.id} />

      <PhotoViewerModal
        photos={request.photos || []}
        selectedIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
      />
    </SafeAreaView>
  );
}
