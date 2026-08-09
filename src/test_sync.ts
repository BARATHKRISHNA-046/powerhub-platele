import { runDualDeviceSyncVerification } from './lib/verifySync';

async function main() {
  console.log('🚀 Running Powerhub Architecture Rule 6 Dual-Device Sync Verification...');
  const result = await runDualDeviceSyncVerification();
  console.log('\n--- VERIFICATION RESULTS ---');
  console.log('Profiles Dual-Device Match:', result.profilesMatch ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Announcements Dual-Device Match:', result.announcementsMatch ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Teams Dual-Device Match:', result.teamsMatch ? 'PASSED ✅' : 'FAILED ❌');

  if (result.profilesMatch && result.announcementsMatch && result.teamsMatch) {
    console.log('\n🎉 ALL DUAL-DEVICE SYNC TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SYNC DISCREPANCY DETECTED!');
    process.exit(1);
  }
}

main();
