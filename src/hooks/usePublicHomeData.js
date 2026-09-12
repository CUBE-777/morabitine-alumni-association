import { useEffect, useState } from 'react';
import {
  fetchPublishedActivities,
  fetchGalleryItems,
  fetchSiteSettings,
  fetchSiteContent,
  fetchActiveAnnouncement,
} from '../services/supabase/publicContent.service';

/**
 * يكرر بالضبط سلوك الصفحة الأصلية: كل استعلام مستقل تمامًا عن الآخر (Promise
 * منفصلة)، وفشل أحدها لا يمنع ظهور نتائج البقية ولا يكسر الصفحة — فقط يُسجَّل
 * في console.error ويبقى المحتوى الاحتياطي (fallback) كما هو.
 */
export function usePublicHomeData() {
  const [activities, setActivities] = useState(null); // null = لم يحمَّل بعد → استخدم fallback
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({});
  const [content, setContent] = useState({});
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    let alive = true;

    fetchPublishedActivities()
      .then((data) => alive && data.length && setActivities(data))
      .catch((err) => console.error('تعذر تحميل الأنشطة:', err));

    fetchGalleryItems()
      .then((data) => alive && setGallery(data))
      .catch((err) => console.error('تعذر تحميل صور المعرض:', err));

    fetchSiteSettings()
      .then((data) => alive && setSettings(data))
      .catch((err) => console.error('تعذر تحميل الإعدادات العامة:', err));

    fetchSiteContent()
      .then((data) => alive && setContent(data))
      .catch((err) => console.error('تعذر تحميل محتوى الصفحة:', err));

    fetchActiveAnnouncement()
      .then((data) => alive && setAnnouncement(data))
      .catch((err) => console.error('تعذر تحميل الإعلانات:', err));

    return () => {
      alive = false;
    };
  }, []);

  return { activities, gallery, settings, content, announcement };
}
