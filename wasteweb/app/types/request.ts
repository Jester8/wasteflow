export interface RequestItem {
  id: string;
  title: string;
  location: string;
  status: string;
  contractorName?: string;
  operatorName?: string;
  destinationLat?: number;
  destinationLng?: number;
  liveLocation?: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    updatedAt: { seconds: number } | null;
  };
}