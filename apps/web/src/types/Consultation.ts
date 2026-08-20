export interface BookingData {
  serviceType: string;
  date: string;
  timeSlot: string;
  userInfo: {
    name: string;
    phone: string;
  };
}