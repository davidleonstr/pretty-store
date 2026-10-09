import { Link } from 'react-router-dom';

export default function NotFound({ what = 'esa página', back = '/' }) {
  return (
    <div className="sketch p-8 text-center space-y-4 max-w-lg mx-auto">
      <p className="text-6xl" aria-hidden="true">🙈</p>
      <h1 className="h-title text-3xl">No encontramos {what}</h1>
      <p>Puede que el nombre haya cambiado o ya no esté disponible.</p>
      <Link to={back} className="btn btn-deep">
        Volver
      </Link>
    </div>
  );
}

      
