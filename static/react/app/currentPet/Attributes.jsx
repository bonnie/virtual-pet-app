function Attributes(props) {
  const { pet } = props;

  return (
    <Modal modalID="pet-attributes" modalBnText="ATTRIBUTES">
      <PetDisplay pet={pet} />
    </Modal>
  );
}

Attributes.propTypes = {
  pet: PropTypes.obj.isRequired,
};
