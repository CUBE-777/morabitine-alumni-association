export default function Modal({ children, onClose }) {
  return (
    <div
      className="admin-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal-box">{children}</div>
    </div>
  );
}
