import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import './SubHeader.css';

export default function SubHeader({ title, sub, right }) {
  const nav = useNavigate();
  return (
    <div className="subheader">
      <button className="sub-back" onClick={() => nav(-1)}><Icon name="back" size={18} /></button>
      <div className="sub-titles">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right && <div className="sub-right">{right}</div>}
    </div>
  );
}
