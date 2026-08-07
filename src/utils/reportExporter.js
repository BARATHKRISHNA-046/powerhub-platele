// Utility to export submission monitoring tables to CSV / Excel readable format
export const exportSubmissionReportCSV = (records, filename = `powerhub_habit_submission_report_${new Date().toISOString().split('T')[0]}.csv`) => {
  if (!records || records.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = ['Student Name', 'Domain', 'Date', '7 PM Study', '11 PM Submission', 'Overall Status', 'Consecutive Streak'];
  const rows = records.map(r => [
    `"${r.studentName}"`,
    `"${r.domain}"`,
    `"${r.dateStr}"`,
    `"${r.studyDone ? 'Completed' : 'Pending'}"`,
    `"${r.submitDone ? 'Submitted' : (r.isMissed ? 'Missed' : 'Pending')}"`,
    `"${r.status}"`,
    `"${r.streak} Days"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
