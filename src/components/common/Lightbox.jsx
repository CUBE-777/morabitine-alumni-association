import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * منفذ 1:1 لسلوك "Lightbox Script" في index.html الأصلي: يستمع لأي نقرة على
 * صورة داخل `#gallery img, .gallery-card img, .gallery-grid img` في كامل
 * المستند، ويفتح معاينة مكبّرة مع تنقل بالأسهم/الكيبورد وإغلاق بـ Escape أو
 * النقر خارج الصورة.
 */
export default function Lightbox() {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const imagesRef = useRef([]);
  const modalRef = useRef(null);

  const showImage = useCallback((i) => {
    const imgs = imagesRef.current;
    if (!imgs.length) return;
    let next = i;
    if (next < 0) next = imgs.length - 1;
    if (next >= imgs.length) next = 0;
    setIndex(next);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      const img = e.target.closest('#gallery img, .gallery-card img, .gallery-grid img');
      if (!img) return;
      const imgs = Array.from(document.querySelectorAll('#gallery img, .gallery-card img, .gallery-grid img'));
      imagesRef.current = imgs;
      const i = imgs.indexOf(img);
      if (i !== -1) {
        setIndex(i);
        setActive(true);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const onKeydown = (e) => {
      if (!active) return;
      if (e.key === 'Escape') setActive(false);
      if (e.key === 'ArrowRight') showImage(index - 1);
      if (e.key === 'ArrowLeft') showImage(index + 1);
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [active, index, showImage]);

  const currentImg = imagesRef.current[index];
  const caption = currentImg ? currentImg.alt || currentImg.getAttribute('data-caption') || '' : '';
  const showCaption = caption && caption !== 'صورة المعرض';

  return (
    <div
      className={`lightbox-modal${active ? ' active' : ''}`}
      id="lightboxModal"
      ref={modalRef}
      onClick={(e) => {
        if (e.target === modalRef.current) setActive(false);
      }}
    >
      <button className="lightbox-close" aria-label="إغلاق" onClick={() => setActive(false)}>
        &times;
      </button>
      <button className="lightbox-prev" aria-label="الصورة السابقة" onClick={() => showImage(index - 1)}>
        ❯
      </button>
      <img className="lightbox-content" src={currentImg ? currentImg.src : ''} alt="معاينة الصورة" />
      <div className="lightbox-caption" style={{ display: showCaption ? 'block' : 'none' }}>
        {caption}
      </div>
      <button className="lightbox-next" aria-label="الصورة التالية" onClick={() => showImage(index + 1)}>
        ❮
      </button>
    </div>
  );
}
