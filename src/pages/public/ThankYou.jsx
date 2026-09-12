import { Link } from 'react-router-dom';
import '../../styles/thank-you.css';

export default function ThankYou() {
  return (
    <div className="thank-you-box-wrap">
      <div className="box">
        <div className="icon">✓</div>
        <h1>شكراً لتواصلكم معنا</h1>
        <p>تم استلام رسالتكم بنجاح، وسنقوم بالرد عليكم عبر بريدكم الإلكتروني في أقرب وقت ممكن.</p>
        <Link to="/">العودة للموقع الرئيسي</Link>
      </div>
    </div>
  );
}
