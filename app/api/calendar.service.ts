import api from "./axios-instance";
interface BackendResponse {
  message: string;
  data?: any;
}
export const syncCalendarData = async (googleAccessToken: string) => {
  console.log("gogoleAces",googleAccessToken)
  return await api.post('/profile/calendar/sync', {}, {
    headers: {
      'X-Google-Token': googleAccessToken 
    }
  }) as unknown as BackendResponse;;
};