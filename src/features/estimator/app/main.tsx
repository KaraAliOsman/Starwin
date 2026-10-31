import { createRoot } from 'react-dom/client';
import StarwinEstimator from './Estimator';
import '../src/styles/tokens.css';
import '../src/features/canvas/canvas.css';
import './style.css';
createRoot(document.getElementById('root')!).render(<StarwinEstimator/>);
