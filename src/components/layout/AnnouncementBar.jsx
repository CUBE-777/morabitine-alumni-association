import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { safeUrl } from '../../utils/sanitize';

export default function AnnouncementBar({ announcement }) {
  const { t } = useTranslation();
  const [closed, setClosed] = useState(false);
  if (!announcement || closed) return null;

  const link = safeUrl(announcement.link);

  return (
    <div id="announcementBar" className="announcement-bar">
      <span>{announcement.text}</span>
      {link && (
        <a href={link} className="announcement-bar-link">
          {t('common.detailsLink')}
        </a>
      )}
      <button
        aria-label={t('common.closeAnnouncement')}
        className="announcement-bar-close"
        onClick={() => setClosed(true)}
      >
        ×
      </button>
    </div>
  );
}
