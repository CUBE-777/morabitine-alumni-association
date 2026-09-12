import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { submitMembershipRequest } from '../../services/supabase/publicContent.service';

const initialState = { name: '', phone: '', email: '', promo: '', track: '', message: '', botField: '' };

export default function MembershipForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // حماية بسيطة من الروبوتات (honeypot) — مطابقة للسلوك الأصلي
    if (values.botField) return;

    setSubmitting(true);
    const payload = {
      full_name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      promotion: values.promo.trim() || null,
      track: values.track || null,
      message: values.message.trim() || null,
    };

    try {
      await submitMembershipRequest(payload);
      navigate('/thank-you');
    } catch (err) {
      console.error('تعذر إرسال طلب الانخراط:', err);
      window.notify?.error(t('join.form.error'));
      setSubmitting(false);
    }
  };

  return (
    <form
      id="membershipForm"
      onSubmit={handleSubmit}
      style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.12)' }}
    >
      <p style={{ display: 'none' }}>
        <label>
          لا تعبئ هذا الحقل:
          <input name="botField" value={values.botField} onChange={handleChange} />
        </label>
      </p>
      <div className="form-row">
        <div>
          <label htmlFor="m-name">{t('join.form.name')}</label>
          <input
            id="m-name"
            name="name"
            type="text"
            placeholder={t('join.form.namePlaceholder')}
            value={values.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="m-phone">{t('join.form.phone')}</label>
          <input
            id="m-phone"
            name="phone"
            type="tel"
            placeholder={t('join.form.phonePlaceholder')}
            value={values.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label htmlFor="m-email">{t('join.form.email')}</label>
          <input
            id="m-email"
            name="email"
            type="email"
            placeholder={t('join.form.emailPlaceholder')}
            value={values.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="m-promo">{t('join.form.promo')}</label>
          <input
            id="m-promo"
            name="promo"
            type="text"
            placeholder={t('join.form.promoPlaceholder')}
            value={values.promo}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="full-row">
        <label htmlFor="m-track">{t('join.form.track')}</label>
        <select id="m-track" name="track" value={values.track} onChange={handleChange} required>
          <option value="" disabled>
            {t('join.form.trackPlaceholder')}
          </option>
          {t('join.form.tracks', { returnObjects: true }).map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>
      </div>
      <div className="full-row">
        <label htmlFor="m-message">{t('join.form.message')}</label>
        <textarea
          id="m-message"
          name="message"
          placeholder={t('join.form.messagePlaceholder')}
          value={values.message}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={submitting}>
        {submitting ? t('join.form.submitting') : t('join.form.submit')}
      </button>
    </form>
  );
}
