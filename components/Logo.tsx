export default function Logo({ id }: { id?: string }) {
  return (
    <span className="logo-word" id={id}>
      gl
      <span className="eyes">
        <span className="eye"><span className="pupil" /></span>
        <span className="eye"><span className="pupil" /></span>
      </span>
      p
    </span>
  );
}
