// Elke game wordt pas geladen als iemand hem opent (code-splitting).
export const LOADERS = {
  reactie: () => import('./reactie'),
  memo: () => import('./memo'),
  stapelslijm: () => import('./stapelslijm'),
  bubbelbots: () => import('./bubbelbots'),
  klikkerklok: () => import('./klikkerklok'),
  blubberblast: () => import('./blubberblast'),
  gloopiegolf: () => import('./gloopiegolf'),
  mepdeblob: () => import('./mepdeblob'),
  gloopiezegt: () => import('./gloopiezegt'),
  ruimte: () => import('./ruimte'),
  popper: () => import('./popper'),
  gloopfusie: () => import('./gloopfusie'),
};
