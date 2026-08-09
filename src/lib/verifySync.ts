import { fetchProfilesFromSupabase, fetchAnnouncementsFromSupabase, fetchTeamsFromSupabase } from './supabase';

/**
 * Simulates two independent "devices" (two separate fetch/query calls with zero shared state)
 * for profiles, announcements, and teams, confirming they return identical data.
 */
export async function runDualDeviceSyncVerification(): Promise<{
  profilesMatch: boolean;
  announcementsMatch: boolean;
  teamsMatch: boolean;
  deviceA: any;
  deviceB: any;
}> {
  console.log('🧪 [Dual-Device Sync Verification] Initiating Device A independent query...');
  const [profilesA, annA, teamsA] = await Promise.all([
    fetchProfilesFromSupabase(),
    fetchAnnouncementsFromSupabase(),
    fetchTeamsFromSupabase()
  ]);

  console.log('🧪 [Dual-Device Sync Verification] Initiating Device B independent query...');
  const [profilesB, annB, teamsB] = await Promise.all([
    fetchProfilesFromSupabase(),
    fetchAnnouncementsFromSupabase(),
    fetchTeamsFromSupabase()
  ]);

  const profilesMatch = JSON.stringify(profilesA) === JSON.stringify(profilesB);
  const announcementsMatch = JSON.stringify(annA) === JSON.stringify(annB);
  const teamsMatch = JSON.stringify(teamsA) === JSON.stringify(teamsB);

  console.log('✅ Profiles Dual-Device Match:', profilesMatch);
  console.log('✅ Announcements Dual-Device Match:', announcementsMatch);
  console.log('✅ Teams Dual-Device Match:', teamsMatch);

  return {
    profilesMatch,
    announcementsMatch,
    teamsMatch,
    deviceA: { profiles: profilesA, announcements: annA, teams: teamsA },
    deviceB: { profiles: profilesB, announcements: annB, teams: teamsB }
  };
}
