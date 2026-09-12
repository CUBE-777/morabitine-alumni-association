import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { submitContactMessage } from '../../services/supabase/publicContent.service';

const initialState = { name: '', promo: '', email: '', message: '', botField: '' };

export default function ContactForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.botField) return;
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: values.name,
        promo: values.promo,
        email: values.email,
        message: values.message,
      });
      navigate('/thank-you');
    } catch (err) {
      console.error('تعذر إرسال الرسالة:', err);
      window.notify?.error('تعذر إرسال الرسالة، حاول مرة أخرى.');
      setSubmitting(false);
    }
  };

  return (
    <form id="contactForm" name="contact" onSubmit={handleSubmit}>
      <p style={{ display: 'none' }}>
        <label>
          لا تعبئ هذا الحقل:
          <input name="botField" value={values.botField} onChange={handleChange} />
        </label>
      </p>
      <div className="form-row">
        <div>
          <label htmlFor="name">{t('contact.form.name')}</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder={t('contact.form.namePlaceholder')}
            value={values.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="promo">{t('contact.form.promo')}</label>
          <input
            id="promo"
            name="promo"
            type="text"
            placeholder={t('contact.form.promoPlaceholder')}
            value={values.promo}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="full-row">
        <label htmlFor="email">{t('contact.form.email')}</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={t('contact.form.emailPlaceholder')}
          value={values.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="full-row">
        <label htmlFor="message">{t('contact.form.message')}</label>
        <textarea
          id="message"
          name="message"
          placeholder={t('contact.form.messagePlaceholder')}
          value={values.message}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={submitting}>
        {t('contact.form.submit')}
      </button>
      <p className="form-note">{t('contact.form.note')}</p>
    </form>
  );
}
