import '../styles/public-home.css';
import '../styles/people.css';
import '../styles/interior-page.css';
import InteriorHeader from '../components/layout/InteriorHeader';
import InteriorFooter from '../components/layout/InteriorFooter';
import Lightbox from '../components/common/Lightbox';

export default function InteriorLayout({ children }) {
  return (
    <>
      <InteriorHeader />
      {children}
      <InteriorFooter />
      <Lightbox />
    </>
  );
}
