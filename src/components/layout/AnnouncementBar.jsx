import { useState } from 'react';
import { safeUrl } from '../../utils/sanitize';

export default function AnnouncementBar({ announcement }) {
  const [closed, setClosed] = useState(false);
  if (!announcement || closed) return null;

  const link = safeUrl(announcement.link);

  return (
    <div id="announcementBar" dir="rtl" className="announcement-bar">
      <span>{announcement.text}</span>
      {link && (
        <a href={link} className="announcement-bar-link">
          التفاصيل ←
        </a>
      )}
      <button aria-label="إغلاق الإعلان" className="announcement-bar-close" onClick={() => setClosed(true)}>
        ×
      </button>
    </div>
  );
}
