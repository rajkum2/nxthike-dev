import { useContext, useState } from "react";
import Modal from "react-responsive-modal";
import { UserContext } from "../../context/LoginContext";

export default function ContactModal({ first }) {
  const [open, setOpen] = useState(true);
  const { setContact } = useContext(UserContext);
  return (
    <Modal
      center
      open={open}
      onClose={() => {
        setOpen(false);
        setContact(false);
      }}
      classNames={{
        overlay: "customOverlay",
      }}
      closeIcon={<div></div>}
    >
      {first ? (
        <>
          <h3 className="text-success">Thanks for Contacting NxtHike.</h3>
          <h3 className="text-success">Our team will revert back soon.</h3>
        </>
      ) : (
        <h3 className="text-success">
          Our representative will contact you soon.
        </h3>
      )}
    </Modal>
  );
}
