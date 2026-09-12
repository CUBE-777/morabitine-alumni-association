import '../styles/public-home.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Lightbox from '../components/common/Lightbox';
import AnnouncementBar from '../components/layout/AnnouncementBar';

export default function PublicLayout({ children, brandName, copyright, announcement }) {
  return (
    <>
      <AnnouncementBar announcement={announcement} />
      <Header brandName={brandName} />
      <main>{children}</main>
      <Footer brandName={brandName} copyright={copyright} />
      <Lightbox />
    </>
  );
}
