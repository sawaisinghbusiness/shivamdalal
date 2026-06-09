import Icon from '../components/Icon';

export default function Placeholder({ title, sub }) {
  return (
    <div className="page placeholder">
      <div className="placeholder-ic"><Icon name="clipboard" size={34} /></div>
      <h2>{title}</h2>
      <p>{sub}</p>
      <small>Ye screen abhi banana baaki hai (demo)</small>
    </div>
  );
}
